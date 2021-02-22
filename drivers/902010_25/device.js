'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Bitron_902010_25 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		this.registerCapability('onoff', CLUSTER.ON_OFF);
		this.registerCapability('measure_power', CLUSTER.METERING);

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
			}])
		zclNode.endpoints[1].clusters.onOff.on('attr.onOff', (value) => {
			this.log('onOff', value);
			this.setCapabilityValue('onoff', value === 1);
		});

		await this.configureAttributeReporting([
			{
				endpointId: 1,
				cluster: CLUSTER.METERING,
				attributeName: 'instantaneousDemand',
				minInterval: 1,
				maxInterval: 300,
				minChange: 1,
			}])
		zclNode.endpoints[1].clusters.onOff.on('attr.instantaneousDemand', (value) => {
			this.log('instantaneousDemand', value);
			this.setCapabilityValue('measure_power', value);
		});
	}
}

module.exports = Bitron_902010_25;