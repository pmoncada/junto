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

    it("should sign and unsign contract", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);
  
      expect(await junto.lenderSignedContract()).to.eq(false);
      expect(await junto.borrowerSignedContract()).to.eq(false);

      await junto.connect(lender).lenderSignContract();
      await junto.connect(borrower).borrowerSignContract();
      
      expect(await junto.lenderSignedContract()).to.eq(true);
      expect(await junto.borrowerSignedContract()).to.eq(true);

      await junto.connect(lender).lenderRemoveSignatureFromContract();
      await junto.connect(borrower).borrowerRemoveSignatureFromContract();
      
      expect(await junto.lenderSignedContract()).to.eq(false);
      expect(await junto.borrowerSignedContract()).to.eq(false);
    });

    it("should deposit and withdraw collateral", async () => {
      // Can also use ethers.utils.parseEther("10") for value

      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 20, 0);

      expect(await junto.lenderCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);
      expect(await junto.lenderCollateralValue()).to.eq(10);
      expect(await junto.borrowerCollateralValue()).to.eq(20);

      await junto.connect(lender).lenderDepositCollateral({value: 10});
      await junto.connect(borrower).borrowerDepositCollateral({value: 20});
      
      expect(await junto.lenderCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);

      await junto.connect(lender).lenderWithdrawCollateral();
      await junto.connect(borrower).borrowerWithdrawCollateral();

      expect(await junto.lenderCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);
    });

    it("should deposit and withdraw payment", async () => {
      // Can also use ethers.utils.parseEther("10") for value

      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 0, 0, 10);

      expect(await junto.borrowerPaymentDeposited()).to.eq(false);
      expect(await junto.borrowerPaymentValue()).to.eq(10);

      await junto.connect(borrower).borrowerDepositPayment({value: 10});
      expect(await junto.borrowerPaymentDeposited()).to.eq(true);

      await junto.connect(borrower).borrowerWithdrawPayment();
      expect(await junto.borrowerPaymentDeposited()).to.eq(false);
    });
  });

  describe("execute contract", async () => {
    // 5
    it("put contract into lock state", async () => {

      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 0, 0, 0);
  
      await junto.connect(lender).lenderSignContract();
      await junto.connect(borrower).borrowerSignContract();

      expect(await junto.lenderCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerCollateralDeposited()).to.eq(true);
      expect(await junto.borrowerPaymentDeposited()).to.eq(true);
      expect(await junto.lenderSignedContract()).to.eq(true);
      expect(await junto.borrowerSignedContract()).to.eq(true);

      await junto.connect(lender).lockContract();

      // Enum #2 == Locked
      expect(await junto.contractState()).to.eq(2);
    });

    it("should nuke contract", async () => {
      await junto.specifyContract(
        lenderAddr, borrowerAddr, forwardAddr, 10, 10, 0);
  
      await junto.connect(borrower).borrowerDepositCollateral({value: 10});
      await junto.connect(lender).lenderDepositCollateral({value: 10});
      await junto.connect(lender).lenderSignContract();
      await junto.connect(borrower).borrowerSignContract();
      await junto.connect(lender).lockContract();

      await junto.connect(lender).nukeContract();

      // Enum #3 == Nuked
      expect(await junto.contractState()).to.eq(3);
      expect(await junto.lenderCollateralDeposited()).to.eq(false);
      expect(await junto.borrowerCollateralDeposited()).to.eq(false);



      //await counter.countDown();
      //const count = await counter.getCount();
      expect(1).to.eq(1);
    });
  });
});