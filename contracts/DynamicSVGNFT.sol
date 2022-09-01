// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.4/interfaces/AggregatorV3Interface.sol";


error URI_QUERY_FOR_NON_EXISTENT_TOKEN();


/**
*@title SVG NFT (Hosted 100% on-chain), That uses price feeds to be dynamic.
*@author ABossOfMyself.
*@notice Dynamic SVG NFT Smart Contract.
*@dev This contract uses Chainlink price feeds.
 */


contract DynamicSVGNFT is ERC721 {

    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    string private constant Base64EncodedSVGPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface private immutable i_priceFeed;


    mapping (uint256 => int256) private s_tokenIdToHighValue;


    event NFTMinted(uint256 indexed tokenId, int256 highValue);


    constructor(address priceFeedAddress, string memory lowSVG, string memory highSVG) ERC721("Smilies-Club", "Smilie") {

        s_tokenCounter = 0;
        s_lowImageURI = SVGToImageURI(lowSVG);
        s_highImageURI = SVGToImageURI(highSVG);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }


    function SVGToImageURI(string memory SVG) public pure returns(string memory) {

        string memory SVGBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(SVG))));

        return string(abi.encodePacked(Base64EncodedSVGPrefix, SVGBase64Encoded));
    }


    function mintNft(int256 highValue) public {

        s_tokenIdToHighValue[s_tokenCounter] = highValue;

        _safeMint(msg.sender, s_tokenCounter);

        s_tokenCounter = s_tokenCounter + 1;

        emit NFTMinted(s_tokenCounter, highValue);
    }


    function _baseURI() internal pure override returns(string memory) {

        return "data:application/json;base64,";
    }


    function tokenURI(uint256 tokenId) public view override returns(string memory) {

        if(!_exists(tokenId)) revert URI_QUERY_FOR_NON_EXISTENT_TOKEN();

        ( , int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI = s_lowImageURI;

        if(price >= s_tokenIdToHighValue[tokenId]) {

            imageURI = s_highImageURI;
        }

        return string(abi.encodePacked(_baseURI(), Base64.encode(bytes(abi.encodePacked('{"name":"',name(),'", "description": "An NFT that changes based on the Chainlink Feed", ','"attributes": [{"trait_type": "Awesomeness", "value": 999}], "image":"',imageURI,'"}')))));
    }




    function getLowSVG() public view returns(string memory) {

        return s_lowImageURI;
    }


    function getHighSVG() public view returns(string memory) {

        return s_highImageURI;
    }


    function getPriceFeed() public view returns(AggregatorV3Interface) {

        return i_priceFeed;
    }


    function getTokenCounter() public view returns(uint256) {

        return s_tokenCounter;
    }
}