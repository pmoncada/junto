//  abi: [],
//  address: "0x..",
//  endpoint: "http://...."
// }
if(typeof(Contracts) === "undefined") var Contracts={ 'Junto': {
  abi: [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "borrowerAddr", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "borrowerCollateralDeposited", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "borrowerCollateralValue", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "borrowerPaymentDeposited", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "borrowerPaymentValue", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "borrowerReadyToResolve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "borrowerSignedContract", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "contractState", "outputs": [ { "internalType": "enum Junto.State", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "destroyContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "forwardingAddr", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lenderAddr", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lenderCollateralDeposited", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lenderCollateralValue", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lenderReadyToResolve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lenderSignedContract", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nukeContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "removeSignatureFromContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "setReadyToResolve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "signContract", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "lenderAddress", "type": "address" }, { "internalType": "address payable", "name": "borrowerAddress", "type": "address" }, { "internalType": "address payable", "name": "forwardingAddress", "type": "address" }, { "internalType": "uint256", "name": "lenderCollateralAmount", "type": "uint256" }, { "internalType": "uint256", "name": "borrowerCollateralAmount", "type": "uint256" }, { "internalType": "uint256", "name": "borrowerPaymentAmount", "type": "uint256" } ], "name": "specifyContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "undoReadyToResolve", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]
}};

function Junto(Contract) {
    this.web3 = null;
    this.instance = null;
    this.Contract = Contract;
}

Junto.prototype.onReady = function(address) {
    this.init(address, function () {
        $('#message').append("Welcome to Junto");
    });
    this.updateDisplay();
    this.bindButton();
}

Junto.prototype.init = function(address, cb) {
    // We create a new Web3 instance using either the Metamask provider
    // or an independent provider created towards the endpoint configured for the contract.
    this.web3 = new Web3(
        (window.web3 && window.web3.currentProvider) ||
        new Web3.providers.HttpProvider(this.Contract.endpoint));

    // Create the contract interface using the ABI provided in the configuration.
    var contract_interface = this.web3.eth.contract(this.Contract.abi);

    // Create the contract instance for the specific address provided in the configuration.
   console.log(address)
   console.log(address)
    this.instance = contract_interface.at(address);

    cb();
}

Junto.prototype.getState = function(cb) {
    this.instance.contractState(function(error, result) {
        cb(error, result);
    });
};

Junto.prototype.specifyContract = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.specifyContract(
        $("#lender").val(),
        $("#borrower").val(),
        $("#forward").val(),
        Number($("#lenderCollateral").val()),
        Number($("#borrowerCollateral").val()),
        Number($("#initialPayment").val()),
        {
            from: $("#lender").val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000,
        },
        function(error, txHash) {
          console.log(txHash)
          console.log(error)
            //if (error) {
                //console.log(error);
                ////that.showLoader(false);
            //}
            // If success, wait for confirmation of transaction,
            // then clear form value
            //else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            //}
        }
    );
};

Junto.prototype.signContractLender = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.signContract(
        {
            from: $('#lender').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000,
            value: Number($("#lenderCollateral").val())
        },
        function(error, txHash) {
          console.log(txHash)
          console.log(error)
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.signContractBorrower = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.signContract(
        {
            from: $('#borrower').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000,
            value: Number($('#borrowerCollateral').val())
        },
        function(error, txHash) {
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.resolveContractLender = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.setReadyToResolve(
        {
            from: $('#lender').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000
        },
        function(error, txHash) {
          console.log(txHash)
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.resolveContractBorrower = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.setReadyToResolve(
        {
            from: $('#borrower').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000
        },
        function(error, txHash) {
            console.log()
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.lockContract = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.lockContract(
        {
            from: $('#lender').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000
        },
        function(error, txHash) {
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.resolveContract = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.resolveContract(
        {
            from: $('#lender').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000
        },
        function(error, txHash) {
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.nukeContract = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.nukeContract(
        {
            from: $('#lender').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000
        },
        function(error, txHash) {
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.payLenderCollateral = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.payLenderCollateral(
        {
            from: $('#lender').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000,
            value: 10,
        },
        function(error, txHash) {
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.payBorrowerCollateral = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.payBorrowerCollateral(
        {
            from: $('#borrower').val(),
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000,
            value: 10,
        },
        function(error, txHash) {
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.payborrowerInitialPayment = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.payborrowerInitialPayment(
        {
            from: window.web3.eth.accounts[0],
            gas: 100000,
            gasPrice: 100000,
            gasLimit: 100000,
            value: 10,
        },
        function(error, txHash) {
            if (error) {
                console.log(error);
                that.showLoader(false);
            }
            // If success, wait for confirmation of transaction,
            // then clear form value
            else {
                //that.waitForReceipt(txHash, function(receipt) {
                    //that.showLoader(false);
                    //if (receipt.status) {
                        //console.log({ receipt });
                    //} else {
                        //console.log("error");
                    //}
                //});
            }
        }
    );
};

Junto.prototype.updateDisplay = function() {
    this.getState(function(error, result) {
        if (error) {
            $(".error").show();
            return;
        }
        if (result == 0){
            $("#contractstate").text("blank");
        }
        if (result == 1){
            $("#contractstate").text("prepare");
        }
        if (result == 2){
            $("#contractstate").text("locked");
        }
        if (result == 3){
            $("#contractstate").text("nuked");
        }lender
        if (result == 4){
            $("#contractstate").text("resolved");
        }
    });
    this.instance.lenderCollateralValue(function(error, result){
      if(error){
      console.log(result)
      console.log(error)
        $(".error").show();
      }
      $("#lenderCollateral").val(result.toNumber())
    })
    this.instance.borrowerCollateralValue(function(error, result){
      console.log(result)
      console.log(error)
      if(error){
        $(".error").show();
      }
      $("#borrowerCollateral").val(result.toNumber())
    })
    this.instance.lenderAddr(function(error, result){
      console.log(result)
      console.log(error)
      if(error){
        $(".error").show();
      }
      $("#lender").val(result)
    })
    this.instance.borrowerAddr(function(error, result){
      console.log(result)
      console.log(error)
      if(error){
        $(".error").show();
      }
      $("#borrower").val(result)
    })
    this.instance.forwardingAddr(function(error, result){
      console.log(result)
      console.log(error)
      if(error){
        $(".error").show();
      }
      $("#forward").val(result)
    })

};

Junto.prototype.bindButton = function() {
    var that = this;

    $(document).on("click", "#specify-contract", function() {
      console.log("Clicked specify");
        that.specifyContract();
        that.updateDisplay();
    });
    $(document).on("click", "#sign-contract-lender", function() {
        that.signContractLender();
        that.updateDisplay();
    });
    $(document).on("click", "#sign-contract-borrower", function() {
        that.signContractBorrower();
        that.updateDisplay();
    });
    $(document).on("click", "#pay-lender-collateral", function() {
        that.payLenderCollateral();
        that.updateDisplay();
    });
    $(document).on("click", "#pay-borrower-collateral", function() {
        that.payBorrowerCollateral();
        that.updateDisplay();
    });
    $(document).on("click", "#pay-borrower-payment", function() {
        that.payborrowerInitialPayment();
        that.updateDisplay();
    });
    $(document).on("click", "#lock-contract", function() {
        that.lockContract();
        that.updateDisplay();
    });
    $(document).on("click", "#nuke-contract", function() {
        that.nukeContract();
        that.updateDisplay();
    });
    $(document).on("click", "#resolve-contract-lender", function() {
        that.resolveContractLender();
        that.updateDisplay();
    });
    $(document).on("click", "#resolve-contract-borrower", function() {
        that.resolveContractBorrower();
        that.updateDisplay();
    });
    $(document).on("click", "#resolve-contract", function() {
        that.resolveContract();
        that.updateDisplay();
    });
};

var junto = new Junto(Contracts['Junto']);
window.junto=junto;

$(document).ready(function() {
  const queryString = window.location.search;
  var address = "0x6705830a90D68A42a323C81D9f583dCB115F249D";
  //if (queryString){
    //var address = queryString.substr(4);
  //}
  junto.onReady(address);
  //https://www.coolearth.org/cryptocurrency-donations/
  var coolEarthAddress = "0x3c8cB169281196737c493AfFA8F49a9d823bB9c5"
  $("#forward").val(coolEarthAddress)
  window.ethereum.enable(function(err){
    console.log(err);
  })
  window.junto.web3.eth.getAccounts(function(err,a){
      $("#lender").val(a[0])
      console.log(err)
  })
});
