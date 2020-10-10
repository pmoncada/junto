import { ethers } from "@nomiclabs/buidler";
import chai from "chai";
import { deployContract, solidity} from "ethereum-waffle";
import JuntoArtifact from "../artifacts/Junto.json";
import { Junto } from "../typechain/Junto";
import { Wallet } from "ethers";
import { LookupAllOptions } from "dns";

chai.use(solidity);
const { expect } = chai;

describe("Junto", () => {

  let junto : Junto;
  let lender : any = 0;
  let borrower : any = 0;
  let forward : any = 0;
  let lenderAddr = "";
  let borrowerAddr = "";
  let forwardAddr = "";
  
  beforeEach(async () => {
    const [owner] = await ethers.getSigners();
    junto = (await deployContract(owner, JuntoArtifact)) as Junto;
    [lender, borrower, forward] = await ethers.getSigners();

    lenderAddr = await lender.getAddress();
    borrowerAddr = await borrower.getAddress();
    forwardAddr = await forward.getAddress();
    expect(await junto.contractState()).to.eq(0);
  });

  describe("prepare the contract", async () => {
    it("should set contract vars with collateral", async () => {
      expect(await junto.contractState()).to.eq(0);
      expect(await junto.lenderSignedContract()).to.eq(false);
      expect(await junto.lenderReadyToResolve()).to.eq(false);
      expect(await junto.borrowerSignedContract()).to.eq(false);
      expect(await junto.borrowerReadyToResolve()).to.eq(false);

      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);

      expect(await junto.contractState()).to.eq(1);
      expect(await junto.lenderAddr()).to.eq(lenderAddr);
      expect(await junto.borrowerAddr()).to.eq(borrowerAddr);
      expect(await junto.forwardingAddr()).to.eq(forwardAddr);
      expect(await junto.lenderCollateralValue()).to.eq(10);
      expect(await junto.borrowerCollateralValue()).to.eq(20);
      expect(await junto.borrowerPaymentValue()).to.eq(30);
      expect(await junto.lenderCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerPaymentDeposited()).to.eq(false);
    });

    it("should set contract without collateral", async () => {
      expect(await junto.contractState()).to.eq(0);
      expect(await junto.lenderSignedContract()).to.eq(false);
      expect(await junto.lenderReadyToResolve()).to.eq(false);
      expect(await junto.borrowerSignedContract()).to.eq(false);
      expect(await junto.borrowerReadyToResolve()).to.eq(false);

      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 0, 0, 0);

      expect(await junto.contractState()).to.eq(1);
      expect(await junto.lenderAddr()).to.eq(lenderAddr);
      expect(await junto.borrowerAddr()).to.eq(borrowerAddr);
      expect(await junto.forwardingAddr()).to.eq(forwardAddr);
      expect(await junto.lenderCollateralValue()).to.eq(0);
      expect(await junto.borrowerCollateralValue()).to.eq(0);
      expect(await junto.borrowerPaymentValue()).to.eq(0);
      expect(await junto.lenderCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerPaymentDeposited()).to.eq(true);
    });

    it("should sign contract for lender", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 0, 0);

      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.lenderCollateralDeposited()).to.eq(false);
      expect(await junto.lenderCollateralValue()).to.eq(10);
      expect(await junto.lenderSignedContract()).to.eq(false);
      expect(await junto.getBalance()).to.eq(0);

      await junto.connect(lender).signContract({value : 10});

      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.lenderCollateralDeposited()).to.eq(true);
      expect(await junto.lenderSignedContract()).to.eq(true);
      expect(await junto.getBalance()).to.eq(10);
    });

    it ("should sign contract for borrower", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 0, 10, 20);
      
      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.borrowerSignedContract()).to.eq(false);
      expect(await junto.getBalance()).to.eq(0);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerPaymentDeposited()).to.eq(false);
      
      await junto.connect(borrower).signContract({value : 30});

      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.borrowerSignedContract()).to.eq(true);
      expect(await junto.getBalance()).to.eq(30);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerPaymentDeposited()).to.eq(true);
    });

    it("should remove signature from contract for lender", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 0, 0);
      await junto.connect(lender).signContract({value : 10});

      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.getBalance()).to.eq(10);
      expect(await junto.lenderSignedContract()).to.eq(true);
      expect(await junto.lenderCollateralDeposited()).to.eq(true);

      await junto.connect(lender).removeSignatureFromContract();

      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.getBalance()).to.eq(0);
      expect(await junto.lenderSignedContract()).to.eq(false);
      expect(await junto.lenderCollateralDeposited()).to.eq(false);
    });

    it ("should remove signature from contract for borrower", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 0, 10, 20);
      await junto.connect(borrower).signContract({value : 30});

      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.borrowerSignedContract()).to.eq(true);
      expect(await junto.getBalance()).to.eq(30);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerPaymentDeposited()).to.eq(true);
      
      await junto.connect(borrower).removeSignatureFromContract();

      expect(await junto.contractState()).to.eq(1); // Prepare state
      expect(await junto.borrowerSignedContract()).to.eq(false);
      expect(await junto.getBalance()).to.eq(0);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerPaymentDeposited()).to.eq(false);
    });

    it("both signatures should put contract into lock state", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);

      expect(await junto.contractState()).to.eq(1); // Prepare
      expect(await junto.borrowerSignedContract()).to.eq(false);
      expect(await junto.getBalance()).to.eq(0);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerPaymentDeposited()).to.eq(false);

      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});

      expect(await junto.lenderCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerPaymentDeposited()).to.eq(false); // Paid
      expect(await junto.lenderSignedContract()).to.eq(true);
      expect(await junto.borrowerSignedContract()).to.eq(true);
      expect(await junto.contractState()).to.eq(2); // Locked
      expect(await junto.getBalance()).to.eq(30); // 10 + 20
    });
  });

  describe("execute contract", async () => {
    it("lender set ready to resolve", async () => {

      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});

      expect(await junto.lenderReadyToResolve()).to.eq(false);
      expect(await junto.contractState()).to.eq(2); // Locked

      await junto.connect(lender).setReadyToResolve();

      expect(await junto.lenderReadyToResolve()).to.eq(true);
      expect(await junto.contractState()).to.eq(2); // Locked
    });

    it("borrower set ready to resolve", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});

      expect(await junto.borrowerReadyToResolve()).to.eq(false);
      expect(await junto.contractState()).to.eq(2); // Locked

      await junto.connect(borrower).setReadyToResolve();

      expect(await junto.borrowerReadyToResolve()).to.eq(true);
      expect(await junto.contractState()).to.eq(2); // Locked
    });

    it("lender undo set ready to resolve", async () => {

      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});
      await junto.connect(lender).setReadyToResolve();

      expect(await junto.lenderReadyToResolve()).to.eq(true);
      expect(await junto.contractState()).to.eq(2); // Locked

      await junto.connect(lender).undoReadyToResolve();

      expect(await junto.lenderReadyToResolve()).to.eq(false);
      expect(await junto.contractState()).to.eq(2); // Locked
    });

    it("borrower undo set ready to resolve", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});
      await junto.connect(borrower).setReadyToResolve();

      expect(await junto.borrowerReadyToResolve()).to.eq(true);
      expect(await junto.contractState()).to.eq(2); // Locked
      
      await junto.connect(borrower).undoReadyToResolve();
    
      expect(await junto.borrowerReadyToResolve()).to.eq(false);
      expect(await junto.contractState()).to.eq(2); // Locked
    });

    it("both lender and borrower set ready to resolve", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});
      
      expect(await junto.borrowerReadyToResolve()).to.eq(false);
      expect(await junto.lenderReadyToResolve()).to.eq(false);
      expect(await junto.contractState()).to.eq(2); // Locked
      expect(await junto.getBalance()).to.eq(30);
      expect(await junto.lenderCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);

      await junto.connect(lender).setReadyToResolve();
      await junto.connect(borrower).setReadyToResolve();

      expect(await junto.borrowerReadyToResolve()).to.eq(true);
      expect(await junto.lenderReadyToResolve()).to.eq(true);
      expect(await junto.contractState()).to.eq(4); // Resolved
      expect(await junto.getBalance()).to.eq(0);
      expect(await junto.lenderCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);

    });

    it("should nuke contract", async () => {
      const forwardAddrValueInitial = await forward.getBalance();
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});

      expect(await junto.contractState()).to.eq(2); // Locked
      expect(await junto.getBalance()).to.eq(30);
      expect(await junto.lenderCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);

      await junto.connect(lender).nukeContract();
  
      expect(await junto.contractState()).to.eq(3); // Nuked
      expect(await junto.getBalance()).to.eq(0);
      expect(await junto.lenderCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);

      // Check that the contract value was added to forward signer.
      const forwardAddrValueFinal = await forward.getBalance();
      expect(forwardAddrValueFinal.sub(forwardAddrValueInitial)).to.eq(30);      
    });

    it("should successfully destroy contract after successful execution", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
      await junto.connect(lender).signContract({value: 10});
      await junto.connect(borrower).signContract({value: 50});
      await junto.connect(lender).setReadyToResolve();
      await junto.connect(borrower).setReadyToResolve();
      await junto.connect(lender).destroyContract();
    });

    it("should successfully destroy contract after nuking", async () => {
        await junto.specifyContract(
          lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
        await junto.connect(lender).signContract({value: 10});
        await junto.connect(borrower).signContract({value: 50});
        await junto.connect(borrower).nukeContract();
        await junto.connect(lender).destroyContract();
    });
  });
});