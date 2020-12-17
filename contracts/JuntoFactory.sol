// SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

import "./Junto.sol";

contract JuntoContractFactory {
  // Index of created contracts
  address[] public contracts;

  // Useful to know the row count in contracts index
  function getContractCount() public view 
    returns(uint contractCount) {
    return contracts.length;
  }

  // Potential TODO: Look into clone contracts
  // more complicated but apparently only need
  // to write the state of the contract and not
  // the logic. Apparently is cheaper.
  // Deploys a new contract
  function newJuntoContract() public
    returns(address newContract) {
    Junto junto_contract = new Junto();
    contracts.push(address(junto_contract));
    return address(junto_contract);
  }

  // Question: How do we access this created contract now?
  // We store the address of the contract in Firebase?
}