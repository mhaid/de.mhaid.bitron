'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class Bitron_902010_28 extends ZigBeeDevice {

	// this method is called when the device is inited and values are changed
	async onMeshInit() {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		// on/off
		if (this.hasCapability('onoff')) {
			this.registerCapability('onoff', 'genOnOff', {
				getOpts: {
					getOnStart: true,
				},
			});
		}

		// reportlisteners
		// Report is send if status is changed or after 5 min
		this.registerAttrReportListener('genOnOff', 'onOff', 1, 300, 1, value => {
			this.log('onOff', value);
			this.setCapabilityValue('onoff', value === 1);
		}, 0);
	}
}

module.exports = Bitron_902010_28;