pragma solidity >=0.4.25 <0.6.0;


contract Product {

    uint public idProduct;
    string public pType;
    string public name;
    uint public harDate;
    uint public shipDate;
    string public shipAddr;
    uint public quantity;       
    uint public addrOwner;
    uint public addrPrvOwner;
    uint public creator;
    bool public shipped;

    // function checkIfOwner(uint _a) public returns (bool) {
    //     return(addrOwner == _a);
    // }

    function setShipDate(uint _d) public {
        shipDate = _d;
    }

    function setShipAddress(string memory _d) public {
        shipAddr = _d;
    }

    function setCreator (uint _a) public {
        creator = _a;
    }

    function setShipped (bool _a) public {
        shipped = _a;
    }

    function setAddrPrvOwner (uint _a) public {
        addrPrvOwner = _a;
    }
    constructor () public payable{

    }
    // This is the constructor which registers the
    // creator and the assigned name.
    function setProductArguemtns (uint _id,string memory _pType,string memory _name,uint _harDate,string memory _shipAddr,uint _quantity,uint _owner) public {
        idProduct = _id;
        pType = _pType;
        harDate = _harDate;
        addrOwner = _owner;
        quantity = _quantity;
        creator = _owner;
        name = _name;
        shipAddr = _shipAddr;
        shipped = false;
    }

    // function Transfer(uint _owner,uint _newOwner) public {
    //     // Only the current owner can transfer the token.
    //     if ((_newOwner == addrOwner) && (!checkIfOwner(_owner)) )
    //     return;
    //     addrOwner = _newOwner;
    //     addrPrvOwner = _owner;
    // }

    function setShippedProduct () public {
        shipped = true;
    }
    
    function getAddrOwner() public view returns (uint) {
        return addrOwner;
    }
    
    function getAddrPrvOwner() public view returns (uint) {
        return addrPrvOwner;
    }
    
    function getType() public view  returns (string memory) {
        return pType;
    }
    
    function getName() public view  returns (string memory) {
        return name;
    }
    
    function getHarDate() public view  returns (uint) {
        return harDate;
    }
    
    function getQuantity() public view  returns (uint) {
        return quantity;
    }
    
    function getCreator() public view  returns (uint) {
        return creator;
    }
    
    function getAddr() public  view returns (string memory) {
        return shipAddr;
    }
    
    function getShipped() public  view returns (bool) {
        return shipped;
    }
    
    function getIdProduct() public view  returns (uint) {
        return idProduct;
    }
    
    function getShipDate() public  view returns (uint) {
        return shipDate;
    }
    
    
}
