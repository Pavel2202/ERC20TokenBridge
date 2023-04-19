//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./IBridge.sol";
import "./Token.sol";
import "./TokenFactory.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is IBridge {
    address public admin;
    TokenFactory public tokenFactory;

    mapping(address => bool) public bridges;
    mapping(address => uint256) public tokenNonce;
    mapping(address => mapping(address => uint256)) public withdraws;

    constructor(address _tokenFactory) {
        admin = msg.sender;
        tokenFactory = TokenFactory(_tokenFactory);
    }

    function deposit(
        DepositData calldata _depositData,
        TokenData calldata _tokenData,
        Signature calldata _signature
    ) external {
        require(_depositData.amount > 0, "invalid amount");

        Token(_depositData.token).permit(
            msg.sender,
            address(this),
            _depositData.amount,
            _depositData.deadline,
            _signature.v,
            _signature.r,
            _signature.s
        );

        tokenNonce[_depositData.token] += 1;
        if (tokenFactory.tokens(_depositData.token) == address(0)) {
            Token(_depositData.token).transferFrom(
                msg.sender,
                address(this),
                _depositData.amount
            );
            IBridge(_depositData.targetBridge).createToken(
                _depositData.token,
                _tokenData
            );
        } else {
            Token(_depositData.token).burnFrom(msg.sender, _depositData.amount);
        }
        IBridge(_depositData.targetBridge).increaseWithdraw(
            _depositData.to,
            _depositData.token,
            _depositData.amount
        );
        emit Deposit(
            msg.sender,
            _depositData.token,
            _depositData.targetBridge,
            _depositData.amount
        );
    }

    function withdrawFromBridge(WithdrawData calldata _withdrawData) external {
        require(
            withdraws[msg.sender][_withdrawData.token] >= _withdrawData.amount,
            "insufficient balance"
        );
        withdraws[msg.sender][_withdrawData.token] -= _withdrawData.amount;

        if (tokenFactory.tokens(_withdrawData.token) == address(0)) {
            Token(_withdrawData.token).transfer(
                msg.sender,
                _withdrawData.amount
            );
        } else {
            Token(_withdrawData.token).mint(msg.sender, _withdrawData.amount);
        }
        emit Withdraw(msg.sender, _withdrawData.token, _withdrawData.amount);
    }

    function createToken(
        address token,
        TokenData calldata _tokenData
    ) external {
        require(bridges[msg.sender] == true, "no permission");
        tokenFactory.create(token, _tokenData.name, _tokenData.symbol);
    }

    function increaseWithdraw(
        address to,
        address token,
        uint256 amount
    ) external {
        require(bridges[msg.sender] == true, "no permission");
        withdraws[to][token] += amount;
    }

    function addBridge(address _bridge) external {
        require(admin == msg.sender, "no permission");
        bridges[_bridge] = true;
    }
}
