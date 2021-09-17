const { ScenesCluster, ZCLDataTypes } = require('zigbee-clusters');

class BitronSpecificScenesCluster extends ScenesCluster {
  
  static get COMMANDS() {
    return {
      ...super.COMMANDS,
      recall: {
        id: 0x05,
        args: {
          groupId: ZCLDataTypes.uint16,
          sceneId: ZCLDataTypes.uint8,
        },
      },
    };
  }

}

module.exports = BitronSpecificScenesCluster;