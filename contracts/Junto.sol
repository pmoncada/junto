// Specifies the version of Solidity, using semantic versioning.
// Learn more: https://solidity.readthedocs.io/en/v0.5.10/layout-of-source-files.html#pragma
pragma solidity ^0.6.8;

pragma experimental ABIEncoderV2;

// Defines a smart collateral contract where both parties put collateral up. If the contract is unsuccessful
// then the money gets forwarded to an agreed upon address. If successful, everyone gets their collateral
// back. The contract also includes a payment option from the borrower to the lender at the beginning execution
// of the contract, and also at the end of the contract.
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
    uint256 public lenderCollateralValue;
    bool public lenderCollateralDeposited;

    // Borrower Collateral Account
    uint256 public borrowerCollateralValue;
    bool public borrowerCollateralDeposited;

    // Borrower Initial Payment Account
    uint256 public borrowerInitialPaymentValue;
    bool public borrowerInitialPaymentDeposited;
    
    // Borrower Final Payment Account
    uint256 public borrowerFinalPaymentValue;
    bool public borrowerFinalPaymentDeposited;

    // Lender Final Payment Account
    uint256 public lenderFinalPaymentValue;
    bool public lenderFinalPaymentDeposited;

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

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Specify contract parameters
    // (addresses of parties involved, account values)
    // Account amounts are in wei
    function specifyContract(address payable lenderAddress, 
	                         address payable borrowerAddress,
                             address payable forwardingAddress,
                             uint256 lenderCollateralAmount, 
                             uint256 borrowerCollateralAmount,
                             uint256 borrowerInitialPaymentAmount,
                             uint256 borrowerFinalPaymentAmount,
                             uint256 lenderFinalPaymentAmount) external {
        require(contractState == State.Blank);
        // TODO: These should be commented back in after UI testing:
        //require(lenderAddress != borrowerAddress);
        //require(lenderAddress != forwardingAddress);
        require(lenderCollateralAmount < 1e60);
        require(borrowerCollateralAmount < 1e60);
        require(borrowerInitialPaymentAmount < 1e60);
        require(borrowerFinalPaymentAmount < 1e60);
        require(lenderFinalPaymentAmount < 1e60);

        contractState = State.Prepare;

        // Set addresses
        lenderAddr = lenderAddress;
        borrowerAddr = borrowerAddress;
        forwardingAddr = forwardingAddress;
        
        // Set contract values
        lenderCollateralValue = lenderCollateralAmount;
        borrowerCollateralValue = borrowerCollateralAmount; 
        borrowerInitialPaymentValue = borrowerInitialPaymentAmount;
        borrowerFinalPaymentValue = borrowerFinalPaymentAmount;
        lenderFinalPaymentValue = lenderFinalPaymentAmount;

        // Set deposited to true if the amount is zero
        lenderCollateralDeposited = lenderCollateralAmount == 0;
        borrowerCollateralDeposited = borrowerCollateralAmount == 0;
        borrowerInitialPaymentDeposited = borrowerInitialPaymentAmount == 0;
        borrowerFinalPaymentDeposited = borrowerFinalPaymentAmount == 0;
        lenderFinalPaymentDeposited = lenderFinalPaymentAmount == 0;
    }

    // Tells us that they are ready to execute the contract.
    // This function will deposit the collateral of signer.
    // If the borrower has also signed the contract, then the 
    // contract will move to the locked state.
    function signContract() external payable {
        require(contractState == State.Prepare,
                "Cannot sign the contract in this state.");
        require(msg.sender == lenderAddr || 
                msg.sender == borrowerAddr, 
                "Only the lender/borrower can call this function");
        require(msg.value < 1e60);
        
        // Deposit the collateral + payment and sign the contract for lender
        if (msg.sender == lenderAddr) {
            require(msg.value == lenderCollateralValue + lenderFinalPaymentValue, 
                "Amount added not equal to lender collateral value");
            if (lenderCollateralValue > 0) {    
                lenderDepositCollateral();
            }
            if (lenderFinalPaymentValue > 0) {
                lenderDepositFinalPayment();
            }
            lenderSignedContract = true;
        }

        // Deposit the collateral + payment and sign the contract for borrower
        if (msg.sender == borrowerAddr) {
            require(
                msg.value == borrowerCollateralValue + 
                    borrowerInitialPaymentValue + borrowerFinalPaymentValue,
                "Amount added not equal to borrower collateral and payment value");
            if (borrowerCollateralValue > 0) {
                borrowerDepositCollateral();
            }
            if (borrowerInitialPaymentValue > 0) {
                borrowerDepositInitialPayment();
            }
            if (borrowerFinalPaymentValue > 0) {
                borrowerDepositFinalPayment();
            }
            borrowerSignedContract = true;
        }

        // If both have signed, lock the contract
        if (borrowerSignedContract && lenderSignedContract) {
            lockContract();
        }
    }

    function removeSignatureFromContract() external {
        require(contractState == State.Prepare, 
            "Cannot remove signature at this stage");
        require(msg.sender == lenderAddr || msg.sender == borrowerAddr,
            "Only the lender/borrower can call this function");
        
        if (msg.sender == lenderAddr) {
            if (lenderCollateralDeposited && lenderCollateralValue > 0) {
                lenderWithdrawCollateral();
            }
            if (lenderFinalPaymentDeposited && lenderFinalPaymentValue > 0) {
                lenderWithdrawFinalPayment();
            }
            lenderSignedContract = false;
        }

        if (msg.sender == borrowerAddr) {
            if (borrowerCollateralDeposited && borrowerCollateralValue > 0) {
                borrowerWithdrawCollateral();
            }
            if (borrowerInitialPaymentDeposited && borrowerInitialPaymentValue > 0) {
                borrowerWithdrawInitialPayment();
            }
            if (borrowerFinalPaymentDeposited && borrowerFinalPaymentValue > 0) {
                borrowerWithdrawFinalPayment();
            }
            borrowerSignedContract = false;
        } 
    }

    // Either lender or borrower can mark the
    // contract as ready to be resolved.
    function setReadyToResolve() external {
        require(contractState == State.Locked);
        require(
            msg.sender == lenderAddr || msg.sender == borrowerAddr,
            "Only the lender/borrower can call this function");
        
        // Set ready to resolve to true
        if (msg.sender == lenderAddr) {
            lenderReadyToResolve = true;
        }
        if (msg.sender == borrowerAddr) {
            borrowerReadyToResolve = true;
        }
        
        if (borrowerReadyToResolve && lenderReadyToResolve) {
            resolveContract();
        }
    }

    function undoReadyToResolve() external {
        require(contractState == State.Locked);
        require(
            msg.sender == lenderAddr || msg.sender == borrowerAddr,
            "Only the lender/borrower can call this function");

        // Set ready to resolve to true
        if (msg.sender == lenderAddr) {
            lenderReadyToResolve = false;
        }
        if (msg.sender == borrowerAddr) {
            borrowerReadyToResolve = false;
        }
    }

    // Nuke contract can be done by either party.
    // Once this is done, parties are no longer
    // able to retrieve thier collateral.
    function nukeContract() external {
        require(contractState == State.Locked,
                "Cannot nuke contract in this state.");
        require(msg.sender == lenderAddr ||
                msg.sender == borrowerAddr, 
                "This address cannot call nukeContract");
    
        contractState = State.Nuked;

	    // Send collaterals to forwarding address
        borrowerCollateralDeposited = false;
        lenderCollateralDeposited = false;
        lenderFinalPaymentDeposited = false;
        borrowerFinalPaymentDeposited = false;
        uint totalValueInContract = borrowerCollateralValue + lenderCollateralValue + 
            borrowerFinalPaymentValue + lenderFinalPaymentValue;
        if (totalValueInContract > 0) {
            forwardingAddr.transfer(totalValueInContract);
        }
    }

    // Checks whether the contract is okay to
    // be destroyed, and destroy it.
    function destroyContract() external {
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
            (borrowerInitialPaymentDeposited &&
             borrowerInitialPaymentValue > 0) ||
            (borrowerFinalPaymentDeposited &&
             borrowerFinalPaymentValue > 0) ||
            (lenderFinalPaymentDeposited &&
             lenderFinalPaymentValue > 0);
        require(!valueInContract,
		    "Not all value withdrawn from contract");
        // Destroy contract.
        selfdestruct(forwardingAddr);
    }

    // These funcitons are all private functions below this line  

    function lenderDepositCollateral() private {
        require(contractState == State.Prepare,
                "Cannot call function in this state");
	    require(lenderCollateralValue > 0,
		        "Collateral value is zero");
        require(!lenderCollateralDeposited, 
                "Collateral already deposited");
    
        lenderCollateralDeposited = true;
    }

    function borrowerDepositCollateral() private {
        require(contractState == State.Prepare,
                "Cannot call function in this state");
	    require(borrowerCollateralValue > 0,
		        "Collateral value is zero");
        require(!borrowerCollateralDeposited, 
                "Collateral already deposited");
        borrowerCollateralDeposited = true;
    }

    function borrowerDepositInitialPayment() private {
        require(contractState == State.Prepare,
                "Cannot call function in this state");
	    require(borrowerInitialPaymentValue > 0,
		        "Collateral value is zero");
        require(!borrowerInitialPaymentDeposited, 
                "Collateral already deposited");
        borrowerInitialPaymentDeposited = true;
    }
    
    function borrowerDepositFinalPayment() private {
        require(contractState == State.Prepare,
                "Cannot call function in this state");
        require(borrowerFinalPaymentValue > 0,
                "Final borrower payment value is zero");
        require(!borrowerFinalPaymentDeposited, 
                "Final borrower payment already deposited");
        borrowerFinalPaymentDeposited = true;
    }

    function lenderDepositFinalPayment() private {
        require(contractState == State.Prepare,
                "Cannot call function in this state");
        require(lenderFinalPaymentValue > 0,
                "Final lender payment value is zero");
        require(!lenderFinalPaymentDeposited,
                "Final lender payment already deposited");
        lenderFinalPaymentDeposited = true;
    }

    function lenderWithdrawCollateral() private {
        require(contractState == State.Prepare ||
                contractState == State.Resolved,
                "Cannot call function in this state");
        require(lenderCollateralValue > 0,
                "Collateral value is zero");
        require(lenderCollateralDeposited,
                "Collateral has not been deposited yet");

        lenderCollateralDeposited = false;
        lenderAddr.transfer(lenderCollateralValue); 
    }

    function borrowerWithdrawCollateral() private {
        require(contractState == State.Prepare ||
                contractState == State.Resolved,
                "Cannot call function in this state");
        require(borrowerCollateralValue > 0,
                "Collateral value is zero");
        require(borrowerCollateralDeposited,
                "Collateral has not been deposited yet");

        borrowerCollateralDeposited = false;
        borrowerAddr.transfer(borrowerCollateralValue); 
    }

    function borrowerWithdrawInitialPayment() private {
        require(contractState == State.Prepare,
                "Cannot call function in this state");
        require(borrowerInitialPaymentValue > 0,
                "Collateral value is zero");
        require(borrowerInitialPaymentDeposited,
                "Collateral has not been deposited yet");

        borrowerInitialPaymentDeposited = false;
        borrowerAddr.transfer(borrowerInitialPaymentValue); 
    }

    function borrowerWithdrawFinalPayment() private {
        require(contractState == State.Prepare ||
                contractState == State.Nuked,
                "Cannot call function in this state");
        require(borrowerFinalPaymentValue > 0,
                "Borrower payment value is zero");
        require(borrowerFinalPaymentDeposited,
                "Borrower payment has not been deposited yet");

        borrowerFinalPaymentDeposited = false;
        borrowerAddr.transfer(borrowerFinalPaymentValue); 
    }

    function lenderWithdrawFinalPayment() private {
        require(contractState == State.Prepare ||
                contractState == State.Nuked,
                "Cannot call function in this state");
        require(lenderFinalPaymentValue > 0,
                "Lender payment value is zero");
        require(lenderFinalPaymentDeposited,
                "Lender payment has not been deposited yet");
        
        lenderFinalPaymentDeposited = false;
        lenderAddr.transfer(lenderFinalPaymentValue);
    }

    function makeFinalPayment() private {
        require(contractState == State.Resolved);
        if (borrowerFinalPaymentValue > 0) {
            require(borrowerFinalPaymentDeposited);
            borrowerFinalPaymentDeposited = false;
            lenderAddr.transfer(borrowerFinalPaymentValue);
        }
        if (lenderFinalPaymentValue > 0) {
            require(lenderFinalPaymentDeposited);
            lenderFinalPaymentDeposited = false;
            borrowerAddr.transfer(lenderFinalPaymentValue);
        }
    }

    // Set contract to be enforced.
    // Checks whether the contract is ready for enforcement
    // (payments have been made, both parties have signed)
    function lockContract() private {
        require(contractState == State.Prepare,
                "Cannot call function in this state");
        
        // Check payments
        require(lenderCollateralDeposited,
		    "Lender has not desposited collateral");
        require(borrowerCollateralDeposited,
		    "Borrower has not desposited collateral");
        require(borrowerInitialPaymentDeposited,
		    "Borrower has not deposited Initial payment");
        require(borrowerFinalPaymentDeposited,
            "Borrower has not deposited final payment");
        require(lenderFinalPaymentDeposited,
            "Lender has not deposited final payment");
        
	    // Check signatures
        require(lenderSignedContract, 
		    "Lender has not signed contract.");
        require(borrowerSignedContract,
		    "Borrower has not signed contract");
    
        // Contract is now locked, execute payment to lender.
        contractState = State.Locked;
        if (borrowerInitialPaymentValue > 0) {
            require(borrowerInitialPaymentDeposited);
            borrowerInitialPaymentDeposited = false;
            lenderAddr.transfer(borrowerInitialPaymentValue);
        }
    }

    // When both members are ready to resolve the
    // contract, it can be marked as resolved,
    // allowing parties to retrieve thier collateral.
    function resolveContract() private {
        require(contractState == State.Locked,
                "Cannot call function in this state");
        require(lenderReadyToResolve,
                "Lender is not ready to resolve");
        require(borrowerReadyToResolve,
                "Borrower is not ready to resolve");
    
        contractState = State.Resolved;
        lenderWithdrawCollateral();
        borrowerWithdrawCollateral();
        makeFinalPayment();
    }
}
