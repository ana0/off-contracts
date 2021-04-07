pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Off is ERC721 {
    address public controller;
    address public owner;
    uint256 public price;

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
    }

    function updateController(address _controller) public onlyOwner {
        controller = _controller;
    }

    function updateOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

    function withdraw() public onlyOwner {

    }

    function mint() public onlyOwner {

    }

    function buy() public {

    }

    function sell() public onlyOwnerOrController {

    }
}