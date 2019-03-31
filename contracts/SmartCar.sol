pragma solidity ^0.4.22;

contract SmartCar {

    struct Car { 
        uint id;
        string brand;
        string model;
        string licence;
        string picture;
        address owner;
        bool onSale;
        uint256 price;
        uint activeContract;
        string addons;
    }

    struct Contract {
        Car car;
        address seller;
        address buyer;
        string addons;
    }


    address public administrator;
    mapping (uint => Car) public cars;
    mapping (uint => Contract) public contracts;
    uint public carsCount;
    uint public contractsCount;
    
    constructor() public {
        administrator = msg.sender;
    }

    event buyerPay(address buyer, uint value);
    event printLog(address caller, string log, uint id);

    function getAdministrator() public view returns (address) {
        return administrator;
    }

    function getCarsForSaleLength() public view returns (uint) {
        uint carsForSaleLength = 0;
        for(uint i = 0; i < carsCount; i++) {
            if(cars[i].onSale) {
                carsForSaleLength++;
            }
        }
        return carsForSaleLength;
    }

    function initializeCars(address owner1, address owner2) public{
        addCar("Mercedes", "cl43", "BG-314-44","https://bit.ly/2TamlLh", owner1);
        addCar("BMW", "X5", "NS-314-44","https://bit.ly/2GEqG89", owner2);
    }

    function addCar(string memory brand, string memory model, string memory licence, string memory picture, address owner) public {
        require(msg.sender == administrator,"Only administrator can add new car");
        carsCount++;
        cars[carsCount] = Car(carsCount, brand, model, licence, picture, owner, false, 0, 0,"");
    }

    function putOnSale(uint id, uint256 price, string memory addons)  public{
        require(msg.sender == cars[id].owner, "Only car owner can put car on sale");
        contractsCount++;
        contracts[contractsCount] = Contract(cars[id], msg.sender, address(0x0),addons);
        cars[id].onSale = true;
        cars[id].price = price;
        cars[id].addons = addons;
        cars[id].activeContract = contractsCount;
    } 

    function buyCar(uint id) public payable {
         require(id > 0 && id < carsCount, "Car with provided id not exist!");
        require(msg.sender != cars[id].owner, "You cannot buy you car!");
        require(msg.value == cars[id].price, "Price is not correct!");
        contracts[cars[id].activeContract].buyer = msg.sender;
        cars[id].owner = msg.sender;
        cars[id].onSale = false;
        cars[id].activeContract = 0;
        emit printLog(msg.sender, "lola", id);
        emit buyerPay(msg.sender, msg.value);
        cars[id].owner.transfer(address(this).balance);

    }

    function changeOwnership(uint id, address newOwner) public {
        require(msg.sender == cars[id].owner, "Only car owner can change car ownership");
        cars[id].owner = newOwner;
        cars[id].onSale = false;
        cars[id].price = 0;
        cars[id].activeContract = 0;
    }

}