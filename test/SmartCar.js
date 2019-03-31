var SmartCar = artifacts.require('./SmartCar.sol');

contract('SmartCar', function(accounts) {
  it(
    ('initializes with two candidate',
    function() {
      return SmartCar.deployed()
        .then(function(instance) {
          return instance.carsCount();
        })
        .then(function(count) {
          assert.equal(count, 2);
        });
    })
  );
});
