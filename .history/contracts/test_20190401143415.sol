pragma solidity ^0.4.24;

contract MyFirstContract { 
    uint myVariable;

    constructor (uint256 _var) public { 
        myVariable = _var;

    } 
    function setValue(uint256 x) public {

        myVariable = x;

    } 
    
    function getValue() constant public returns (uint256) {

    return myVariable;

    }

}

