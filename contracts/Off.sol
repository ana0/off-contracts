// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NativeMetaTransaction.sol";
import "./ContextMixin.sol";
import "./SignatureValidator.sol";

contract Off is Ownable, ERC721, ContextMixin, NativeMetaTransaction, SignatureValidator {
    address public controller;
    uint256 public price;
    string public contractURI;
    bool controllerCanSell;

    mapping (uint256 => bool) public forSale;
    mapping (uint256 => string) public imageHash;
    mapping (uint256 => string) public secretImageHash;
    mapping (uint256 => bool) public controllerNonces;

    modifier onlyOwnerOrController() {
        require((msg.sender == owner() || msg.sender == controller), "Must be owner or controller");
        _;
    }

    modifier onlyController() {
        require(msg.sender == controller, "Must be controller");
        _;
    }

    constructor (string memory name_, string memory symbol_, uint256 price_) Ownable() ERC721(name_, symbol_) {
        price = price_;
        _initializeEIP712(name_);
    }

    function setController(address controller_) public onlyOwner {
        controller = controller_;
    }

    function setControllerCanSell(bool canSell_) public onlyOwner {
        controllerCanSell = canSell_;
    }

    function setPrice(uint256 price_) public onlyOwner {
        price = price_;
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        _setBaseURI(baseURI_);
    }

    function setContractURI(string memory contractURI_) public onlyOwner {
        contractURI = contractURI_;
    }

    function withdraw() public onlyOwner {
        bool sent = payable(owner()).send(address(this).balance);
        require(sent, "Failed to send Ether");
    }

    function mint(uint256 tokenId, bool forSale_, string memory tokenURI, string memory secretImageHash_, string memory imageHash_) public onlyOwner {
        forSale[tokenId] = forSale_;
        secretImageHash[tokenId] = secretImageHash_;
        imageHash[tokenId] = imageHash_;
        _safeMint(owner(), tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function setForSale(uint256 tokenId, bool forSale_) public onlyOwner {
        require(_exists(tokenId), "");
        require(ownerOf(tokenId) == owner());
        forSale[tokenId] = forSale_;
    }

    function buy(uint256 tokenId, address to, uint256 issuingTime, uint256 nonce, bytes memory authorization) public payable {
        require(forSale[tokenId], "Not for sale");
        require(_exists(tokenId), "Invalid tokenId");
        require(msg.value >= price, "Insufficient funds");
        require(block.timestamp - issuingTime <= 1200, "Auth token expired");
        require(!controllerNonces[nonce], "Invalid nonce");
        require(verifyAuthorization(controller, to, tokenId, issuingTime, nonce, authorization), "Invalid auth token");
        forSale[tokenId] = false;
        _transfer(owner(), to, tokenId);
    }

    function sell(uint256 tokenId, address to) public onlyOwnerOrController {
        if (msg.sender == controller) {
            require(controllerCanSell);
        }
        require(forSale[tokenId]);
        require(_exists(tokenId), "");
        forSale[tokenId] = false;
        _transfer(owner(), to, tokenId);
    }

    function getToken(uint256 tokenId) public view returns (
        string memory,
        bool,
        string memory,
        string memory,
        address
    ) {
        if (_exists(tokenId)) {
            return (
                tokenURI(tokenId),
                forSale[tokenId],
                secretImageHash[tokenId],
                imageHash[tokenId],
                ownerOf(tokenId)
            );
        }
        return (
            "",
            false,
            "",
            "",
            address(0)
        );
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender()
        internal
        override
        view
        returns (address payable sender)
    {
        return ContextMixin.msgSender();
    }

    /**
    * As another option for supporting trading without requiring meta transactions, override isApprovedForAll to whitelist OpenSea proxy accounts on Matic
    */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
        if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
            return true;
        }
        
        return ERC721.isApprovedForAll(_owner, _operator);
    }
} 