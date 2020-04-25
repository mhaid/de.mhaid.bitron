'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class Bitron_902010_25 extends ZigBeeDevice {

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
		
		// measure_power
		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', 'seMetering', {
				get: 'instantaneousDemand',
				reportParser(value) {
					if (value < 0) return;
					return value / 10;
				},
				report: 'instantaneousDemand',
				getOpts: {
					getOnStart: true,
					pollInterval: 1000,
				},
			});
		}
		
		// meter_power
		if (this.hasCapability('meter_power')) {
			this.registerCapability('meter_power', 'seMetering', {
				get: 'currentSummDelivered',
				reportParser(value) {
					this.log('value: ', value);
					return Buffer.from(value).readUIntBE(0, 2) / 1000;
				},
				report: 'currentSummDelivered',
				getOpts: {
					getOnStart: true,
					pollInterval: 1000,
				},

			});
		}

		// meter_received
		/*if (this.hasCapability('meter_received')) {
			this.registerCapability('meter_received', 'seMetering', {
				get: 'currentSummReceived',
				reportParser(value) {
					this.log('value: ', value);
					return Buffer.from(value).readUIntBE(0, 2) / 1000;
				},
				report: 'currentSummReceived',
				getOpts: {
					getOnStart: true,
					pollInterval: 1000,
				},
			});
		}*/

		// reportlisteners
		// Report is send if status is changed or after 5 min
		this.registerAttrReportListener('genOnOff', 'onOff', 1, 300, 1, value => {
			this.log('onOff', value);
			this.setCapabilityValue('onoff', value === 1);
		}, 0);
	}
}

module.exports = Bitron_902010_25;
