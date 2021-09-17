const { MeteringCluster, ZCLDataTypes } = require('zigbee-clusters');

class BitronSpecificMeteringCluster extends MeteringCluster {
  
  static get ATTRIBUTES() {
    return {
      ...super.ATTRIBUTES,
      unitofMeasure: {
        id: 768,
        type: ZCLDataTypes.enum8({
          "kWh binary": 0,
          "binary": 11,
          "kWh bcd": 128 ,
          "bcd": 139
        })
      },
      summationFormatting: {
        id: 771,
        type: ZCLDataTypes.uint8
      },
      demandFormatting: {
        id: 772,
        type: ZCLDataTypes.uint8
      },
      meteringDeviceType: {
        id: 774,
        type: ZCLDataTypes.uint8
        //type: ZCLDataTypes.map8('Electric', 'Gas','Water','Thermal','Pressure','Heat','Cooling','Gas Mirrored','Water Mirrored','Thermal Mirrored','Pressure Mirrored','Heat Mirrored','Cooling Mirrored')
      }
    };
  }

}

module.exports = BitronSpecificMeteringCluster;