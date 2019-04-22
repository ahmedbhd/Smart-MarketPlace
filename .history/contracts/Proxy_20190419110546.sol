pragma solidity >=0.4.22 <= 0.5.7;
import "./House.sol";
import "./Purchase.sol";

contract Proxy{
    using Strings for string;
    using Uints for uint256;
    mapping (uint256 => House) private _houses;
    uint256 private _housesNumber;
    mapping (uint256 => Purchase) private _purchases;
    uint256 private _purchasesNumber;
    constructor() public {
        _purchasesNumber =_housesNumber=0;
    }
    function addHouse(string memory _location,string memory _area,string memory _rooms, uint256 _price) public returns (bool){
        _housesNumber++;
        _houses[_housesNumber] =new House();
        _area = _area.concat("/");
        _area = _area.concat(_rooms);
        _houses[_housesNumber].setArguments(_location,_area,_price,msg.sender);
        return true;
    }
    function addPurchase(uint256 _index, address _bank, address _insurance, string memory _loan,string memory _date,string memory _forBank,string memory _forInsurance) public returns (bool){
        _purchasesNumber++;
        _purchases[_purchasesNumber] =new Purchase();
        _purchases[_purchasesNumber].setArguments(
             _houses[_index].getOwner(),
             _houses[_index].getBuyer(),
             _bank,
             _insurance,
             _index,
             _loan,
             _date,
             _forBank,
             _forInsurance
             );
        return true;
    }
    function getHousesNbr() public view returns (uint256){
        return _housesNumber;
    }
    function getPurchasesNbr() public view returns (uint256){
        return _purchasesNumber;
    }
    function getHouseAt(uint256 _index) public view returns(string memory, string memory, uint, uint, address, address ){
        return (
            _houses[_index].getLocation(),
            _houses[_index].getArea(),
            _houses[_index].getPrice(),
            _houses[_index].getState(),
            _houses[_index].getOwner(),
            _houses[_index].getBuyer());
    }
    function deleteHouseAt(uint256 _index) public returns(bool){
        delete _houses[_index];
        return (true);
    }
    function getPurchaseAt(uint256 _index) public view returns(address){
        return (_purchases[_index]);
    }
    /* function getPurchaseAt(uint256 _index) public view returns(address,address,address,address,uint256,string memory){
        string memory _loan = _purchases[_index].getLoan();
        string memory _date = _purchases[_index].getDate();
        string memory _advance = _purchases[_index].getAdvance();
        string memory _forBank = _purchases[_index].getAmountForBank();
        string memory _forInsurance = _purchases[_index].getAmountForInsurance();
        
        _loan = _loan.concat( ";");
        _date=_date.concat( ";");
        _advance=_advance.concat( ";");
        _forBank=_forBank.concat( ";");
        
        _loan = _loan.concat(_date);
        _loan = _loan.concat(_advance);
        _loan = _loan.concat( _forBank);
        _loan = _loan.concat(_forInsurance);
        
        return (_purchases[_index].getOwner(),
            _purchases[_index].getBuyer(),
            _purchases[_index].getBank(),
            _purchases[_index].getInsurance(),
            _purchases[_index].getHouseIndex(),
            _loan
            );
    } */
    function getMyInProgressHouses() public view returns (string memory){
        require(msg.sender!=address(0));
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_housesNumber; _i++) {
            if ((_houses[_i].getOwner()==msg.sender) && (_houses[_i].getState()==2)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    function getMyHouses() public view returns (string memory){
        require(msg.sender!=address(0));
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_housesNumber; _i++) {
            if ((_houses[_i].getOwner()==msg.sender) && (_houses[_i].getState()==1)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    // the buyer invokes this function to initiate a purchase and notifies the clearing house
    function setHouseAtAsWanted (uint256 _index) public {
        require(address(0)!=msg.sender);
        emit Wanted(_index,_houses[_index].getOwner(),msg.sender,_houses[_index].getPrice());
    }
    // the clearing house creates a purchase contract and notifies the buyer
    function setHousePending(uint256 _index, address _buyer) public  {
        require(address(0)!=msg.sender);
        _houses[_index].setPending();
        _houses[_index].setBuyer(_buyer);
        emit Pending(_index);
    }
    // the clearing house creates a purchase and notifies the seller
    function setHouseInProgress(uint256 _index, address _buyer) public returns (bool) {
        require(address(0)!=msg.sender);
        _houses[_index].setInProgress();
        _houses[_index].setBuyer(_buyer);
        return true;
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setHouseAsConfirmed(uint256 _index) public {
        require(address(0)!=msg.sender);
        emit Confirmed(_houses[_index].getOwner(),msg.sender,_houses[_index].getPrice());
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setHouseAsCanceled(uint256 _index) public returns (bool) {
        require(address(0)!=msg.sender);
        _houses[_index].setCanceled();
        return true;
    }
    // transfer the ownership of the wanted house to the buyer
    function transferHouseFrom(address _from, address _to,uint256 _index) public returns(bool){
        require(address(0)!=msg.sender);
        require(address(0)!=_to);
        require(_index<=_housesNumber);
        return (_houses[_index].transfer(_from,_to));
    }
    // transfer the ownership of the wanted house to the buyer
    function revertPurchaseOf(uint256 _index) public returns(bool){
        require(address(0)!=msg.sender);
        _houses[_index].revertPurchase();
        return (true);
    }
    event Wanted (
        uint256 _houseIndex,
        address _owner,
        address _buyer,
        uint256 _price
    );
    event Pending (
        uint256 _houseIndex
    );
    event Confirmed (
        address _owner,
        address _buyer,
        uint256 _price
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