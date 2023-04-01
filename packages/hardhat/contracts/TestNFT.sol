// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "../node_modules/hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721 {
    uint256 public lastTokenId = 0;
    constructor() ERC721("BorLen", "BORLEN") {}
    function mint() public {
        _mint(msg.sender, lastTokenId);
        lastTokenId++;
    }
//test code ends
}