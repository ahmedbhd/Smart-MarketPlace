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
    function setWanted() public{
        require(address(0) !=msg.sender);
        _state = "wanted";
        emit Wanted(msg.sender);
    }
    event Wanted(
        address  _buyer
    );
    function setPending() public{
        require(_owner ==msg.sender);
        _state = "pending";
        emit Pending(msg.sender);
    }
    event Pending(
        address  _buyer
    );
}