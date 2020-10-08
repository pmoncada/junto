import { ethers } from "@nomiclabs/buidler";
import chai from "chai";
import { deployContract, solidity} from "ethereum-waffle";
import JuntoArtifact from "../artifacts/Junto.json";
import { Junto } from "../typechain/Junto";
import { Wallet } from "ethers";

chai.use(solidity);
const { expect } = chai;

describe("Junto", () => {

  let junto : Junto;
  let lenderAddr = "";
  let borrowerAddr = "";
  let forwardAddr = "";
  
  
  beforeEach(async () => {
    const [owner] = await ethers.getSigners();
    junto = (await deployContract(owner, JuntoArtifact)) as Junto;
  });

  // 4
  describe("check signing functions", async () => {
    it("should sign contract", async () => {

    const [lender, borrower, forward] = await ethers.getSigners();
    
    // 1
    lenderAddr = await lender.getAddress();
    borrowerAddr = await borrower.getAddress();
    forwardAddr = await forward.getAddress();
    
    // 2
    expect(await junto.contractState()).to.eq(0);
    await junto.specifyContract(
      lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);

    // 3
    expect(await junto.contractState()).to.eq(1);
    expect(await junto.lenderAddr()).to.eq(lenderAddr);
    expect(await junto.borrowerAddr()).to.eq(borrowerAddr);
    expect(await junto.forwardingAddr()).to.eq(forwardAddr);

    expect(await junto.lenderSignedContract()).to.eq(false);
    expect(await junto.borrowerSignedContract()).to.eq(false);
    await junto.connect(lender).lenderSignContract();
    await junto.connect(borrower).borrowerSignContract();
    
    // These are currently failing... potential issue with struct in .sol
    expect(await junto.lenderSignedContract()).to.eq(true);
    expect(await junto.borrowerSignedContract()).to.eq(true);
    });
  });

  describe("count down", async () => {
    // 5
    it("should fail", async () => {
      //await counter.countDown();
    });

    it("should count down", async () => {
      //await counter.countUp();

      //await counter.countDown();
      //const count = await counter.getCount();
      expect(1).to.eq(1);
    });
  });
});