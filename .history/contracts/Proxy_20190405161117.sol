pragma solidity >=0.4.22 <0.6.0;
import "./Home.sol";
contract Proxy{
    mapping (uint256 => Home) private _homes;
    uint256 private _homesNumber;
    mapping (uint256 => address) private _purchases;
    uint256 private _purchasesNumber;
    constructor() public {
        _purchasesNumber =_homesNumber=0;
    }
    function addHome(string memory _area,string memory _location, uint256 _price) public returns (bool){
        _homesNumber++;
        _homes[_homesNumber] =new Home(_area,_location,_price,msg.sender);
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
    function getPurchasesNbr() public view returns (uint256){
        return _purchasesNumber;
    }
    function getHomeAt(uint256 _index) public view returns(Home){
        return (_homes[_index]);
    }
    function getPurchaseAt(uint256 _index) public view returns(address){
        return (_purchases[_index]);
    }
    // the buyer invokes this function to initiate a purchase and notifies the clearing house
    function setHomeAtAsWanted (uint256 _index) public {
        require(address(0)!=msg.sender);
        emit Event(msg.sender,"wanted",_index);
    }
    // the clearing house creates a purchase and notifies the seller
    function setHomeAsPending(uint256 _index , address _buyer) public {
        require(address(0)!=msg.sender);
        _homes[_index].setPending();
        emit Event(_buyer,"pending",_index);
    }
    // the seller confirmes the purchase and notifies back the clearing house
    function setHomeAsConfirmed(uint256 _index, address _buyer) public {
        require(address(0)!=msg.sender);
        _homes[_index].setConfirmed(msg.sender);
        emit Event(_buyer,"confirmed",_index);
    }

    event Event (
        address _from,
        string _msg,
        uint256 _homeIndex
    );
}