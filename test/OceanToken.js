const { expect, assert } = require("chai");
const hre = require("hardhat");

describe("OceanToken contract", function () {
  let owner;
  let Token;
  let oceanToken;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("OceanToken");
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    oceanToken = await Token.deploy(tokenCap, tokenBlockReward);
  });
  describe("Deployment", async function () {
    it("Should set the right owner", async function () {
      assert.equal(await oceanToken.owner(), owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await oceanToken.balanceOf(owner.address);
      assert.equal(
        (await oceanToken.totalSupply()).toString(),
        ownerBalance.toString()
      );
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = (await oceanToken.cap()).toString();
      assert.equal(hre.ethers.utils.formatEther(cap), tokenCap);
    });

    it("Should set the block reward to the argument specified during deployment", async function () {
      const blockReward = (await oceanToken.blockReward()).toString();
      assert.equal(hre.ethers.utils.formatEther(blockReward), tokenBlockReward);
    });
  });

  describe("Transactions", async function () {
    it("Should transfer tokens between accounts", async function () {
      await oceanToken.transfer(addr1.address, 50);
      const addr1Balance = await oceanToken.balanceOf(addr1.address);
      assert.equal(addr1Balance, 50);

      await oceanToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await oceanToken.balanceOf(addr2.address);
      assert.equal(addr2Balance, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = (
        await oceanToken.balanceOf(owner.address)
      ).toString();
      await expect(
        oceanToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      assert.equal(
        initialOwnerBalance,
        (await oceanToken.balanceOf(owner.address)).toString()
      );
    });
    it("Should update balances after tranfers", async function () {
      const initialOwnerBalance = (
        await oceanToken.balanceOf(owner.address)
      ).toString();
      await oceanToken.transfer(addr1.address, 100);
      await oceanToken.transfer(addr2.address, 50);
      
      const ownerBalance = (await oceanToken.balanceOf(owner.address)).toString();
      assert.equal(ownerBalance, (initialOwnerBalance - '150'));
      
      const addr1Balance = await oceanToken.balanceOf(addr1.address)
      assert.equal(addr1Balance, 100)

      const addr2Balance = (await oceanToken.balanceOf(addr2.address)).toString()
      assert.equal(addr2Balance, 50)
    });
  });
});
