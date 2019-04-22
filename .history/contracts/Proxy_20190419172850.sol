pragma solidity >=0.4.25 <= 0.5.7;
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
      
    function getHousesNbr() public view returns (uint256){
        return _housesNumber;
    }
    function getMyPurchasesNbr() public view returns (string memory){
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_purchasesNumber; _i++) {
            bool isDeleted = _purchases[_i].isDeleted();
            if (!isDeleted){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    function getMyPendingNbr() public view returns (string memory){
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_purchasesNumber; _i++) {
            bool isDeleted = _purchases[_i].isDeleted();
            uint256 _house = _purchases[_i].getHouseIndex();
            bool pending =  _purchases[_i].getBuyerConfirmation();
            if ((!isDeleted)&&(_houses[_house].getBuyer()==msg.sender)&&(!pending)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    function getMyInProgressNbr() public view returns (string memory){
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_purchasesNumber; _i++) {
            bool isDeleted = _purchases[_i].isDeleted();
            uint256 _house = _purchases[_i].getHouseIndex();
            bool inProgress =  _purchases[_i].getSellerConfirmation();
            if ((!isDeleted)&&(_houses[_house].getOwner()==msg.sender)&&(!inProgress)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    
    function getHouseAt(uint256 _index) public view returns(string memory, string memory, uint, uint, address, address ){
        string memory _location;
        string memory _area;
        uint256 _price;
        uint256 _state;
        address _owner;
        address _buyer;
            _location= _houses[_index].getLocation();
            _area=_houses[_index].getArea();
            _price=_houses[_index].getPrice();
            _state=_houses[_index].getState();
            _owner=_houses[_index].getOwner();
            _buyer=_houses[_index].getBuyer();
        
        return (
            _location,
            _area,
            _price,
            _state,
            _owner,
            _buyer);
    }
    function deleteHouseAt(uint256 _index) public returns(bool){
        delete _houses[_index];
        return (true);
    }
    function getPurchaseAt(uint256 _index) public view returns(Purchase){
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
    /* function getMyInProgressHouses() public view returns (string memory){
        require(msg.sender!=address(0));
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_housesNumber; _i++) {
            if ((_houses[_i].getOwner()==msg.sender) && (_houses[_i].getState()==3)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    }
    function getMyPendingHouses() public view returns (string memory){
        require(msg.sender!=address(0));
        string memory _tab;
        string memory _j;
        uint256 _k;
        for (uint256 _i=1; _i<=_housesNumber; _i++) {
            if ((_houses[_i].getBuyer()==msg.sender) && (_houses[_i].getState()==2)){
                _k=_i;
                _j = _k.uint2str();
                _tab=_tab.concat(_j);
                _tab = _tab.concat( ";");
            }
        }
        return (_tab);
    } */
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
    function setHouseAsWanted (uint256 _index) public {
        require(address(0)!=msg.sender);
        emit Wanted(_index,_houses[_index].getOwner(),msg.sender,_houses[_index].getPrice());
    }
    // the clearing house creates a purchase contract and notifies the buyer
    function addPendingPurchase(uint256 _houseIndex,address _buyer, address _bank, address _insurance, string memory _loan,uint256 _date,string memory _forBank,string memory _forInsurance,string memory _advance) public returns (bool){
        _purchasesNumber++;
        _purchases[_purchasesNumber] =new Purchase();
        _purchases[_purchasesNumber].setArguments(
             _houses[_houseIndex].getOwner(),
             _buyer,
             _bank,
             _insurance,
             _houseIndex,
             _loan,
             _date,
             _forBank,
             _forInsurance,
             _advance
        );
        _setHousePending(_houseIndex,_buyer);
        return true;
    }
    function _setHousePending(uint256 _index, address _buyer) internal  {
        _houses[_index].setPending();
        _houses[_index].setBuyer(_buyer);
    }
    // the clearing house creates a purchase and notifies the seller
    function addInProgressPurchase(uint256 _purchaseIndex,uint256 _houseIndex, address _buyer, address _bank, address _insurance, string memory _loan,uint256 _date,string memory _forBank,string memory _forInsurance,string memory _advance) public returns (bool){
        if (_purchaseIndex ==0){
            _purchasesNumber++;
            _purchases[_purchasesNumber] =new Purchase();
            _purchases[_purchasesNumber].setArguments(
                 _houses[_houseIndex].getOwner(),
                 _buyer,
                 _bank,
                 _insurance,
                 _houseIndex,
                 _loan,
                 _date,
                 _forBank,
                 _forInsurance,
                 _advance
            );
            _purchases[_purchasesNumber].setBuyerConfirmation();
        }else{
            _purchases[_purchaseIndex].setBuyerConfirmation();
        }
        _setHouseInProgress(_houseIndex,_buyer);
        return true;
    }
    function setPurchaseAsInProgress(uint256 _purchaseIndex) public returns (bool){
        uint256 _houseIndex = _purchases[_purchaseIndex].getHouseIndex();
        _purchases[_purchaseIndex].setBuyerConfirmation();
        _setHouseInProgress(_houseIndex,msg.sender);
        return true;
    }
    function _setHouseInProgress(uint256 _houseIndex, address _buyer) internal returns (bool) {
        _houses[_houseIndex].setInProgress();
        _houses[_houseIndex].setBuyer(_buyer);
        return true;
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setPurchaseAsConfirmed(uint256 _purchaseIndex) public returns (bool){
        _purchases[_purchaseIndex].setBuyerConfirmation();
        uint256 _houseIndex = _purchases[_purchaseIndex].getHouseIndex();
        _setHouseAsConfirmed(_houseIndex,_houses[_houseIndex].getOwner(),_houses[_houseIndex].getBuyer(),_houses[_houseIndex].getPrice());
        return (true);
    }
    function _setHouseAsConfirmed(uint256 _index , address _owner,address _buyer, uint256 _price) internal {
        require(address(0)!=msg.sender);
        emit Confirmed(_index,_owner,_buyer,_price);
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function _setHouseAsCanceled(uint256 _houseIndex, uint256 _purchaseIndex) internal returns (bool) {
        require(address(0)!=msg.sender);
        _houses[_houseIndex].setCanceled();
        _purchases[_purchaseIndex].deletePurchase();
        return true;
    }
    // transfer the ownership of the wanted house to the buyer
    function transferHouseFrom(uint256 _index,address _from, address _to) public returns(bool){
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
        uint256 _houseIndex,
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