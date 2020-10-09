// Specifies the version of Solidity, using semantic versioning.
// Learn more: https://solidity.readthedocs.io/en/v0.5.10/layout-of-source-files.html#pragma
pragma solidity ^0.6.8;

pragma experimental ABIEncoderV2;

// Defines a smart collateral contract where both parties put collateral up. If the contract is unsuccessful
// then the money gets forwarded to an agreed upon address. If successful, everyone gets their collateral
// back. The contract also includes a payment option from the borrower to the lender.

contract Junto {
    
    // The possible states of a Junto contract.
    enum State { 
        // A blank Junto contract.
        Blank, 
        // Contract is waiting for signatures and deposits.
        Prepare, 
        // Contract is enforced until resolved or nuked.                    
        Locked,
        // Either party has nuked the contract. 
        Nuked,
        // Both parties have resolved the contract.
        Resolved 
    }
    
    State public contractState;

    // Lender State
    address payable public lenderAddr;
    bool public lenderSignedContract;
    bool public lenderReadyToResolve;

    // Borrower State
    address payable public borrowerAddr;
    bool public borrowerSignedContract;
    bool public borrowerReadyToResolve;

    // Lender Collateral Account
    uint public lenderCollateralValue;
    bool public lenderCollateralDeposited;

    // Borrower Collateral Account
    uint public borrowerCollateralValue;
    bool public borrowerCollateralDeposited;

    // Borrower Payment Account
    uint public borrowerPaymentValue;
    bool public borrowerPaymentDeposited;

    // Forwarding address for if the contract is nuked.
    // For the contract to be effective,
    // neither party should have control of this
    // forwarding address.
    address payable public forwardingAddr;

    // Initialize a blank contract
    constructor() public {
        contractState = State.Blank;

        lenderSignedContract = false;
        lenderReadyToResolve = false;
        borrowerSignedContract = false;
        borrowerReadyToResolve = false;
    }

    // Specify contract parameters
    // (addresses of parties involved, account values)
    // Account amounts are in wei
    function specifyContract(address payable lenderAddress, 
	                         address payable borrowerAddress,
                             address payable forwardingAddress,
                             uint lenderCollateralAmount, 
                             uint borrowerCollateralAmount,
                             uint borrowerPaymentAmount) external {
        
        require(contractState == State.Blank);
        contractState = State.Prepare;

        // Set addresses
        lenderAddr = lenderAddress;
        borrowerAddr = borrowerAddress;
        forwardingAddr = forwardingAddress;
        
        // Set contract values
        lenderCollateralValue = lenderCollateralAmount;
        borrowerCollateralValue = borrowerCollateralAmount;
        borrowerPaymentValue = borrowerPaymentAmount;

        // Set deposited to true if the amount is zero
        lenderCollateralDeposited = lenderCollateralAmount == 0;
        borrowerCollateralDeposited = borrowerCollateralAmount == 0;
        borrowerPaymentDeposited = borrowerPaymentAmount == 0;
    }

    function lenderDepositCollateral() external payable {
        require(contractState == State.Prepare);
        require(msg.value < 1e60);
        require(msg.sender == lenderAddr);
	    require(lenderCollateralValue > 0,
		        "Collateral value is zero");
        require(!lenderCollateralDeposited, 
                "Collateral already deposited");
        require(msg.value == lenderCollateralValue, 
                "Amount added not equal to collateral value");
    
        lenderCollateralDeposited = true;
    }

    function borrowerDepositCollateral() external payable {
        require(contractState == State.Prepare);
        require(msg.value < 1e60);
        require(msg.sender == borrowerAddr);
	    require(borrowerCollateralValue > 0,
		        "Collateral value is zero");
        require(!borrowerCollateralDeposited, 
                "Collateral already deposited");
        // require(msg.value == borrowerCollateralValue, 
        //         "Amount added not equal to collateral value");
        borrowerCollateralValue = msg.value;
        borrowerCollateralDeposited = true;
    }

    function borrowerDepositPayment() external payable {
        require(contractState == State.Prepare);
        require(msg.value < 1e60);
        require(msg.sender == borrowerAddr);
	    require(borrowerPaymentValue > 0,
		        "Collateral value is zero");
        require(!borrowerPaymentDeposited, 
                "Collateral already deposited");
        require(msg.value == borrowerPaymentValue, 
                "Amount added not equal to collateral value");
    
        borrowerPaymentDeposited = true;
    }

    function lenderWithdrawCollateral() external {
        require(contractState == State.Prepare ||
                contractState == State.Resolved);
        require(msg.sender == lenderAddr);
        require(lenderCollateralValue > 0,
                "Collateral value is zero");
        require(lenderCollateralDeposited,
                "Collateral has not been deposited yet");

        lenderCollateralDeposited = false;
        lenderAddr.transfer(lenderCollateralValue); 
    }

    function borrowerWithdrawCollateral() external {
        require(contractState == State.Prepare ||
                contractState == State.Resolved);
        require(msg.sender == borrowerAddr);
        require(borrowerCollateralValue > 0,
                "Collateral value is zero");
        require(borrowerCollateralDeposited,
                "Collateral has not been deposited yet");

        borrowerCollateralDeposited = false;
        borrowerAddr.transfer(borrowerCollateralValue); 
    }

    function borrowerWithdrawPayment() external {
        require(contractState == State.Prepare);
        require(msg.sender == borrowerAddr);
        require(borrowerPaymentValue > 0,
                "Collateral value is zero");
        require(borrowerPaymentDeposited,
                "Collateral has not been deposited yet");

        borrowerPaymentDeposited = false;
        borrowerAddr.transfer(borrowerPaymentValue); 
    }

    function lenderSignContract() external {
        require(contractState == State.Prepare);
        require(msg.sender == lenderAddr);
        
        lenderSignedContract = true;
    }

    function borrowerSignContract() external {
        require(contractState == State.Prepare);
        require(msg.sender == borrowerAddr);
        
        borrowerSignedContract = true;
    }

    function lenderRemoveSignatureFromContract() external {
        require(contractState == State.Prepare);
        require(msg.sender == lenderAddr);

        lenderSignedContract = false;
    }

    function borrowerRemoveSignatureFromContract() external {
        require(contractState == State.Prepare);
        require(msg.sender == borrowerAddr);

        borrowerSignedContract = false;
    }

    // Check whether the contract is ready for enforcement
    // (payments have been made, both parties have signed)
    function doesContractMeetExecutionCriteria() private view 
        returns (bool) {
        require(contractState == State.Prepare,
		    "Contract has already executed.");
        
	    // Check payments
        require(lenderCollateralDeposited,
		    "Lender has not desposited collateral");
        require(borrowerCollateralDeposited,
		    "Borrower has not desposited collateral");
        require(borrowerPaymentDeposited,
		    "Borrower has not deposited payment");
        
	    // Check signatures
        require(lenderSignedContract, 
		    "Lender has not signed contract.");
        require(borrowerSignedContract,
		    "Borrower has not signed contract");

        return true;
    }

    // Set contract to be enforced.
    function lockContract() external payable {
        require(contractState == State.Prepare);
        require(doesContractMeetExecutionCriteria());
        require(msg.sender == lenderAddr ||
                msg.sender == borrowerAddr);
    
        // Contract is now locked, execute payment to lender.
        contractState == State.Locked;
        if (borrowerPaymentValue > 0) {
            borrowerPaymentDeposited = false;
            lenderAddr.transfer(borrowerPaymentValue);
        }
    }

    // Nuke contract can be done by either party.
    // Once this is done, parties are no longer
    // able to retrieve thier collateral.
    function nukeContract() external {
        require(contractState == State.Locked);
        require(msg.sender == lenderAddr ||
                msg.sender == borrowerAddr);
    
        contractState = State.Nuked;

	    // Send collaterals to forwarding address
        borrowerCollateralDeposited = false;
        lenderCollateralDeposited = false;
        uint totalCollateral = borrowerCollateralValue + lenderCollateralValue;
        if (totalCollateral > 0) {
            forwardingAddr.transfer(totalCollateral);
        }
    }

    // Either lender or borrower can mark the
    // contract as ready to be resolved.
    function lenderSetReadyToResolve() external {
        require(contractState == State.Locked);
        require(msg.sender == lenderAddr);

        lenderReadyToResolve = true;
    }

    function borrowerSetReadyToResolve() external {
        require(contractState == State.Locked);
        require(msg.sender == borrowerAddr);

        borrowerReadyToResolve = true;
    }

    function lenderUndoReadyToResolve() external {
        require(contractState == State.Locked);
        require(msg.sender == lenderAddr);

        lenderReadyToResolve = false;
    }

    function borrowerUndoReadyToResolve() external {
        require(contractState == State.Locked);
        require(msg.sender == borrowerAddr);

        borrowerReadyToResolve = false;
    }

    // When both members are ready to resolve the
    // contract, it can be marked as resolved,
    // allowing parties to retrieve thier collateral.
    function resolveContract() external {
        require(contractState == State.Locked);
        require(msg.sender == lenderAddr ||
                msg.sender == borrowerAddr);
        require(lenderReadyToResolve);
        require(borrowerReadyToResolve);
    
        contractState = State.Resolved;
    }

    // Checks whether the contract is okay to
    // be destroyed, and destroy it.
    function destroyContract() external {
        require(msg.sender == lenderAddr ||
                msg.sender == borrowerAddr);
        // Don't allow the contract to be destroyed
        // if it's being enforced.
        require(contractState != State.Locked,
                "Contract is being enforced");
        // Don't allow contract to be destroyed
        // if not all value has been retrieved.
        bool valueInContract = 
            (lenderCollateralDeposited && 
             lenderCollateralValue > 0) || 
            (borrowerCollateralDeposited &&
             borrowerCollateralValue > 0) ||
            (borrowerPaymentDeposited &&
             borrowerPaymentValue > 0);
        require(!valueInContract,
		    "Not all value withdrawn from contract");
        // Destroy contract.
        selfdestruct(forwardingAddr);
    }

}
