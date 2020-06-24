'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Bitron_902010_28 extends ZigBeeDevice {

	// this method is called when the device is inited and values are changed
	async onNoteInit({ zclNode }) {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		// on/off
		if (this.hasCapability('onoff')) {
			this.registerCapability('onoff', CLUSTER.ON_OFF, {
				getOpts: {
					getOnStart: true,
				},
			});
		}

		// reportlisteners
		// Report is send if status is changed or after 5 min
		await this.configureAttributeReporting([
			{
				endpointId: 1,
				cluster: CLUSTER.ON_OFF,
				attributeName: 'onOff',
				minInterval: 1,
				maxInterval: 300,
				minChange: 1,
			}
		]);
		
		zclNode.endpoints[1].clusters.onOff.on('attr.onOff', (value) => {
			this.log('onOff', value);
			this.setCapabilityValue('onoff', value === 1);
		});
	}
}

module.exports = Bitron_902010_28;