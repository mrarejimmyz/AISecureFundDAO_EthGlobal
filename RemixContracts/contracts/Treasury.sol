// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Treasury {
    mapping(address => uint256) public balances;

    function distributeFunds(address recipient, uint256 amount) public {
        require(amount <= address(this).balance, "Insufficient funds");
        balances[recipient] += amount;
        payable(recipient).transfer(amount);
    }

    receive() external payable {}
}
