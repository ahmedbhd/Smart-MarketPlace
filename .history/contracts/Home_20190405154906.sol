pragma solidity >=0.4.22 <0.6.0;

contract Home {
    string private _area;
    string private _location;
    uint256 private _price;
    address private _owner;
    string private _state;
    
    constructor (string memory area,string memory location, uint256 price,address owner) public {
        _area = area;
        _location = location;
        _price = price;
        _owner = owner;
        _state = "for sale";
    }
    function transfer(address _from, address _to) public returns(bool) {
        require(_owner == _from);
        _owner = _to;
        _state = "sold";
        return true;
    }
    function update (string memory area , string memory location , uint256 price) public returns (bool){
        require(_owner == msg.sender);
        _location = location;
        _area = area;
        _price = price;
        return true;
    }
    function getPrice() view public returns(uint256){
        return _price;
    }
    function getArea() view public returns(string memory){
        return _area;
    }
    function getLocation() view public returns(string memory){
        return _location;
    }
    function getOwner() view public returns(address){
        return _owner;
    }
    function getState() view public returns(string memory){
        return _state;
    }
    // the buyer invokes this function to initiate a purchase and notifies the clearing house
    function setWanted() public{
        _state = "wanted";
    }   
    // the clearing house creates a purchase and notifies the seller
    function setPending() public{
        _state = "pending";
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setConfirmed() public{
        _state = "confirmed";
    }
}