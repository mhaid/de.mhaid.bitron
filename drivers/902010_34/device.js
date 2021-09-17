'use strict';

const onOffBoundCluster = require('../../lib/onOffBoundCluster');
const levelControlBoundCluster = require('../../lib/levelControlBoundCluster');
const ScenesBoundCluster = require('../../lib/ScenesBoundCluster');
const BitronSpecificScenesCluster = require('../../lib/BitronSpecificScenesCluster');
//const BitronSpecificPowerConfigurationCluster = require('../../lib/BitronSpecificPowerConfigurationCluster');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster,CLUSTER } = require('zigbee-clusters');
Cluster.addCluster(BitronSpecificScenesCluster);
//Cluster.addCluster(BitronSpecificPowerConfigurationCluster);

class Bitron_902010_34 extends ZigBeeDevice 
{
	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// enable debugging
		//this.enableDebug();

		// print the node's info to the console
		this.printNode();

		/*if (!this.hasCapability('measure_battery')) {
			this.addCapability('measure_battery');
		}

		// capabilities
		if (this.hasCapability('measure_battery')) {
			this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
				get: 'batteryVoltage',
				getOpts: {
					getOnStart: true,
					getOnOnline: true,
				},
				report: 'batteryVoltage',
				reportParser(value) {
					this.log('INFO: report batteryVoltage: ', value);
					return 100;
				},
				reportOpts: {
					configureAttributeReporting: {
						minInterval: 300,
						maxInterval: 3600,
						minChange: 1,
					}
				},
			});
		}*/
		
		//bindings
		zclNode.endpoints[1].bind(CLUSTER.ON_OFF.NAME, new onOffBoundCluster({
			onSetOn: this._onSetOn.bind(this),
			onSetOff: this._onSetOff.bind(this)
		}));
		zclNode.endpoints[1].bind(CLUSTER.LEVEL_CONTROL.NAME, new levelControlBoundCluster({
			onStep: this._onStepWithOnOff.bind(this)
		}));
		zclNode.endpoints[1].bind(CLUSTER.SCENES.NAME, new ScenesBoundCluster({
			onRecall: this._onRecall.bind(this)
		}));
    }

	//OnOff
	_onSetOn() {
		this.log('INFO: Command revieced (onSetOn)');
		this.triggerFlow({id: "on_button2_23"}).then().catch(this.error);
	}
	_onSetOff() {
		this.log('INFO: Command revieced (onSetOff)');
		this.triggerFlow({id: "on_button3_23"}).then().catch(this.error);
	}

	//Level Control
	_onStepWithOnOff({mode,stepSize,transitionTime}) {
		this.log('INFO: Command revieced (onStep)',mode);
		switch (mode) {
			case 0:
				this.triggerFlow({id: "on_button1_23"}).then().catch(this.error);
				break;
			case 1:
				this.triggerFlow({id: "on_button4_23"}).then().catch(this.error);
				break;
			default:
				this.log('ERROR: Command value unknown',mode);
				break;
		}
	}

	//Scenes
	_onRecall({groupId,sceneId}) {
		this.log('INFO: Command revieced (onRecall)',sceneId);

		this.triggerFlow({id: "on_button"+sceneId+"_34"}).then().catch(this.error);
	}
}

module.exports = Bitron_902010_34;