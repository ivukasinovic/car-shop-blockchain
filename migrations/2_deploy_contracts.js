var SmartCar = artifacts.require('./SmartCar.sol');

module.exports = function(deployer) {
  deployer.deploy(SmartCar);
};
