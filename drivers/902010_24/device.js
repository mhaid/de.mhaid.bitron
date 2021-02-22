'use strict';

const IasZoneBoundCluster = require('../../lib/IasZoneBoundCluster');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Bitron_902010_24 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		if (!this.hasCapability('alarm_smoke')) {
			this.addCapability('alarm_smoke');
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
		this.setCapabilityValue('alarm_smoke', zoneStatus.alarm1);
		this.setCapabilityValue('alarm_battery', zoneStatus.battery);
	}
}

module.exports = Bitron_902010_24;