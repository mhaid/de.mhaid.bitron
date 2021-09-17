'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Bitron_902010_33 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		if (!this.hasCapability('alarm_motion')) {
			this.addCapability('alarm_motion');
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
		this.log(zoneStatus.alarm2,zoneStatus.battery);

		this.setCapabilityValue('alarm_motion', zoneStatus.alarm2);
		this.setCapabilityValue('alarm_battery', zoneStatus.battery);
	}
}

module.exports = Bitron_902010_33;