// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


error RandomIPFSNFT__RANGE_OUT_OF_BOUNDS();
error RandomIPFSNFT__LESS_THAN_MINT_FEE();
error RandomIPFSNFT__TRANSFER_FAILED();


/**
*@title An IPFS hosted NFT, That uses Randomness to generate a unique NFT.
*@author ABossOfMyself.
*@notice Random IPFS NFT Smart Contract.
*@dev This contract implements Chainlink - VRF Version 2.
 */


contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {


    enum Smilie { Ultimate_Smilie, Legendary_Smilie, Epic_Smilie, Common_Smilie }


    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;


    mapping(uint256 => address) private s_requestIdToAddress;


    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Smilie smiliesClub, address minter);


    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_setSmiliesTokenURIs;
    uint256 private immutable i_mintFee;


    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId, 
        bytes32 gasLane, 
        uint32 callbackGasLimit, 
        string[4] memory setSmiliesTokenURIs, 
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Smilies-Club", "Smilie") {
        
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_setSmiliesTokenURIs = setSmiliesTokenURIs;
        i_mintFee = mintFee;
    }


    function requestNft() public payable returns(uint256 requestId) {

        if(msg.value < i_mintFee) revert RandomIPFSNFT__LESS_THAN_MINT_FEE();

        requestId = i_vrfCoordinatorV2.requestRandomWords(

            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToAddress[requestId] = msg.sender;

        emit NFTRequested(requestId, msg.sender);
    }


    function withdraw() public onlyOwner {

        uint256 amount = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: amount}("");

        if(!success) revert RandomIPFSNFT__TRANSFER_FAILED();
    }


    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        
        address smilieOwner = s_requestIdToAddress[requestId];

        uint256 newTokenId = s_tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Smilie smiliesClub = getSmiliesFromModdedRng(moddedRng);

        s_tokenCounter = s_tokenCounter + 1;

        _safeMint(smilieOwner, newTokenId);

        _setTokenURI(newTokenId, s_setSmiliesTokenURIs[uint256(smiliesClub)]);

        emit NFTMinted(smiliesClub, smilieOwner);
    }


    function getSmiliesFromModdedRng(uint256 moddedRng) public pure returns(Smilie) {

        uint256 cummulativeSum = 0;

        uint256[4] memory chanceArray = getChanceArray();

        for(uint256 i = 0; i < chanceArray.length; i++) {

            if(moddedRng >= cummulativeSum && moddedRng < cummulativeSum + chanceArray[i]) {

               return Smilie(i);
            }

            cummulativeSum += chanceArray[i];
        }

        revert RandomIPFSNFT__RANGE_OUT_OF_BOUNDS();
    }



    function getChanceArray() public pure returns(uint256[4] memory) {

        return [2, 8, 30, MAX_CHANCE_VALUE];
    }


    function getMintFee() public view returns(uint256) {

        return i_mintFee;
    }


    function getSmiliesTokenURIs(uint256 index) public view returns(string memory) {

        return s_setSmiliesTokenURIs[index];
    }

    
    function getTokenCounter() public view returns(uint256) {

        return s_tokenCounter;
    }
}