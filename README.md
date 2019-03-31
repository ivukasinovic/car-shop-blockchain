# smart-buying
Blockchain smart contract shop

required: ganache cli,truffle, metamask, node, web3js,

In truffle console execute commands one by one to init database and administrator. 
Import metamask accounts from ganache and change them when need. 

```
SmartCar.deployed().then(function(i) { car = i;})	
car.initializeCars(web3.eth.accounts[1], web3.eth.accounts[2])
car.putOnSale(1, 30000000000000000000,"", {from: web3.eth.accounts[1]})
```

## Smart contract run :
```
truffle compile
truffle migrate
```

## Client app: 
```
npm install
npm run dev
```

