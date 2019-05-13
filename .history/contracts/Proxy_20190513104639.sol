pragma solidity >=0.4.25 <= 0.5.7;
import "./House.sol";
import "./Purchase.sol";
contract Proxy{
    using Strings for string;
    using Uints for uint256;
    struct aHouse {
        bool deleted;
        House house;
    }
    struct aPurchase {
        bool deleted;
        Purchase purchase;
    }
    mapping (uint256 => aHouse) private _houses;
    uint256 private _housesNumber;
    mapping (uint256 => aPurchase) private _purchases;
    uint256 private _purchasesNumber;
    constructor()public{
        _purchasesNumber=_housesNumber=0;
    }
    function addHouse(string memory _location,string memory _area,string memory _rooms, uint256 _price) public returns (bool){
        _housesNumber++;
        _houses[_housesNumber].house=new House();
        string memory _a=_area.concat("/");
        _a = _area.concat(_rooms);
        _houses[_housesNumber].house.setArguments(_location,_a,_price,msg.sender);
        return true;
    }
    function getHousesNbr() public view returns (uint256){
        return _housesNumber;
    }
    function getPurchasesNbr() public view returns (string memory){
        string memory _tab;
        string memory _j;
        uint256 _k;
        for(uint256 _i=1;_i<=_purchasesNumber;_i++){
            bool isDeleted=_purchases[_i].deleted;
            if (!isDeleted){
                _k=_i;
                _j=_k.uint2str();
                _tab=_tab.concat(_j);
                _tab=_tab.concat( ";");
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
        if (!_houses[_index].deleted){
            _location=_houses[_index].house.getLocation();
            _area=_houses[_index].house.getArea();
            _price=_houses[_index].house.getPrice();
            _state=_houses[_index].house.getState();
            _owner=_houses[_index].house.getOwner();
            _buyer=_houses[_index].house.getBuyer();
        }
        return (
            _location,
            _area,
            _price,
            _state,
            _owner,
            _buyer);
    }
    function deleteHouseAt(uint256 _index) public returns(bool){
        delete _houses[_index].house;
        _houses[_index].deleted = true;
        for(uint256 _i=1;_i<=_purchasesNumber;_i++){
            bool isDeleted = _purchases[_i].deleted;
            if (!isDeleted && _purchases[_i].purchase.getHouseIndex()==_index){
                _purchases[_i].deleted = true;
                delete _purchases[_i].purchase;
            }
        }
        return (true);
    }
    function getPurchaseAt(uint256 _index) public view returns(Purchase ,string memory){
        string memory _strings = _houses[_purchases[_index].purchase.getHouseIndex()].house.getLocation();
        return (_purchases[_index].purchase,_strings);
    }
    function getPurchaseLoanAt(uint256 _index) public view returns(string memory){
        return (_purchases[_index].purchase.getLoan());
    }
    function getMyHouses() public view returns (string memory){
        require(msg.sender!=address(0));
        string memory _tab;
        string memory _j;
        uint256 _k;
        for(uint256 _i=1;_i<=_housesNumber;_i++){
            if (!_houses[_i].deleted)
                if (_houses[_i].house.getOwner()==msg.sender){
                    _k=_i;
                    _j=_k.uint2str();
                    _tab=_tab.concat(_j);
                    _tab=_tab.concat( ";");
                }
        }
        return (_tab);
    }
    // the buyer invokes this function to initiate a purchase and notifies the clearing house
    function setHouseAsWanted (uint256 _index) public {
        require(address(0)!=msg.sender);
        emit Wanted(_index,_houses[_index].house.getOwner(),msg.sender,_houses[_index].house.getPrice());
    }
    // the clearing house creates a purchase contract and notifies the buyer
    function addPendingPurchase(string memory _ref,uint256 _houseIndex,address _buyer,address _bank,address _insurance,
        string memory _loan,uint256 _date,string memory _forBank,string memory _forInsurance,string memory _advance) public returns (bool){
        _purchasesNumber++;
        _purchases[_purchasesNumber].purchase=new Purchase();
        _purchases[_purchasesNumber].purchase.setArguments(
             _houses[_houseIndex].house.getOwner(),
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
        _purchases[_purchasesNumber].purchase.setRef(_ref);
        _setHousePending(_houseIndex,_buyer);
        return true;
    }
    function _setHousePending(uint256 _index, address _buyer) internal  {
        _houses[_index].house.setPending();
        _houses[_index].house.setBuyer(_buyer);
    }
    // the clearing house creates a purchase and notifies the seller
    function addInProgressPurchase(string memory _ref,uint256 _purchaseIndex,uint256 _houseIndex,address _buyer,
        address _bank,address _insurance,string memory _loan,uint256 _date,string memory _forBank,string memory _forInsurance,string memory _advance) public returns (bool){
        if (_purchaseIndex==0){
            _purchasesNumber++;
            _purchases[_purchasesNumber].purchase=new Purchase();
            _purchases[_purchasesNumber].purchase.setArguments(
                 _houses[_houseIndex].house.getOwner(),
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
            _purchases[_purchasesNumber].purchase.setRef(_ref);
            _purchases[_purchasesNumber].purchase.setBuyerConfirmation();
        }else{
            _purchases[_purchaseIndex].purchase.setBuyerConfirmation();
        }
        _setHouseInProgress(_houseIndex,_buyer);
        return true;
    }
    function setPurchaseAsInProgress(uint256 _purchaseIndex,uint256 _houseIndex) public returns (bool){
        require(msg.sender==_houses[_houseIndex].house.getBuyer());
        _purchases[_purchaseIndex].purchase.setBuyerConfirmation();
        _setHouseInProgress(_houseIndex,msg.sender);
        return true;
    }
    function _setHouseInProgress(uint256 _houseIndex, address _buyer) internal returns (bool) {
        _houses[_houseIndex].house.setInProgress();
        _houses[_houseIndex].house.setBuyer(_buyer);
        return true;
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setPurchaseAsConfirmed(uint256 _purchaseIndex,uint256 _houseIndex) public returns (bool){
        _purchases[_purchaseIndex].purchase.setSellerConfirmation();
        _setHouseAsConfirmed(_purchaseIndex,_houseIndex,_houses[_houseIndex].house.getOwner(),
            _houses[_houseIndex].house.getBuyer(),_houses[_houseIndex].house.getPrice(),
            _purchases[_purchaseIndex].purchase.getAdvance());
        return (true);
    }
    function _setHouseAsConfirmed(uint256 _purchaseIndex,uint256 _houseIndex,
        address _owner,address _buyer,uint256 _price,string memory _advance)internal{
        require(address(0)!=msg.sender);
        emit Confirmed(_purchaseIndex,_houseIndex,_owner,_buyer,_price,_advance);
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setPurchaseAsCanceled(uint256 _houseIndex, uint256 _purchaseIndex) public returns (bool) {
        require(address(0)!=msg.sender);
        _houses[_houseIndex].house.setCanceled();
        _purchases[_purchaseIndex].deleted=true;
        delete _purchases[_purchaseIndex].purchase;
        return true;
    }
    // transfer the ownership of the wanted house to the buyer
    function transferHouseFrom(uint256 _index,address _from,address _to) public returns(bool){
        require(address(0)!=msg.sender);
        require(address(0)!=_to);
        require(_index<=_housesNumber);
        return (_houses[_index].house.transfer(_from,_to));
    }
    // transfer the ownership of the wanted house to the buyer
    function revertPurchaseOf(uint256 _index) public returns(bool){
        require(address(0)!=msg.sender);
        _houses[_index].house.revertPurchase();
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
        uint256 _purchaseIndex,
        uint256 _houseIndex,
        address _owner,
        address _buyer,
        uint256 _price,
        string _loan
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
    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString){
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