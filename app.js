// The object 'Contracts' will be injected here, which contains all data for all contracts, keyed on contract name:
// Contracts['MyContract'] = {
//  abi: [],
//  address: "0x..",
//  endpoint: "http://...."
// }

function Junto(Contract) {
    this.web3 = null;
    this.instance = null;
    this.Contract = Contract;
}

Junto.prototype.onReady = function() {
    this.init(function () {
        $('#message').append("DApp loaded successfully.");
    });
    this.updateDisplay();
    this.bindButton();
}

Junto.prototype.init = function(cb) {
    // We create a new Web3 instance using either the Metamask provider
    // or an independent provider created towards the endpoint configured for the contract.
    this.web3 = new Web3(
        (window.web3 && window.web3.currentProvider) ||
        new Web3.providers.HttpProvider(this.Contract.endpoint));

    // Create the contract interface using the ABI provided in the configuration.
    var contract_interface = this.web3.eth.contract(this.Contract.abi);

    // Create the contract instance for the specific address provided in the configuration.
    this.instance = contract_interface.at(this.Contract.address);

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
        "0xa48f2e0be8ab5a04a5eb1f86ead1923f03a207fd",
        "0xa48f2e0be8ab5a04a5eb1f86ead1923f03a207fd",
        "0xa48f2e0be8ab5a04a5eb1f86ead1923f03a207fd",
        10,
        10,
        10,
        {
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
            }
        }
    );
};

Junto.prototype.signContractLender = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.signContractLender(
        {
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
            }
        }
    );
};

Junto.prototype.signContractBorrower = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.signContractBorrower(
        {
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
            }
        }
    );
};

Junto.prototype.resolveContractLender = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.resolveContractLender(
        {
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
            }
        }
    );
};

Junto.prototype.resolveContractBorrower = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.resolveContractBorrower(
        {
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
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
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
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
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
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
            from: window.web3.eth.accounts[0],
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
            }
        }
    );
};

Junto.prototype.payBorrowerPayment = function() {
    var that = this;
    // this.showLoader(true);
    //Sets message using the public update function of the smart contract
    this.instance.payBorrowerPayment(
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
                that.waitForReceipt(txHash, function(receipt) {
                    that.showLoader(false);
                    if (receipt.status) {
                        console.log({ receipt });
                    } else {
                        console.log("error");
                    }
                });
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
        }
        if (result == 4){
            $("#contractstate").text("resolved");
        }
        
    });
};

Junto.prototype.bindButton = function() {
    var that = this;

    $(document).on("click", "#specify-contract", function() {
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
        that.payBorrowerCollatera();
        that.updateDisplay();
    });
    $(document).on("click", "#pay-borrower-payment", function() {
        that.payBorrowerPayment();
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

if(typeof(Contracts) === "undefined") var Contracts={ MyContract: { abi: [] }};
var junto = new Junto(Contracts['Junto']);

$(document).ready(function() {
    junto.onReady();
});