// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AvatarNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter = 1;

    // Mapping from FID to token ID
    mapping(uint256 => uint256) public fidToTokenId;
    mapping(uint256 => uint256) public tokenIdToFid;

    // Base URI for metadata
    string private _baseTokenURI;

    // Events
    event AvatarMinted(
        uint256 indexed tokenId,
        uint256 indexed fid,
        string tokenURI
    );

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = "";
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function mint(
        uint256 fid,
        string memory tokenURI
    ) public returns (uint256) {
        require(fid > 0, "Invalid FID");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);

        fidToTokenId[fid] = tokenId;
        tokenIdToFid[tokenId] = fid;

        emit AvatarMinted(tokenId, fid, tokenURI);

        return tokenId;
    }

    function getTokenIdByFid(uint256 fid) public view returns (uint256) {
        return fidToTokenId[fid];
    }

    function getFidByTokenId(uint256 tokenId) public view returns (uint256) {
        return tokenIdToFid[tokenId];
    }

    function hasAvatar(uint256 fid) public view returns (bool) {
        return fidToTokenId[fid] > 0;
    }
}
