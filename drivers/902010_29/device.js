'use strict';

const BitronSpecificIASWDCluster = require('../../lib/BitronSpecificIASWDCluster');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster,CLUSTER } = require('zigbee-clusters');
Cluster.addCluster(BitronSpecificIASWDCluster);

class Bitron_902010_29 extends ZigBeeDevice 
{

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		if (!this.hasCapability('alarm_generic')) {
			this.addCapability('alarm_generic');
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

		// Flow Actions
		let sirenActionTimer = this.homey.flow.getActionCard('29_siren_timer');
		sirenActionTimer.registerRunListener(async (args, state) => {
			try {
				//await zclNode.endpoints[1].clusters.iasWD.startWarning({warningMode: 1, strobe: 'off',sirenLevel: 'medium'});
				await zclNode.endpoints[1].clusters.iasWD.startWarning({warningMode: 'on,off,medium', warningDuration: args.duration, strobeDutyCycle: 50, storbeLevel: 'medium'});
				this.setCapabilityValue('alarm_generic', true);
			} catch (error) {
				console.log(error);
			}
			return true;
		});

		let sirenActionOn = this.homey.flow.getActionCard('29_siren_on');
		sirenActionOn.registerRunListener(async (args, state) => {
			try {
				//await zclNode.endpoints[1].clusters.iasWD.startWarning({warningMode: 1, strobe: 'off',sirenLevel: 'medium'});
				await zclNode.endpoints[1].clusters.iasWD.startWarning({warningMode: 'on,off,medium', warningDuration: 0, strobeDutyCycle: 50, storbeLevel: 'medium'});
				this.setCapabilityValue('alarm_generic', true);
			} catch (error) {
				console.log(error);
			}
			return true;
		});

		let sirenActionOff = this.homey.flow.getActionCard('29_siren_off');
		sirenActionOff.registerRunListener(async (args, state) => {
			try {
				//await zclNode.endpoints[1].clusters.iasWD.startWarning({warningMode: 0, strobe: 'off',sirenLevel: 'low'});
				await zclNode.endpoints[1].clusters.iasWD.startWarning({warningMode: 'off,off,low', warningDuration: 0, strobeDutyCycle: 0, storbeLevel: 'low'});
				this.setCapabilityValue('alarm_generic', false);
			} catch (error) {
				console.log(error);
			}
			return true;
		});
    }

    onIASZoneStatusChangeNoficiation({zoneStatus, extendedStatus, zoneId, delay}) {
		this.log('IASZoneStatusChangeNotification:', zoneStatus, extendedStatus, zoneId, delay);
		this.log('IASZoneStatusChangeNotification (Parsed):',zoneStatus.alarm1,zoneStatus.tamper,zoneStatus.battery);
		
		this.setCapabilityValue('alarm_generic', zoneStatus.alarm1);
		this.setCapabilityValue('alarm_tamper', zoneStatus.tamper);
		this.setCapabilityValue('alarm_battery', zoneStatus.battery);
	}
}

module.exports = Bitron_902010_29;