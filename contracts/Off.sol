// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Off is ERC721 {
    address public controller;
    address public owner;
    uint256 public price;

    mapping (uint256 => bool) public forSale;
    mapping (uint256 => string) public imageHash;
    mapping (uint256 => string) public metadataHash;

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be owner");
        _;
    }

    modifier onlyOwnerOrController() {
        require((msg.sender == owner || msg.sender == controller), "Must be owner or controller");
        _;
    }

    modifier onlyController() {
        require(msg.sender == controller, "Must be controller");
        _;
    }

    constructor (string memory name_, string memory symbol_, uint256 price_) ERC721(name_, symbol_) {
        price = price_;
        owner = msg.sender;
    }

    function setController(address controller_) public onlyOwner {
        controller = controller_;
    }

    function setOwner(address owner_) public onlyOwner {
        owner = owner_;
    }

    function setPrice(uint256 price_) public onlyOwner {
        price = price_;
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        _setBaseURI(baseURI_);
    }

    function withdraw() public onlyOwner {
        bool sent = payable(owner).send(address(this).balance);
        require(sent, "Failed to send Ether");
    }

    function mint(uint256 tokenId, bool forSale_, string memory tokenURI, string memory metadataHash_, string memory imageHash_) public onlyOwner {
        forSale[tokenId] = forSale_;
        metadataHash[tokenId] = metadataHash_;
        imageHash[tokenId] = imageHash_;
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function buy(uint256 tokenId, address to) public payable {
        require(forSale[tokenId]);
        require(_exists(tokenId), "");
        require(msg.value >= price);
        forSale[tokenId] = false;
        _transfer(owner, to, tokenId);
    }

    function sell(uint256 tokenId, address to) public onlyOwnerOrController {
        require(forSale[tokenId]);
        require(_exists(tokenId), "");
        forSale[tokenId] = false;
        _transfer(owner, to, tokenId);
    }
}