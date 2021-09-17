'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Bitron_902010_37 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		if (!this.hasCapability('alarm_water')) {
			this.addCapability('alarm_water');
		}
		if (!this.hasCapability('alarm_battery')) {
			this.addCapability('alarm_battery');
		}

		// Capture the zoneStatusChangeNotification
		zclNode.endpoints[1].clusters.iasZone
			.onZoneStatusChangeNotification = payload => {
			this.onIASZoneStatusChangeNoficiation(payload);
		};
    }

    onIASZoneStatusChangeNoficiation({zoneStatus, extendedStatus, zoneId, delay}) {
		this.log('IASZoneStatusChangeNotification:', zoneStatus, extendedStatus, zoneId, delay);
		this.log(zoneStatus.alarm1,zoneStatus.battery);

		this.setCapabilityValue('alarm_water', zoneStatus.alarm1);
		this.setCapabilityValue('alarm_battery', zoneStatus.battery);
	}
}

module.exports = Bitron_902010_37;