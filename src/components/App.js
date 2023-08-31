import {useEffect, useState} from 'react';
import {Container} from 'react-bootstrap';
import {ethers} from 'ethers';

import Navigation from './Navigation';
import Progress from './Progress';
import Info from './Info';

import TOKEN_ABI from '../abis/Token.json';
import CROWDSALE_ABI from '../abis/Crowdsale.json';

import config from "../config.json";

function App() {
	const [provider, setProvider] = useState(null);
	const [crowdsale, setCrowdsale] = useState(null);

	const [account, setAccount] = useState(null);
	const [accountBalance, setAccountBalance] = useState(null);

	const [price, setPrice] = useState(0)
	const [maxTokens, setMaxTokens] = useState(0)
	const [tokensSold, setTokensSold] = useState(0)

	const [isLoading, setIsLoading] = useState(true);
	
	const loadBlockchainData = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const { chainId } = await provider.getNetwork()
		const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)
		const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider)
		setCrowdsale(crowdsale);

		const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
		const account = accounts[0];
		setAccount(account);

		const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18);
		setAccountBalance(accountBalance);

		const price = ethers.utils.formatUnits(await crowdsale.price(), 18);
		setPrice(price);
		const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18);
		setTokensSold(tokensSold);
		const maxTokens = ethers.utils.formatUnits(await token.totalSupply(), 18);
		setMaxTokens(maxTokens);

		setIsLoading(false)
	}
	useEffect(() => {
		if (isLoading) {
			loadBlockchainData();
		}
	}, [isLoading]);

	return(
		<Container>
			<Navigation/>

			<h1 className="text-center my-4">Introducing DApp Token!</h1>

			{isLoading ? (
				<p className="text-center"><strong>Loading...</strong></p>
			) : (
				<>
					<p className="text-center"><strong>Current Price:</strong> {price} ETH</p>
					<Progress tokensSold={tokensSold} maxTokens={maxTokens}/>
				</>
			)}
			<hr/>
			{account && (<Info account={account} accountBalance={accountBalance}/>)}
		</Container>
	)
}

export default App;