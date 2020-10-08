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

    // A payable account held by the contract
    // (Either collateral or borrower payment)
    struct Account {
        // The value of the account.
        uint value;
        // Whether the value has been deposited.
        bool deposited;
    }

    // A participant in the contract
    // (either the lender or the borrower)
    struct Participant {
        // Address of the participant.
        address payable addr;
        // Collateral account for the party.
        Account collateral;
        // Whether the party has signed the contract.
        bool signedContract;
        // Whether the party is ready to resolve the 
        // contract.
        bool readyToResolve;
    }

    // The participants in the contract.
    Participant public lender;
    Participant public borrower;
    // Map from addresses to participants.
    mapping (address => Participant) participantMap;

    // Payment account for borrower
    Account public payment;

    // Forwarding address for if the contract is nuked.
    // For the contract to be effective,
    // neither party should have control of this
    // forwarding address.
    address payable public forwardingAddress;

    // Initialize a blank contract
    constructor() public {
        contractState = State.Blank;

        lender.readyToResolve = false;
        lender.signedContract = false;
        borrower.readyToResolve = false;
        borrower.signedContract = false;
    }

    // Specify contract parameters
    // (addresses of parties involved,
    //  account values)
    function specifyContract(address payable lenderAddr, 
	                     address payable borrowerAddr,
                             address payable forwardingAddr,
                             uint paymentAmount, 
                             uint lenderCollateralAmount, 
                             uint borrowerCollateralAmount) external {
        
        require(contractState == State.Blank);
        contractState = State.Prepare;

        // Set addresses
        lender.addr = lenderAddr;
        borrower.addr = borrowerAddr;
        forwardingAddress = forwardingAddr;
        
        // Set contract values
        lender.collateral.value = lenderCollateralAmount;
        borrower.collateral.value = borrowerCollateralAmount;
        payment.value = paymentAmount;

        // Set deposited to true if the amount is zero
        lender.collateral.deposited = lenderCollateralAmount == 0;
        borrower.collateral.deposited = borrowerCollateralAmount == 0;
        payment.deposited = paymentAmount == 0;

        // Create participant mapping
        participantMap[lenderAddr] = lender;
        participantMap[borrowerAddr] = borrower;
    }


    // Deposit collateral into the contract.
    // Can only be done in the prepare stage.
    function depositCollateral() external payable {
        require(contractState == State.Prepare);
        require(msg.value < 1e60);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
	    require(participantMap[msg.sender].collateral.value > 0,
		"Collateral value is zero");
        require(!participantMap[msg.sender].collateral.deposited, 
                "Collateral already deposited");
        require(msg.value == participantMap[msg.sender].collateral.value, 
                "Amount added not equal to collateral value");
    
        participantMap[msg.sender].collateral.deposited = true;
    }

    // Withdraw collateral from the contract.
    // Can only be done before the contract has
    // been enforced, or after it has been resolved.
    function withdrawCollateral() external {
        require(contractState == State.Prepare ||
                contractState == State.Resolved);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        require(participantMap[msg.sender].collateral.deposited,
                "Collateral has not been deposited yet");
        require(participantMap[msg.sender].collateral.value > 0,
                "Collateral value is zero");

        participantMap[msg.sender].collateral.deposited = false;
        participantMap[msg.sender].addr.transfer(participant.collateral.value); 
    }

    // Deposit payment into the contract for borrower.
    // Can only be done in the prepare stage.
    function depositPayment() external payable {
        require(contractState == State.Prepare);
        require(msg.value < 1e60);
        require(msg.sender == borrower.addr);
        require(payment.value > 0,
		"Payment value is zero");
        require(!payment.deposited,
		"Payment already deposited");
        require(msg.value == payment.value,
	        "Amount added not equal to payment value");

        payment.deposited = true;
    }

    // Withdraw payment from the contract for borrower.
    // Can only be done in the prepare stage.
    function withdrawPayment() external {
        require(contractState == State.Prepare);
        require(msg.sender == borrower.addr);
        require(payment.deposited,
		"Payment has not been deposited yet");
        require(payment.value > 0,
		"Payment value is zero");
    
        payment.deposited = false;
        borrower.addr.transfer(payment.value);
    }

    // Allows party to sign the contract.
    // Both lender and borrower have to sign the contract
    // before it can be enforced.
    function signContract() external {
        require(contractState == State.Prepare);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        
        participantMap[msg.sender].signedContract = true;
    }

    // Remove signature from contract.
    // This can only be done before the contract
    // is enforced.
    function removeSignatureFromContract() external {
        require(contractState == State.Prepare);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);

        participantMap[msg.sender].signedContract = false;
    }

    // Check whether the contract is ready for enforcement
    // (payments have been made, both parties have signed)
    function doesContractMeetExecutionCriteria() private view 
        returns (bool) {
        require(contractState == State.Prepare,
		"Contract has already executed.");
        
	// Check payments
        require(borrower.collateral.deposited,
		"Borrower has not desposited collateral");
        require(lender.collateral.deposited,
		"Lender has not desposited collateral");
        require(payment.deposited,
		"Payment has not been deposited");
        
	// Check signatures
        require(lender.signedContract, 
		"Lender has not signed contract.");
        require(borrower.signedContract,
		"Borrower has not signed contract");

        return true;
    }

    // Set contract to be enforced.
    function lockContract() external payable {
        require(contractState == State.Prepare);
        require(doesContractMeetExecutionCriteria());
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
    
        // Contract is now locked, execute payment to lender.
        contractState == State.Locked;
        payment.deposited = false;
        if (payment.value > 0) {
            lender.addr.transfer(payment.value);
        }
    }

    // Nuke contract can be done by either party.
    // Once this is done, parties are no longer
    // able to retrieve thier collateral.
    function nukeContract() external {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
    
        contractState = State.Nuked;

	// Send collaterals to forwarding address
        borrower.collateral.deposited = false;
        lender.collateral.deposited = false;
        uint totalCollateral = borrower.collateral.value + lender.collateral.value;
        if (totalCollateral > 0) {
            forwardingAddress.transfer(totalCollateral);
        }
    }

    // Either lender or borrower can mark the
    // contract as ready to be resolved.
    function userReadyToResolve() external {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);

        participantMap[msg.sender].readyToResolve = true;
    }

    // Remove ready to resolve state for party.
    function userUndoReadyToResolve() external {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);

        participantMap[msg.sender].readyToResolve = false;   
    }

    // When both members are ready to resolve the
    // contract, it can be marked as resolved,
    // allowing parties to retrieve thier collateral.
    function resolveContract() external {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        require(lender.readyToResolve);
        require(borrower.readyToResolve);
    
        contractState = State.Resolved;
    }

    // Checks whether the contract is okay to
    // be destroyed, and destroy it.
    function destroyContract() external {
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        // Don't allow the contract to be destroyed
        // if it's being enforced.
        require(contractState != State.Locked,
                "Contract is being enforced");
        // Don't allow contract to be destroyed
        // if not all value has been retrieved.
        bool valueInContract = 
            (lender.collateral.deposited && 
             lender.collateral.value > 0) || 
            (borrower.collateral.deposited &&
             borrower.collateral.value > 0) ||
            (payment.deposited &&
             payment.value > 0);
        require(!valueInContract,
		"Not all value withdrawn from contract");
        // Destroy contract.
        selfdestruct(forwardingAddress);
    }:

}
