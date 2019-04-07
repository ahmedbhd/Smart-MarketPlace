pragma solidity >=0.4.22 <0.6.0;
import "./Home.sol";
contract Proxy{
    mapping (uint256 => address) private _homes;
    uint256 private _homesNumber;
    constructor() public {
        _homesNumber=0;
    }
    
    function createHome(address _home) public returns (bool){
        _homesNumber++;
        _homes[_homesNumber] =_home;
        return true;
    }
    
    
}