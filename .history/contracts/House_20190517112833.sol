pragma solidity >=0.4.22 <= 0.5.7;
contract House {
    string private _descLocationArea;
    string private _history;
    uint256 private _price;
    uint private _state;//0 (not for sale); 1 (for sale); 2 (pending); 3(in progress); 4(sold);
    address private _owner;
    address private _buyer;
    function setArguments (string memory descLocationArea,string memory history,uint256 price,address owner) public {
        _descLocationArea=descLocationArea;
        _price=price;
        _state=1;
        _owner=owner;
        _history=history;
    }
    function transfer(address _from, address _to) public returns(bool) {
        require(_owner==_from);
        _owner=_to;
        _state=4;
        _buyer=address(0);
        return true;
    }
    function getPrice() public view returns(uint256){
        return _price;
    }
    function getDescLocationArea() public view returns(string memory){
        return _descLocationArea;
    }
    function getHistory() public view returns(string memory){
        return _history;
    }
    function setHistory(string memory history) public{
        _history=history;
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
    function setState(uint256 state) public{
        _state=state;
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