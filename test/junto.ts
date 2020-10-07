import { ethers } from "@nomiclabs/buidler";
import chai from "chai";
import { deployContract, solidity } from "ethereum-waffle";
import JuntoArtifact from "../artifacts/Junto.json";
import { Junto } from "../typechain/Junto";

chai.use(solidity);
const { expect } = chai;

describe("Junto", () => {
  let junto : Junto;

  beforeEach(async () => {
    // 1
    const [owner, lender, borrower, forward] = await ethers.getSigners();

    // 2
    junto = (await deployContract(owner, JuntoArtifact)) as Junto;
    const lenderAddr = await lender.getAddress();
    const borrowerAddr = await borrower.getAddress();
    const forwardAddr = await forward.getAddress();
    expect(await junto.contractState()).to.eq(0);
    await junto.specifyContract(lenderAddr, borrowerAddr, forwardAddr, 10, 20, 30);

    // 3
    expect(await junto.contractState()).to.eq(1);
    expect((await junto.lender()).addr).to.eq(lenderAddr);
    expect((await junto.borrower()).addr).to.eq(borrowerAddr);
    expect(await junto.forwardingAddress()).to.eq(forwardAddr);
  });

  // 4
  describe("deposit collateral", async () => {
    it("should count up", async () => {
      //await counter.countUp();
      //let count = await counter.getCount();
      expect(1).to.eq(1);
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
