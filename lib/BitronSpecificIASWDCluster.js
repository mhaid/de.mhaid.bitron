const { IASWDCluster, ZCLDataTypes } = require('zigbee-clusters');

class BitronSpecificIASWDCluster extends IASWDCluster {
  
  static get COMMANDS() {
    return {
      ...super.COMMANDS,
      startWarning: {
        id: 0,
        args: {
          warningMode: ZCLDataTypes.enum8({
            'off,off,low': 0,     // 0000 00 00
            'on,off,low': 16,     // 0001 00 00
            'on,off,medium': 17,  // 0001 00 01
            'on,off,high': 18,    // 0001 00 10
            'on,off,vhigh': 19,   // 0001 00 11
            'on,on,low': 20,      // 0001 01 00
            'on,on,medium': 21,   // 0001 01 01
            'on,on,high': 22,     // 0001 01 10
            'on,on,vhigh': 23     // 0001 01 11
          }),
          warningDuration: ZCLDataTypes.uint16,
          strobeDutyCycle: ZCLDataTypes.uint8,
          storbeLevel: ZCLDataTypes.enum8({
            'low': 0,
            'medium': 1,
            'high': 2,
            'veryHigh': 3
          }),
          /*warningMode: ZCLDataTypes.uint8,
          strobe: ZCLDataTypes.enum8({
            off: 0,
            on: 1
          }),
          sirenLevel: ZCLDataTypes.enum8({
            low: 0,
            medium: 1,
            high: 2,
            veryHigh: 3
          }),*/
        },
      },
    };
  }

}

module.exports = BitronSpecificIASWDCluster;