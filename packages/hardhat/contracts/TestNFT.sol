// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721 {
    event nftMinted(
        uint256 tokenId
    );
    uint256 public lastTokenId = 0;
    constructor() ERC721("TestNFT", "TESTNFT") {}
    function mint() public {
        _mint(msg.sender, lastTokenId);
        emit nftMinted(lastTokenId);
        lastTokenId++;
    }
}