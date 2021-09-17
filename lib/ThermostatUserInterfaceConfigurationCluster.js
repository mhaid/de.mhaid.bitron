'use strict';

const { Cluster, ZCLDataTypes } = require('zigbee-clusters');

const ATTRIBUTES = {
  temperatureDisplayMode: { 
    id: 0, 
    type: ZCLDataTypes.enum8({
      celsius: 0,
      fahrenheit: 1,
    }),
  },
  keypadLockout: { 
    id: 1, 
    type: ZCLDataTypes.enum8({
      no: 0,
      level1: 1,
      level2: 2,
    }),
  },
};

const COMMANDS = { };

class ThermostatUserInterfaceConfigurationCluster extends Cluster {

  static get ID() {
    return 516;
  }

  static get NAME() {
    return 'thermostatUserInterfaceConfiguration';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

module.exports = ThermostatUserInterfaceConfigurationCluster;
