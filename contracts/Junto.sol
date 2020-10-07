// Specifies the version of Solidity, using semantic versioning.
// Learn more: https://solidity.readthedocs.io/en/v0.5.10/layout-of-source-files.html#pragma
pragma solidity ^0.6.8;

// Defines a smart collateral contract where both parties put collateral up. If the contract is unsuccessful
// then the money gets forwarded to an agreed upon address. If successful, everyone gets their collateral
// back. The contract also includes a payment option from the borrower to the lender.
contract Junto {
    
    enum State { Prepare, Locked, Nuked, Resolved }
    State public contractState = State.Prepare;

    struct Account {
        uint value;
        bool deposited;
    }

    struct Participant {
        address payable addr;
        Account collateral;
        bool signedContract;
        bool readyToResolve;
    }

    Participant lender;
    Participant borrower;
    mapping (address => Participant) participantMap;

    Account payment;
    address payable forwardingAddress;

    constructor(address payable lenderAddr, 
                address payable borrowerAddr,
                address payable forwardingAddr,
                uint paymentAmount, 
                uint lenderCollateralAmount, 
                uint borrowerCollateralAmount) public {
        
        contractState = State.Prepare;
        lender.addr = lenderAddr;
        borrower.addr = borrowerAddr;
        forwardingAddress = forwardingAddr;
        
        lender.readyToResolve = false;
        lender.signedContract = false;
        borrower.readyToResolve = false;
        borrower.signedContract = false;
        
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

    function depositCollateral() public payable {
        require(contractState == State.Prepare);
        require(msg.value < 1e60);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        Participant storage participant = participantMap[msg.sender];
        require(!participant.collateral.deposited, "Collateral already deposited");
        require(msg.value == participant.collateral.value, "Amount added not equal to collateral value");
    
        participant.collateral.deposited = true;
    }

    function withdrawCollateral() public {
        require(contractState == State.Prepare ||
                contractState == State.Resolved);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        Participant storage participant = participantMap[msg.sender];
        require(participant.collateral.deposited);

        participant.collateral.deposited = false;
        participant.addr.transfer(participant.collateral.value); 
    }

    function depositPayment() public payable {
        require(contractState == State.Prepare);
        require(msg.value < 1e60);
        require(msg.sender == borrower.addr);
        require(msg.value == payment.value);
        require(!payment.deposited);

        payment.deposited = true;
    }

    function withdrawPayment() public {
        require(contractState == State.Prepare);
        require(msg.sender == borrower.addr);
        require(payment.deposited);
    
        payment.deposited = false;
        borrower.addr.transfer(payment.value);
    }

    function signContract() public {
        require(contractState == State.Prepare);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        Participant storage participant = participantMap[msg.sender];
        require(participant.collateral.deposited);

        participant.signedContract = true;
    }

    function removeSignatureFromContract() public {
        require(contractState == State.Prepare);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        Participant storage participant = participantMap[msg.sender];

        participant.signedContract = false;
    }

    function doesContractMeetExecutionCriteria() private view 
        returns (bool) {
        require(contractState == State.Prepare, "Contract has already executed.");
        require(borrower.collateral.deposited, "Borrower has not desposited collateral");
        require(lender.collateral.deposited, "Lender has not desposited collateral");
        require(payment.deposited, "Payment has not been deposited");
        require(lender.signedContract, "Lender has not signed contract.");
        require(borrower.signedContract, "Borrower has not signed contract");

        return true;
    }

    function lockContract() public payable {
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

    function nukeContract() public payable {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
    
        contractState = State.Nuked;
        borrower.collateral.deposited = false;
        lender.collateral.deposited = false;
        uint totalCollateral = borrower.collateral.value + lender.collateral.value;
        if (totalCollateral > 0) {
            forwardingAddress.transfer(totalCollateral);
        }
    }

    function userReadyToResolve() public {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);

        Participant storage participant = participantMap[msg.sender];
        participant.readyToResolve = true;
    }

    function userUndoReadyToResolve() public {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);

        Participant storage participant = participantMap[msg.sender];
        participant.readyToResolve = false;   
    }

    function resolveContract() public {
        require(contractState == State.Locked);
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        require(lender.readyToResolve);
        require(borrower.readyToResolve);
    
        contractState = State.Resolved;
    }

    function destroyContract() public {
        require(msg.sender == lender.addr ||
                msg.sender == borrower.addr);
        bool valueInContract = 
            lender.collateral.deposited || 
            borrower.collateral.deposited ||
            payment.deposited;
        require(contractState == State.Nuked ||
                (contractState == State.Prepare &&
                 !valueInContract) ||
                (contractState == State.Resolved &&
                 !valueInContract),
                "Contract is not ready to be destroyed");
        selfdestruct(forwardingAddress);
    }

}

