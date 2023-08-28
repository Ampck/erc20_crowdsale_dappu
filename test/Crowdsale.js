const { expect } = require ('chai');
const { ethers } = require ('hardhat');
const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Crowdsale', () => {
	let crowdsale,
		token
	beforeEach(async () => {
		const Token = await ethers.getContractFactory('Token')
		const Crowdsale = await ethers.getContractFactory('Crowdsale')
		token = await Token.deploy('Dapp University', 'DAPP', 1000000)
		crowdsale = await Crowdsale.deploy(token.address)
	})

	describe('Deployment', () => {
		it('has correct name', async () => {
			expect(await crowdsale.name()).to.equal('Crowdsale')
		})
		it('returns correct token address', async () => {
			expect(await crowsdale.token()).to.equal(token.address)
		})
	})

})