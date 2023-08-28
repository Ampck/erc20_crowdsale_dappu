pragma solidity ^0.8.19;

import "./Token.sol";

contract Crowdsale {
	string public name = "Crowdsale";
	Token public token;
	uint256 public price;
	uint256 public tokensSold;
	address payable public owner;

	event Buy(uint256 amount, address buyer);
	event Finalize(uint256 tokensSold, uint256 ethRaised);

	constructor(
		Token _token, 
		uint256 _price
	) {
		owner = payable(msg.sender);
		token = _token;
		price = _price;
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Caller must be owner...");
		_;
	}

	function buyTokens(uint256 _amount)
		public
		payable
	{
		require (msg.value >= (price * _amount), "Crowdsale buyer has insufficient balance to complete transfer...");
		require (token.balanceOf(address(this)) >= _amount, "Crowdsale contract has insufficient balance to complete transfer...");
		token.transfer(msg.sender, _amount);
		tokensSold += _amount;

		emit Buy(_amount, msg.sender);
	}

	function finalize() public onlyOwner {


		uint256 contractTokens = token.balanceOf(address(this));
		require(token.transfer(owner, contractTokens), "Tokens not transferred during finalization...");

		//owner.transfer(address(this).balance);
		uint256 _value = address(this).balance;
		(bool sent, ) = owner.call{value: _value}("");
		require(sent, "ETH not sent to owner...");

		emit Finalize(contractTokens, _value);
	}

	function setPrice(uint256 _price) public onlyOwner() {
		price = _price;
	}

	receive() external payable {
		buyTokens(msg.value / price);
	}

}