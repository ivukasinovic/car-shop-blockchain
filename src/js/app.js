App = {
  web3Provider: null,
  contracts: {},
  cars: [],
  administrator: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("SmartCar.json", function(data) {
      var SmartCarArtifact = data;
      App.contracts.SmartCar = TruffleContract(SmartCarArtifact);

      App.contracts.SmartCar.setProvider(App.web3Provider);
    });
    App.initCarsForSale();
    return App.bindEvents();
  },

  initCarsForSale: function() {
    event.preventDefault();
    cars = [];

    var smartCarInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      setTimeout(() => {
        App.contracts.SmartCar.deployed()
          .then(function(instance) {
            smartCarInstance = instance;
            administrator = smartCarInstance
              .getAdministrator()
              .then(function(address) {
                if (address === account) {
                  administrator = true;
                  document.getElementById("addCar").style.visibility =
                    "visible";
                } else {
                  administrator = false;
                  document.getElementById("addCar").style.visibility = "hidden";
                }
              });
            return smartCarInstance.carsCount();
          })
          .then(function(carsCount) {
            var carsRow = $("#carsRow");
            var carTemplate = $("#carTemplate");
            for (var i = 1; i <= carsCount; i++) {
              smartCarInstance.cars(i).then(function(car) {
                cars.push(car);
                if ((!car[6] && administrator) || car[6]) {
                  var brand = car[1];
                  var model = car[2];
                  var licence = car[3];
                  var owner = car[5];
                  var picture = car[4];
                  var price = car[7];
                  carTemplate.find(".car-brand").text(brand);
                  carTemplate.find(".car-model").text(model);
                  carTemplate.find(".car-licence").text(licence);
                  carTemplate
                    .find(".car-price-text")
                    .text(price / 1000000000000000000);
                  carTemplate
                    .find(".car-owner-text")
                    .text(owner.substring(0, 8) + "...");
                  carTemplate.find(".btn-description").attr("data-id", car[0]);
                  carTemplate.find(".btn-buy").attr("data-id", car[0]);
                  carTemplate.find(".img-rounded")[0].src = picture;
                  if (car[6]) {
                    carTemplate.find(".img-sale")[0].style.visibility =
                      "visible";
                    carTemplate.find(".btn-buy")[0].style.visibility =
                      "visible";
                    carTemplate.find(".btn-description")[0].style.visibility =
                      "visible";
                    carTemplate.find(".car-price-text")[0].style.visibility =
                      "visible";
                  } else {
                    carTemplate.find(".img-sale")[0].style.visibility =
                      "hidden";
                    carTemplate.find(".btn-buy")[0].style.visibility = "hidden";
                    carTemplate.find(".btn-description")[0].style.visibility =
                      "hidden";
                    carTemplate.find(".car-price-text")[0].style.visibility =
                      "hidden";
                  }

                  carsRow.append(carTemplate.html());
                }
              });
            }
          })
          .catch(function(err) {
            console.log(err.message);
          });
      });
    });
  },

  handleCarsForSale: function() {
    event.preventDefault();
    var carSelect = $("#carSelect");
    carSelect.empty();
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      cars.forEach(car => {
        if (car[5] === account) {
          var candidateOption =
            "<option value='" +
            car[0].toNumber() +
            "' >" +
            `${car[1]} 
            ${car[2]}` +
            "</ option>";
          carSelect.append(candidateOption);
        }
      });
    });
  },

  bindEvents: function() {
    $(document).on("click", ".btn-add", App.handleAdd);
    $(document).on("click", ".btn-put-on-sale", App.handlePutOnSale);
    $(document).on("click", ".btn-buy", App.handleBuy);
    $(document).on("click", ".btn-count", App.handleCount);
    $(document).on("click", ".btn-description", App.handleDescription);
    $(document).on("click", ".btn-sell-car", App.handleCarsForSale);
  },

  handleAdd: function(event) {
    event.preventDefault();

    var carBrand = document.getElementById("car-brand").value;
    var carModel = document.getElementById("car-model").value;
    var carLicence = document.getElementById("car-licence").value;
    var carPicture = document.getElementById("car-picture").value;
    var carOwner = document.getElementById("car-owner").value;

    var SmartCarInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.SmartCar.deployed()
        .then(function(instance) {
          SmartCarInstance = instance;
          return SmartCarInstance.addCar(
            carBrand,
            carModel,
            carLicence,
            carPicture,
            carOwner,
            { from: account }
          );
        })
        .then(function(result) {
          alert("Successfully added car to the blockchain!");
          this.location.reload();
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  },

  handleBuy: function(event) {
    event.preventDefault();
    var smartCarInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var carId = parseInt($(event.target).data("id"));
      App.contracts.SmartCar.deployed().then(function(instance) {
        smartCarInstance = instance;
        var logger = instance.printLog();
        logger.watch(function(err, result) {
          console.log("LOG", result);
        });
        load_up = {
          from: account,
          to: smartCarInstance.address,
          value: cars[carId - 1][7].toNumber()
        };
        return smartCarInstance.buyCar
          .sendTransaction(carId, load_up)
          .then(function(result) {
            alert("Successfully buyed car");
            window.location.reload();
          })
          .catch(function(err) {
            console.log(error);
          });
      });
    });
  },

  handleCount: function(event) {
    event.preventDefault();

    var smartCarInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.SmartCar.deployed()
        .then(function(instance) {
          smartCarInstance = instance;

          return smartCarInstance.getCarsForSaleLength({ from: account });
        })
        .then(function(result) {
          alert(result.toNumber());
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  },

  handleDescription: function(event) {
    event.preventDefault();
    var carId = parseInt($(event.target).data("id"));
    console.log("carId", carId);
    if (cars[carId - 1][9]) {
      alert(cars[carId - 1][9]);
    } else {
      alert(CONTRACT);
    }
  },

  handlePutOnSale: function(event) {
    const carId = $("#carSelect")[0].value;
    const price = $("#car-price")[0].value * 1000000000000000000;
    const addons = $("#car-addons")[0].value;
    event.preventDefault();

    var smartCarInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.SmartCar.deployed()
        .then(function(instance) {
          smartCarInstance = instance;

          return smartCarInstance.putOnSale(carId, price, addons, {
            from: account
          });
        })
        .then(function(result) {
          alert("You have successfully put a car for sale!");
          this.location.reload();
        })
        .catch(function(err) {
          console.log(err.message);
        });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
const CONTRACT =
  "1. Prodavac se obavezuje da motorno vozilo sa odgovarajućim ispravama preda kupcu i prenese mu pravo raspolaganja, odnosno pravo svojine, na dan isplate prodajne cene vozila. \n 2. Kupac kupuje od prodavca motorno vozilo, koje je predmet ovog ugovora, po viđenju i u nađenom stanju. Kupac se obavezuje da isplati prodavcu prodajnu cenu motornog vozila. \n 3. Prodavac odgovara ako na prodatom vozilu postoji neko pravo trećeg lica koje isključuje,umanjuje ili ograničava kupčevo pravo.  \n 4. U slucaju spora iz ovog ugovora resavace redovan sud nadlezan prema prebivalistu prodavca.";
