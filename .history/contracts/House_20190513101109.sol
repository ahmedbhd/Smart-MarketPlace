pragma solidity >=0.4.22 <= 0.5.7;
contract House {
    string public _location;
    string public _area;
    uint256 public _price;
    uint public _state;//1 (for sale); 2 (pending); 3(in progress); 4(sold);
    address public _owner;
    address public _buyer;
    function setArguments (string memory location,string memory area,uint256 price,address owner) public {
        _location=location;
        _area=area;
        _price=price;
        _state=1;
        _owner=owner;
    }
    function transfer(address _from, address _to) public returns(bool) {
        require(_owner==_from);
        _owner=_to;
        _state=4;
        _buyer=address(0);
        return true;
    }
    function update ( uint256 price) public returns (bool){
        require(_owner == msg.sender);
        _price = price;
        return true;
    }
    function getPrice() public view returns(uint256){
        return _price;
    }
    function getArea() public view returns(string memory){
        return _area;
    }
    function getLocation() public view returns(string memory){
        return _location;
    }
    function getOwner() public view returns(address){
        return _owner;
    }
    function getState() public view returns(uint){
        return _state;
    }
    function getBuyer() public view returns(address){
        return _buyer;
    }
    function setInProgress() public{
        _state=3;
    }
    function setPending() public{
        _state=2;
    }
    function setCanceled() public{
        _state=1;
        _buyer=address(0);
    }
    function setBuyer(address _wanter) public{
        _buyer=_wanter;
    }
    function revertPurchase() public{
        _buyer = address(0);
        _state =1;
    }
}