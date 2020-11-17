'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Bitron_902010_22 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		// alarm_motion
		//this.registerCapability('alarm_motion', CLUSTER.IAS_ZONE);

		// Capture the zoneStatusChangeNotification
		zclNode.endpoints[1].clusters.iasZone
			.onZoneStatusChangeNotification = payload => {
			this.onIASZoneStatusChangeNoficiation(payload);
		};
    }

    onIASZoneStatusChangeNoficiation({
		zoneStatus, extendedStatus, zoneId, delay,
	}) {
		this.log('IASZoneStatusChangeNotification:', zoneStatus, extendedStatus, zoneId, delay);
		this.setCapabilityValue('alarm_motion', zoneStatus.alarm1);
		this.setCapabilityValue('alarm_battery', zoneStatus.battery);
	}
}

module.exports = Bitron_902010_22;