// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


/**
*@title A Basic NFT.
*@author ABossOfMyself.
*@notice A Basic NFT Smart Contract.
 */


contract BasicNFT is ERC721 {

    string public constant TOKEN_URI = "ipfs://bafybeiefj5qzmlmalgv4ctnjlmexhkjbzplppeqfpxcduxzlkzj6az7bqq/";

    uint256 private s_tokenCounter;

    constructor() ERC721("Smilies Collection", "Smilie") {
        
        s_tokenCounter = 0;
    }

    function mintNft() public {

        s_tokenCounter = s_tokenCounter + 1;
        
        _safeMint(msg.sender, s_tokenCounter);
    }


    function tokenURI(uint256 /* tokenId */) public pure override returns(string memory) {

        return TOKEN_URI;
    }


    function getTokenCounter() public view returns(uint256) {

        return s_tokenCounter;
    }
}