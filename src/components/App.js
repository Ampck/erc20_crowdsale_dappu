import {useEffect, useState} from 'react';
import {Container} from 'react-bootstrap';
import {ethers} from 'ethers';

import Navigation from './Navigation';
import Info from './Info';

function App() {
	const [account, setAccount] = useState(null);
	const loadBlockchainData = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		console.log("Web3 Provider: " + provider);
		const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
		const account = accounts[0];
		console.log("Primary account: " + account);
		setAccount(account);
	}
	useEffect(() => {
		loadBlockchainData();
	});

	return(
		<Container>
			<Navigation/>
			<hr/>
			{account && (<Info account={account} />)}
		</Container>
	)
}

export default App;