pragma solidity >=0.4.25 <0.6.0;

import "./Product.sol";

contract Food {

    struct proHistory {
        string  pType;
        string  name;
        uint  harDate;
        uint  shipDateToSupp;
        uint  shipDateToRetai;
        string  shipAddrFarmer;
        string  shipAddrToSupp;
        string  shipAddrToRetai;
        uint  quantity;       
        uint  addrFarmer;
        uint  addrSupplier;
        uint  addrRetailer;
        uint  creator;
    }
    struct Company {
        uint id;
        string activity;
        string companyname;
        string location;
    }
    Company[] farmers;
    Company[] suppliers;
    Company[] retailers;
    Product[] products;
    Product[] farmersPro;
    Product[] suppliersPro;
    Product[] retailersPro;
    constructor () public {
    }
    // add a farmer
    function addFarmer(string memory _activity,string memory _username,string memory _location) public returns (uint){
        farmers.length ++;
        farmers[farmers.length-1].id = farmers.length;
        farmers[farmers.length-1].activity = _activity;
        farmers[farmers.length-1].companyname = _username;
        farmers[farmers.length-1].location = _location;
        //return farmers.length;
        emit Event(farmers.length,"addFarmer");
    }
    // add a supplier
    function addSupplier (string memory _activity,string memory _company,string memory _location,uint _type) public returns (uint){
        if (_type==0){
            suppliers.length ++;    // add a supplier
            suppliers[suppliers.length-1].id = suppliers.length;
            suppliers[suppliers.length-1].activity = _activity;
            suppliers[suppliers.length-1].companyname = _company;
            suppliers[suppliers.length-1].location = _location;
            emit Event(suppliers.length,"addSupplier");
        }else{
            retailers.length ++;    //add a retailer
            retailers[retailers.length-1].id = retailers.length;
            retailers[retailers.length-1].activity = _activity;
            retailers[retailers.length-1].companyname = _company;
            retailers[retailers.length-1].location = _location;
            emit Event(retailers.length,"addrRetailer");
        }
        
    }
    //add a product only by a farmer
    function addProduct(string memory _pType,string memory _name,uint _harDate,string memory _shipAddr,uint _quantity, uint _owner ) public returns (uint){
        require(_owner > 0 && _owner <= farmers.length+1);
        Product p = new Product ();
        p.setProductArguemtns (products.length+1,_pType,_name, _harDate,_shipAddr,_quantity,_owner);
        farmersPro.push( p);
        products.push(p);
        emit Event(products.length,"addProduct");
    }
    function ship (uint _productId,uint _owner, uint _addrReceiver,uint _shipDate, uint _receiver, string memory _addr) public {
        require ((_productId >0) && (_productId <= products.length+1));
        Product a;
        Product p;
        // shipment done by the farmer
        if (_receiver == 0) { // checking if the shipment is done by a farmer
            a = getPro(_productId,0);
            if (a.getAddrOwner() != _owner)
            return;
            a.setShippedProduct();
            p = new Product();
            p.setProductArguemtns(a.getIdProduct(),a.getType(),a.getName(),a.getHarDate(),_addr,a.getQuantity(),_addrReceiver);
            p.setShipDate (_shipDate);
            p.setAddrPrvOwner(_owner);
            p.setCreator (a.getCreator());
            suppliersPro.push(p);
            products.push(p);
            emit Event(_productId,"ship");
        }
        // shipment done by the supplier
        if (_receiver == 1) { // checking if the shipment is done by a supplier
            a =getPro(_productId,1);
            if (a.getAddrOwner() != _owner)
            return;
            a.setShippedProduct();
            p = new Product();
            p.setProductArguemtns(a.getIdProduct(),a.getType(),a.getName(),a.getHarDate(),_addr,a.getQuantity(),_addrReceiver);
            p.setShipDate (_shipDate);
            p.setAddrPrvOwner(_owner);
            p.setCreator (a.getCreator());
            retailersPro.push(p);
            products.push(p);
            emit Event(_productId,"ship");
        }
    }
    function getPro(uint id, uint t ) private view returns (Product) {
        uint i ;
        if(t==0){
            for (i=0; i<farmersPro.length;i++){
                if(farmersPro[i].getIdProduct() == id){
                    return farmersPro[i];
                }
            }
        }
        if(t==1){
            for (i=0; i<suppliersPro.length;i++){
                if(suppliersPro[i].getIdProduct() == id){
                    return suppliersPro[i];
                }
            }
        }
    }
    function getProductHistory (uint _productId ) public view returns (
            uint,
            uint,
            uint,
            string memory,
            string memory,
            string memory,
            uint,
            uint,
            uint
        ) {
        require ((_productId >0) && (_productId <= products.length+1));
        proHistory memory ph;
        uint j=0;
        for (uint i=0; i<products.length; i++){
            if (products[i].getIdProduct()==_productId){
                if (j==0){
                    ph.pType = products[i].getType();
                    ph.name= products[i].getName();
                    ph.harDate= products[i].getHarDate();
                    ph.shipAddrFarmer= products[i].getAddr();
                    ph.quantity= products[i].getQuantity();  
                    uint a= products[i].getCreator();
                    ph.addrFarmer= a;
                    j ++;
                    ph.creator= a;
                } else if (j==1) {
                    ph.addrSupplier= products[i].getAddrOwner();
                    ph.shipAddrToSupp= products[i].getAddr();
                    ph.shipDateToSupp= products [i].getShipDate();
                    j ++;
                } else if (j==2){
                    ph.addrRetailer= products[i].getAddrOwner();
                    ph.shipAddrToRetai= products[i].getAddr();
                    ph.shipDateToRetai= products [i].getShipDate();
                    j ++;
                    break;
                }
                    
            }
        }
        return (
                ph.harDate,
                ph.shipDateToSupp,
                ph.shipDateToRetai,
                ph.shipAddrFarmer,
                ph.shipAddrToSupp,
                ph.shipAddrToRetai,
                ph.addrSupplier,
                ph.addrRetailer,
                ph.creator
            );
    }
    function getProductCurrentState(uint _productId ) public view returns (uint,string memory,string memory,uint,uint,string memory,uint,uint,uint,uint,bool){
        Product p ;
        for (uint i=0; i<products.length; i++) {
            if (products[i].getIdProduct() == _productId)
                p = products[i];
        }
        return (p.getIdProduct(),p.getType(),p.getName(),p.getHarDate(),p.getShipDate(),p.getAddr(),p.getQuantity(),p.getAddrOwner(),p.getAddrPrvOwner(),p.getCreator(),p.getShipped());
    }
    event Event(
        uint  _productId,
        string _msg
    );
    function getCompaniesNbr(uint _type) public view returns (uint ){
        if (_type == 0){
            return farmers.length;
        }else if(_type == 1) {
            return suppliers.length;
        }else if(_type == 2) {
            return retailers.length;
        }
    }
    function getCompanyById(uint _idF , uint _type) public view returns (uint ,string memory,string memory,string memory){
        if (_type == 0){
            return (farmers[_idF-1].id ,farmers[_idF-1].activity,farmers[_idF-1].companyname ,farmers[_idF-1].location);
        }else if (_type == 1){
            return (suppliers[_idF-1].id ,suppliers[_idF-1].activity,suppliers[_idF-1].companyname ,suppliers[_idF-1].location);
        }else if (_type == 2){
            return (retailers[_idF-1].id ,retailers[_idF-1].activity,retailers[_idF-1].companyname ,retailers[_idF-1].location);
        }
    }
}