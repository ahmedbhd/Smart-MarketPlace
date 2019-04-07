pragma solidity >=0.4.22 <0.6.0;
import "./Home.sol";
contract Proxy{
    mapping (uint256 => address) private _homes;
    uint256 private _homesNumber;
    mapping (uint256 => address) private _purchases;
    uint256 private _purchasesNumber;
    constructor() public {
        _purchasesNumber=_homesNumber=0;
    }
    
    function addHome(address _home) public returns (bool){
        _homesNumber++;
        _homes[_homesNumber] =_home;
        return true;
    }
    function getHomesNbr() public view returns (uint256){
        return _homesNumber;
    }
    function getPurchasesNbr() public view returns (uint256){
        return _purchasesNumber;
    }
    function getHomeAt(uint256 _index) public view returns(address){
        return (_homes[_index]);
    }
    function getPurchaseAt(uint256 _index) public view returns(address){
        return (_purchases[_index]);
    }
}