'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

var deviceInterval = null;

class Bitron_902010_28 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		this.registerCapability('onoff', CLUSTER.ON_OFF);

		// manual attributeReportListener
		deviceInterval = this.homey.setInterval(async () => {
			try {
				const value = await zclNode.endpoints[1].clusters.onOff.readAttributes('onOff');
				this.setCapabilityValue('onoff',value.onOff);
			} catch (error) {
				this.log(error);
			}
		},5000);
	}

	onDeleted() {
		if(deviceInterval != null) {
			this.homey.clearInterval(deviceInterval);
		}
		super.onDeleted();
	}
}

module.exports = Bitron_902010_28;