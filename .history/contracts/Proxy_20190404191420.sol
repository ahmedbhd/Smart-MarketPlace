pragma solidity >=0.4.22 <0.6.0;
import "./Home.sol";
contract Proxy{
    mapping (uint256 => Home) private _homes;
    uint256 private _homesNumber;
    constructor() public {
        _homesNumber=0;
    }
    
    function createHome(string memory area,string memory location, uint256 price) public returns (bool){
        _homes[_homesNumber+1] = new Home(area,location,price,msg.sender);
        return true;
    }
    
    
}