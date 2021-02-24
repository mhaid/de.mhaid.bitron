'use strict';

const IasZoneBoundCluster = require('../../lib/IasZoneBoundCluster');

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

		// Capabilities
		if (!this.hasCapability('alarm_motion')) {
			this.addCapability('alarm_motion');
		}
		if (!this.hasCapability('alarm_battery')) {
			this.addCapability('alarm_battery');
		}

		// Capture the zoneStatusChangeNotification
		zclNode.endpoints[1].bind(CLUSTER.IAS_ZONE.NAME, new IasZoneBoundCluster({
			onZoneStatusChangeNotification: this._onZoneStatusChangeNoficiation.bind(this),
			endpoint: 1,
		}));
	}

	_onZoneStatusChangeNoficiation({ zoneStatus, extendedStatus, zoneId, delay }, endpoint) {
		this.log('IASZoneStatusChangeNotification:', zoneStatus, extendedStatus, zoneId, delay, endpoint);
		this.setCapabilityValue('alarm_motion', zoneStatus.alarm1);
		this.setCapabilityValue('alarm_battery', zoneStatus.battery);
	}
}

module.exports = Bitron_902010_22;