const { PowerConfigurationCluster, ZCLDataTypes } = require('zigbee-clusters');

class BitronSpecificPowerConfigurationCluster extends PowerConfigurationCluster {
  
  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      batteryAlarmState: { id: 62, type: ZCLDataTypes.uint32 },
    };
  }

}

module.exports = BitronSpecificPowerConfigurationCluster;