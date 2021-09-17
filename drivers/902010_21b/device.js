'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Bitron_902010_21B extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		if (!this.hasCapability('alarm_contact')) {
			this.addCapability('alarm_contact');
		}
		if (!this.hasCapability('alarm_tamper')) {
			this.addCapability('alarm_tamper');
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
		this.log('IASZoneStatusChangeNotification (Parsed):',zoneStatus.alarm1,zoneStatus.tamper,zoneStatus.battery);

		var settings = this.getSettings();

		this.setCapabilityValue('alarm_contact', ( settings.inverse_enabled ? !zoneStatus.alarm1 : zoneStatus.alarm1));
		this.setCapabilityValue('alarm_tamper', zoneStatus.tamper)
		this.setCapabilityValue('alarm_battery', zoneStatus.battery);
	}
}

module.exports = Bitron_902010_21B;