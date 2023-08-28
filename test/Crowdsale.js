const { expect } = require ('chai');
const { ethers } = require ('hardhat');
const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}
const ether = tokens

describe('Crowdsale', () => {
	let crowdsale,
		token,
		accounts,
		emptyAddress,
		deployer,
		user1,
		crowdsaleSupply
	beforeEach(async () => {
		const Token = await ethers.getContractFactory('Token')
		const Crowdsale = await ethers.getContractFactory('Crowdsale')
		crowdsaleSupply = tokens(1000000)

		token = await Token.deploy('Dapp University', 'DAPP', 1000000)
		
		accounts = await ethers.getSigners()
		emptyAddress = '0x0000000000000000000000000000000000000000'
		deployer = accounts[0]
		user1 = accounts[1]
		
		crowdsale = await Crowdsale.deploy(token.address, 1)
		let tx = await token.connect(deployer).transfer(crowdsale.address, crowdsaleSupply)
		await tx.wait();
	})

	describe('Deployment', () => {
		it('returns correct token address', async () => {
			expect(await token.balanceOf(crowdsale.address)).to.equal(crowdsaleSupply)
		})
		it('send tokens to the Crowdsale contract', async () => {
			expect(await token.balanceOf(crowdsale.address)).to.equal(crowdsaleSupply)
		})
	})

	describe('Buying Tokens', () => {
		let tx,
			result,
			amount = tokens(10);
		describe('Success', () => {
			beforeEach(async () => {
				tx = await user1.sendTransaction({ to: crowdsale.address, value: amount })
				result = await tx.wait()
			})
			it('transfers tokens', async () => {
				expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(999990))
				expect(await token.balanceOf(user1.address)).to.equal(amount)
			})
			it('updates contracts ether balance', async () => {
				expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
			})
			it('emits a buy event', async () => {
				await expect(tx).to.emit(crowdsale, 'Buy').withArgs(amount, user1.address)
			})
			it('increments tokenSold variable', async () => {
				expect(await crowdsale.tokensSold()).to.equal(amount);
			})
		})
		describe('Failure', () => {
			it('rejects insufficient ETH', async () => {
				await expect(crowdsale.connect(user1).buyTokens(amount, {value:0})).to.be.reverted
			})
		})
	})
	describe('Updating Price', () => {
		let tx,
			result,
			price = ether(2)
		describe('Success', () => {
			beforeEach(async () => {
				tx = await crowdsale.connect(deployer).setPrice(price);
				result = await tx.wait();
			})
			it('updates the price', async() => {
				expect(await crowdsale.price()).to.equal(price)
			})
		})
		describe('Failure', () => {
			it('prevents non-owner from updating price', async () => {
				await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
			})
		})
	})
	describe('Finalizing Sale', () => {
		let tx,
			result,
			amount = tokens(10),
			value = tokens(10)
		describe('Success', () => {
			beforeEach(async () => {
				tx = await crowdsale.connect(user1).buyTokens(amount, { value: value})
				result = await tx.wait()
				tx = await crowdsale.connect(deployer).finalize()
				result = await tx.wait()
			})
			it('transfers remaining tokens to owner', async () => {
				expect(await token.balanceOf(crowdsale.address)).to.equal(0)
				expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990))
			})
			it('transfers ETH to owner', async () => {
				contractBalance = await ethers.provider.getBalance(crowdsale.address)
				expect(contractBalance).to.equal(0)
			})
		})
		describe('Failure', () => {
			it('prevents non-owners from finalizing', async () => {
				await expect(crowdsale.connect(user1).finalize()).to.be.reverted
			})
		})
	})
})