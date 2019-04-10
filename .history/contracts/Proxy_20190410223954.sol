pragma solidity >=0.4.22 <= 0.5.7;
import "./Home.sol";
contract Proxy{
    using Strings for string;
    using Uints for uint256;
    mapping (uint256 => Home) private _homes;
    uint256 private _homesNumber;
    mapping (uint256 => address) private _purchases;
    uint256 private _purchasesNumber;
    constructor() public {
        _purchasesNumber =_homesNumber=0;
    }
    function addHome(string memory _location,string memory _area, uint256 _price) public returns (bool){
        _homesNumber++;
        _homes[_homesNumber] =new Home(_location,_area,_price,msg.sender);
        return true;
    }
    function addPurchase(address _purchase) public returns (bool){
        _purchasesNumber++;
        _purchases[_purchasesNumber] =_purchase;
        return true;
    }
    function getHomesNbr() public view returns (uint256){
        return _homesNumber;
    }
   /*  function getPurchasesNbr() public view returns (uint256){
        return _purchasesNumber;
    } */
    function getHomeAt(uint256 _index) public view returns(string memory, string memory, uint, address, uint, address ){
        return (
            _homes[_index].getLocation(),
            _homes[_index].getArea(),
            _homes[_index].getPrice(),
            _homes[_index].getOwner(),
            _homes[_index].getState(),
            _homes[_index].getBuyer());
    }
    /* function getPurchaseAt(uint256 _index) public view returns(address){
        return (_purchases[_index]);
    } */
    function getMyPendingHomes() public view returns (string memory){
        require(msg.sender!=address(0));
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_homesNumber; _i++) {
            if ((_homes[_i].getOwner()==msg.sender) && (_homes[_i].getState()==2)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    function getMyHomes() public view returns (string memory){
        require(msg.sender!=address(0));
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_homesNumber; _i++) {
            if ((_homes[_i].getOwner()==msg.sender) && (_homes[_i].getState()==1)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    // the buyer invokes this function to initiate a purchase and notifies the clearing house
    function setHomeAtAsWanted (uint256 _index,uint256 _price) public {
        require(address(0)!=msg.sender);
        require(_price >= _homes[_index].getPrice());
        emit Wanted(msg.sender,_index);
    }
    // the clearing house creates a purchase and notifies the seller
    function setHomeAsPending(uint256 _index, address _buyer) public returns (bool) {
        require(address(0)!=msg.sender);
        _homes[_index].setPending();
        _homes[_index].setBuyer(_buyer);
        return true;
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setHomeAsConfirmed(uint256 _index) public {
        require(address(0)!=msg.sender);
        emit Confirmed(_index);
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setHomeAsCanceled(uint256 _index) public returns (bool) {
        require(address(0)!=msg.sender);
        _homes[_index].setCanceled();
        return true;
    }
    // transfer the ownership of the wanted house to the buyer
    function transferHouseFrom(address _from, address _to,uint256 _index,uint256 _price) public returns(bool){
        require(address(0)!=msg.sender);
        require(address(0)!=_to);
        require(_index<=_homesNumber);
        require(_price >= _homes[_index].getPrice());
        return (_homes[_index].transfer(_from,_to));
    }
    // transfer the ownership of the wanted house to the buyer
    function revertPurchaseOf(uint256 _index) public returns(bool){
        require(address(0)!=msg.sender);
        _homes[_index].revertPurchase();
        return (true);
    }
    event Wanted (
        address _from,
        uint256 _homeIndex
    );
    /* event Pending (
        address _from,
        uint256 _homeIndex
    ); */
    event Confirmed (
        uint256 _homeIndex
    );
}

library Strings {

    function concat(string memory _base, string memory _value) internal pure returns (string memory) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        string memory _tmpValue = new string(_baseBytes.length + _valueBytes.length);
        bytes memory _newValue = bytes(_tmpValue);

        uint i;
        uint j;

        for(i=0; i<_baseBytes.length; i++) {
            _newValue[j++] = _baseBytes[i];
        }

        for(i=0; i<_valueBytes.length; i++) {
            _newValue[j++] = _valueBytes[i++];
        }

        return string(_newValue);
    }

}
library Uints {
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}