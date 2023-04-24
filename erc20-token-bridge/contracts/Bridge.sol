//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./IBridge.sol";
import "./Token.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

error TokenNotSupported();
error InvalidAmount();
error InsufficientBalance();
error NoPermission();

contract Bridge is IBridge {
    address public admin;

    mapping(address => bool) public bridges;
    mapping(address => bool) public supportedTokens;
    mapping(address => address) public tokenToWrappedToken;
    mapping(address => uint256) public tokenNonce;
    mapping(address => mapping(address => uint256)) public balance;

    modifier validateToken(address _token) {
        if (!supportedTokens[_token]) {
            revert TokenNotSupported();
        }
        _;
    }

    modifier validateAmount(uint256 amount) {
        if (amount == 0) {
            revert InvalidAmount();
        }
        _;
    }

    modifier validateBalance(
        address token,
        uint256 amount
    ) {
        if (balance[msg.sender][token] < amount) {
            revert InsufficientBalance();
        }
        _;
    }

    modifier isBridge() {
        if (!bridges[msg.sender]) {
            revert NoPermission();
        }
        _;
    }

    modifier isAdmin() {
        if (msg.sender != admin) {
            revert NoPermission();
        }
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function deposit(
        DepositData calldata _depositData,
        Signature calldata _signature
    )
        external
        validateToken(_depositData.token)
        validateAmount(_depositData.amount)
    {
        address wrappedToken = tokenToWrappedToken[_depositData.token];
        bool isWrapped = wrappedToken != address(0);

        address permitToken = isWrapped ? wrappedToken : _depositData.token;

        Token(permitToken).permit(
            msg.sender,
            address(this),
            _depositData.amount,
            _depositData.deadline,
            _signature.v,
            _signature.r,
            _signature.s
        );
        tokenNonce[_depositData.token] += 1;

        if (!isWrapped) {
            Token(_depositData.token).transferFrom(
                msg.sender,
                address(this),
                _depositData.amount
            );
        } else {
            Token(wrappedToken).burnFrom(msg.sender, _depositData.amount);
        }

        IBridge(_depositData.targetBridge).increaseBalance(
            _depositData.to,
            _depositData.token,
            _depositData.amount
        );
        emit Deposit(
            msg.sender,
            _depositData.to,
            _depositData.token,
            _depositData.targetBridge,
            _depositData.amount
        );
    }

    function withdraw(
        WithdrawData calldata _withdrawData
    )
        external
        validateToken(_withdrawData.token)
        validateBalance(_withdrawData.token, _withdrawData.amount)
    {
        balance[msg.sender][_withdrawData.token] -= _withdrawData.amount;

        address wrappedToken = tokenToWrappedToken[_withdrawData.token];
        bool isWrapped = wrappedToken != address(0);

        if (!isWrapped) {
            Token(_withdrawData.token).transfer(
                msg.sender,
                _withdrawData.amount
            );
        } else {
            Token(wrappedToken).mint(msg.sender, _withdrawData.amount);
        }

        emit Withdraw(msg.sender, _withdrawData.token, _withdrawData.amount);
    }

    function increaseBalance(
        address to,
        address token,
        uint256 amount
    ) external isBridge {
        balance[to][token] += amount;
    }

    function addBridge(address _bridge) external isAdmin {
        bridges[_bridge] = true;
    }

    function addToken(address _token) external isAdmin {
        supportedTokens[_token] = true;
    }

    function createWrappedToken(
        address token,
        string calldata name,
        string calldata symbol
    ) external isAdmin {
        Token wrappedToken = new Token(name, symbol, address(this));
        tokenToWrappedToken[token] = address(wrappedToken);
    }

    function updateAdmin(address _admin) external isAdmin {
        admin = _admin;
    }
}
