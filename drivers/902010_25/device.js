'use strict';

const BitronSpecificMeteringCluster = require('../../lib/BitronSpecificMeteringCluster');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster,CLUSTER } = require('zigbee-clusters');
Cluster.addCluster(BitronSpecificMeteringCluster);

var deviceInterval = null;
var failedMetering = 0;

var unitofMeasure = null;
var multiplier = null;
var divisor = null;
var summationFormatting = null;
var demandFormatting = null;
var meteringDeviceType = null;

class Bitron_902010_25 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		this.registerCapability('onoff', CLUSTER.ON_OFF);

		this.registerCapability('measure_power', CLUSTER.METERING, {
			get: 'instantaneousDemand',
			getOpts: {
				getOnStart: true,
				getOnOnline: true,
			},
			report: 'instantaneousDemand',
			async reportParser(value) {
				await this.getMeteringSettings();
				const parsedValue = value * multiplier / divisor * 1000; // Transform form kW to W
				this.log('INFO: report instantaneousDemand', value, parsedValue);
				return parsedValue;
			},
			reportOpts: {
				configureAttributeReporting: {
					minInterval: 0,
					maxInterval: 660,
					minChange: 1,
				}
			},
		});

		this.registerCapability('meter_power', CLUSTER.METERING, {
			get: 'currentSummationDelivered',
			getOpts: {
				getOnStart: true,
				getOnOnline: true,
			},
			report: 'currentSummationDelivered',
			async reportParser(value) {
				await this.getMeteringSettings();
				const parsedValue = value * multiplier / divisor;
				this.log('INFO: report currentSummationDelivered', value, parsedValue);
				return parsedValue;
			},
			reportOpts: {
				configureAttributeReporting: {
					minInterval: 0,
					maxInterval: 660,
					minChange: 1,
				}
			},
		});

		deviceInterval = this.homey.setInterval(async () => {
			if(failedMetering <= 1) {
				await this.getMetering();
			} else if(failedMetering == 30) {
				failedMetering = 0; // Wait 30 Minutes after request failed twice: Device propably unplugged
			} else {
				failedMetering++;
			}
		},60000);
	}

	onDeleted() {
		if(deviceInterval != null) {
			this.homey.clearInterval(deviceInterval);
		}
		super.onDeleted();
	}

	async getMetering() {
		try {
			const value = await this.zclNode.endpoints[1].clusters.metering.readAttributes('instantaneousDemand');
			const valueParsed = value.instantaneousDemand * multiplier / divisor * 1000;  // Transform form kW to W
			this.log('INFO: get instantaneousDemand',value,valueParsed);
			this.setCapabilityValue('measure_power',valueParsed);

			const value2 = await this.zclNode.endpoints[1].clusters.metering.readAttributes('currentSummationDelivered');
			const value2Parsed = value2.currentSummationDelivered * multiplier / divisor;
			this.log('INFO: get currentSummationDelivered',value2,value2Parsed);
			this.setCapabilityValue('meter_power',value2Parsed);
		} catch (error) {
			this.log(error);
			failedMetering++;
			this.log("ERROR: Failed reading Metering",failedMetering,"time(s)")
		}
	}

	async getMeteringSettings() {
		try {
			if(unitofMeasure == null) {
				const unitofMeasureTmp = await this.zclNode.endpoints[1].clusters.metering.readAttributes('unitofMeasure');
				console.log('INFO: get unitofMeasure', unitofMeasureTmp.unitofMeasure);
				unitofMeasure = unitofMeasureTmp.unitofMeasure;
			}

			if(multiplier == null) {
				const multiplierTmp = await this.zclNode.endpoints[1].clusters.metering.readAttributes('multiplier');
				console.log('INFO: get multiplier', multiplierTmp.multiplier);
				multiplier = multiplierTmp.multiplier;
			}

			if(divisor == null) {
				const divisorTmp = await this.zclNode.endpoints[1].clusters.metering.readAttributes('divisor');
				console.log('INFO: get divisor', divisorTmp.divisor);
				divisor = divisorTmp.divisor;
			}

			if(summationFormatting == null) {
				const summationFormattingTmp = await this.zclNode.endpoints[1].clusters.metering.readAttributes('summationFormatting');
				console.log('INFO: get summationFormatting', summationFormattingTmp.summationFormatting);
				summationFormatting = summationFormattingTmp.summationFormatting;
			}

			if(demandFormatting == null) {
				const demandFormattingTmp = await this.zclNode.endpoints[1].clusters.metering.readAttributes('demandFormatting');
				console.log('INFO: get demandFormatting', demandFormattingTmp.demandFormatting);
				demandFormatting = demandFormattingTmp.demandFormatting;
			}

			if(meteringDeviceType == null) {
				const meteringDeviceTypeTmp = await this.zclNode.endpoints[1].clusters.metering.readAttributes('meteringDeviceType');
				console.log('INFO: get meteringDeviceType', meteringDeviceTypeTmp.meteringDeviceType);
				meteringDeviceType = meteringDeviceTypeTmp.meteringDeviceType;
			}
		} catch (error) {
			this.log(error);
		}
	}
}

module.exports = Bitron_902010_25;