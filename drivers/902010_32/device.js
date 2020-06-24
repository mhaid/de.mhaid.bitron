'use strict';

const Homey = require('homey');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

var localTempVar = 2100;
var occupiedHeatingSetpointVar = 2100;

class Bitron_902010_32 extends ZigBeeDevice {

	// this method is called when the device is inited and values are changed
	async onNoteInit({ zclNode }) {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		// target temperature
		this.registerCapability('target_temperature', CLUSTER.THERMOSTAT, {
			set: 'occupiedHeatingSetpoint',
			setParser(value) {

				var settings = this.getSettings();
				if(settings.heatOnly_enabled == false) {
					if(localTempVar < value) {
						//set mode heat
						try {
							var res = await zclNode.endpoints[1].clusters.thermostat.write('systemMode',4);
						
							this.log('write systemMode: ', res);
							//set occupiedHeatingSetpoint
							try {
								res = await zclNode.endpoints[1].clusters.thermostat.write('occupiedHeatingSetpoint',Math.round(value * 1000 / 10));
								this.log('write occupiedHeatingSetpoint: ', res);
							} catch (err) {
								this.error('Error write occupiedHeatingSetpoint: ', err);
							}
						} catch (err) {
							this.error('Error write systemMode: ', err);
						}
					} else if(localTempVar > value) {
						//set mode cool
						try {
							var res = await zclNode.endpoints[1].clusters.thermostat.write('systemMode',3);
							this.log('write systemMode: ', res);

							//set occupiedCoolingSetpoint
							try {
								res = await zclNode.endpoints[1].clusters.thermostat.write('occupiedCoolingSetpoint',Math.round(value * 1000 / 10));
								this.log('write occupiedCoolingSetpoint: ', res);
							} catch (err) {
								this.error('Error write occupiedCoolingSetpoint: ', err);
							}
						} catch(err) {
							this.error('Error write systemMode: ', err);
						}
					} else {
						//set mode off
						try {
							var res = await zclNode.endpoints[1].clusters.thermostat.write('systemMode',0);
							this.log('write systemMode: ', res);
						} catch(err) {
							this.error('Error write systemMode: ', err);
						}
					}
				} else {
					//set occupiedHeatingSetpoint
					try {
						var res = await zclNode.endpoints[1].clusters.thermostat.write('occupiedHeatingSetpoint',Math.round(value * 1000 / 10));
						this.log('write occupiedHeatingSetpoint: ', res);
					} catch(err => {
						this.error('Error write occupiedHeatingSetpoint: ', err);
					}
				}
				return null;
			},
			get: 'occupiedHeatingSetpoint',
			reportParser(value) {
				return Math.round((value / 100) * 10) / 10;
			},
			report: 'occupiedHeatingSetpoint',
			getOpts: {
				getOnStart: true,
				getOnOnline: true,
			},
		});
		// local temperature
		this.registerCapability('measure_temperature', CLUSTER.THERMOSTAT, {
			get: 'localTemperature',
			reportParser(value) {
				return Math.round((value / 100) * 10) / 10;
			},
			report: 'localTemperature',
			getOpts: {
				getOnStart: true,
				getOnOnline: true,
			},
		});
		// thermostat mode
// 		if (this.hasCapability('thermostat_mode')) {
//			this.registerCapability('thermostat_mode', CLUSTER.THERMOSTAT, {
//				set: 'systemMode',
// 				setParser(value) {
// 					var sendValue = 4;
// 					if(value == "off") { sendValue = 0; } //OFF
// 					else if(value == "cool") { sendValue = 3; } //Cooling
// 					else if(value == "heat") { sendValue = 4; } //Heating
					
//					try {
// 						var res = await zclNode.endpoints[1].clusters.thermostat.write('systemMode',sendValue);
// 						this.log('write systemMode: ', res);
// 					} catch(err) {
// 						this.error('Error write systemMode: ', err);
// 					}
// 					return null;
// 				},
// 				get: 'systemMode',
// 				reportParser(value) {
// 					if(value == 0) { return "off"; } //OFF
// 					else if(value == 3) { return "cool"; } //Cooling
// 					else if(value == 4) { return "heat"; } //Heating
// 					else { return "heat"; } //Default (Heating)
// 				},
// 				report: 'systemMode',
// 				getOpts: {
// 					getOnStart: true,
// 					getOnOnline: true,
// 				},
// 			});
// 		}
		// battery
//		if (this.hasCapability('measure_battery')) {
//			this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
//				get: 'batteryPercentageRemaining',
//				reportParser(value) {
//					return Math.round(value / 2);
//				},
//				report: 'batteryPercentageRemaining',
//				getOpts: {
//					getOnStart: true,
//					getOnOnline: true,
//				},
//			});
//		}
		if (this.hasCapability('measure_battery')) {
			this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
				get: 'batteryVoltage',
				reportParser(value) {
					if ( Math.round((value - 23) / (30 - 23) * 100) > 100 ) {
						return Math.round(100);
					} else {
						return Math.round((value - 23) / (30 - 23) * 100);
					}
				},
				report: 'batteryVoltage',
				getOpts: {
					getOnStart: true,
					getOnOnline: true,
				},
			});
		}

		// reportlisteners 
		await this.configureAttributeReporting([
			{
				endpointId: 1,
				cluster: CLUSTER.THERMOSTAT,
				attributeName: 'occupiedHeatingSetpoint',
				minInterval: 1,
				maxInterval: 300,
				minChange: 10,
			},
			{
				endpointId: 1,
				cluster: CLUSTER.THERMOSTAT,
				attributeName: 'localTemperature',
				minInterval: 1,
				maxInterval: 300,
				minChange: 10,
			},
			/*{
				endpointId: 1,
				cluster: CLUSTER.POWER_CONFIGURATION,
				attributeName: 'batteryPercentageRemaining',
				minInterval: 1,
				maxInterval: 3600,
			},*/
			{
				endpointId: 1,
				cluster: CLUSTER.POWER_CONFIGURATION,
				attributeName: 'batteryVoltage',
				minInterval: 300,
				maxInterval: 3600,
			}
		]);

		// target temperature
		zclNode.endpoints[1].clusters.thermostat.on('attr.occupiedHeatingSetpoint', (value) => {
			const parsedValue = Math.round((value / 100) * 10) / 10;
			this.log('thermostat - occupiedHeatingSetpoint: ', value, parsedValue);
			occupiedHeatingSetpointVar = parsedValue;
			this.setCapabilityValue('target_temperature', parsedValue);
		});
		// local temperature
		zclNode.endpoints[1].clusters.thermostat.on('attr.localTemperature', (value) => {
			const parsedValue = Math.round((value / 100) * 10) / 10;
			this.log('thermostat - localTemperature: ', value, parsedValue);
			localTempVar = parsedValue;
			this.setCapabilityValue('measure_temperature', parsedValue);
		});
		// maesure battery
//		zclNode.endpoints[1].clusters.powerConfiguration.on('attr.batteryPercentageRemaining', (value) => {
//			const parsedValue = Math.round(value / 2);
//			this.log('powerConfiguration - batteryPercentageRemaining: ', value, parsedValue);
//			this.setCapabilityValue('measure_battery', parsedValue);
//		});
		zclNode.endpoints[1].clusters.powerConfiguration.on('attr.batteryVoltage', (value) => {
			if ( Math.round((value - 23) / (30 - 23) * 100) > 100 ) {
				this.log('powerConfiguration - batteryVoltage: ', value, Math.round(100));
				this.setCapabilityValue('measure_battery', Math.round(100));
			} else {
				this.log('powerConfiguration - batteryVoltage: ', value, Math.round((value - 23) / (30 - 23) * 100));
				this.setCapabilityValue('measure_battery', Math.round((value - 23) / (30 - 23) * 100));
			}
		});
	}

	// local settings changed
	onSettings(oldSettingsObj, newSettingsObj, changedKeysArr, callback) {
		this.log(changedKeysArr);
		this.log('newSettingsObj', newSettingsObj);
		this.log('oldSettingsObj', oldSettingsObj);
		this.log('test: ', changedKeysArr.includes('temperature_Calibration'));

		// localTemperatureCalibration changed
		if (changedKeysArr.includes('temperature_Calibration')) {
			this.log('temperature_Calibration: ', newSettingsObj.temperature_Calibration);
			callback(null, true);
			try {
				var result = await zclNode.endpoints[1].clusters.thermostat.write('localTemperatureCalibration', newSettingsObj.temperature_Calibration);
				this.log('localTemperatureCalibration: ', result);
			} catch(err) {
				this.log('could not write localTemperatureCalibration');
				this.log(err);
			}
		}

		//controlSequenceOfOperation changed
		if (changedKeysArr.includes('heatOnly_enabled')) {
			this.log('heatOnly_enabled: ', newSettingsObj.heatOnly_enabled);

			var value = 4;
			if(newSettingsObj.heatOnly_enabled == true){
				value = 2;
			}

			try {
				var result = await zclNode.endpoints[1].clusters.thermostat.write('controlSequenceOfOperation', value)
				
				this.log('controlSequenceOfOperation: ', result);
				if(newSettingsObj.heatOnly_enabled){
					try {
						result = await zclNode.endpoints[1].clusters.thermostat.write('systemMode', 4);

						this.log('systemMode: ', result);
						try {
							result = await zclNode.endpoints[1].clusters.thermostat.write('occupiedHeatingSetpoint',Math.round(occupiedHeatingSetpointVar * 1000 / 10));
							this.log('write occupiedHeatingSetpoint: ', result);
							callback(null, true);
						} catch(err) {
							this.error('Error write occupiedHeatingSetpoint: ', err);
						}
					} catch(err) {
						this.log('could not write systemMode', err);
						callback(err, false);
					}
				} else {
					callback(null, true);
				}
			} catch(err) {
				this.log('could not write controlSequenceOfOperation', err);
				callback(err, false);
			}
		}

		//ctrlSeqeOfOper changed
//		if (changedKeysArr.includes('intelMode_enabled')) {
//			this.log('intelMode_enabled: ', newSettingsObj.intelMode_enabled);
//			callback(null, true);
//		}
	}
}

module.exports = Bitron_902010_32;