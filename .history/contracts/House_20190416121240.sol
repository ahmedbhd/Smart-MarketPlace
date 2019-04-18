pragma solidity >=0.4.22 <= 0.5.7;

contract House {
    string private _location;
    string private _area;
    uint private _rooms;
    uint256 private _price;
    uint private _state; //1 (for sale); 2 (pending); 3(sold); 
    string private _image;
    address private _owner;
    address private _buyer;
      
    constructor (string memory location,string memory area, uint rooms,uint256 price,address owner, string memory image) public {
        _area = area;
        _location = location;
        _price = price;
        _owner = owner;
        _state = 1;
        _rooms = rooms;
        _image = image;
    }
    function transfer(address _from, address _to) public returns(bool) {
        require(_owner == _from);
        _owner = _to;
        _state = 3;
        _buyer = address(0);
        return true;
    }
    function update (string memory image , uint256 price) public returns (bool){
        require(_owner == msg.sender);
        _image = image;
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
    function getState() view public returns(uint){
        return _state;
    } 
    function getBuyer() view public returns(address){
        return _buyer;
    }
    function getImage() view public returns(string memory){
        return _image;
    }
    function getRooms() view public returns(uint){
        return _rooms;
    }
    function setInProgress() public{
        _state = 2;
    }
    function setCanceled() public{
        _state = 1;
        _buyer = address(0);
    }
    function setBuyer(address _wanter) public{
        _buyer = _wanter;
    }
    function revertPurchase() public{
        _buyer = address(0);
        _state =1;
    }
}