# ERC20 Token Bridge

**The goal of the dAPP:**
Give users to ability to trade tokens between two networks.

**The system has the following actors:**
**User:** owner of ERC20 tokens, wishing to have them on another network.
**Bridge:** contract that holds user's tokens and gives the wrapped tokens on the desired network.

**Project architecture:**

- Smart contracts:
  - Bridge.sol
  - Token.sol
- Front-end:
  - Next.js
- Back-end:
  - Node.js
  - MongoDB

## Smart contracts

### User stories

![UserStories](https://i.imgur.com/IUN7AY5.png)

### Bridge contract

![Bridge](https://i.imgur.com/q3tXNA2.png)

#### Modifiers

![Modifiers](https://i.imgur.com/WRhX3TW.png)

#### Events

![Events](https://i.imgur.com/gNTMSYM.png)

### Token contract

![Token](https://i.imgur.com/Qlh1n3k.png)
