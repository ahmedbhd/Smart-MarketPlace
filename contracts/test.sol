pragma solidity >=0.4.25 <0.6.0;

contract test { 
    uint myVariable;

    constructor (uint256 _var) public { 
        myVariable = _var;

    } 
    function setValue(uint256 x) public {

        myVariable = x;

    } 
    
    function getValue()  public view returns (uint256) {

        return myVariable;

    }

}

