'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

var localTempVar = 2100;
var occupiedHeatingSetpointVar = 2100;

class Bitron_902010_32 extends ZigBeeDevice {

	// this method is called when the device is inited and values are changed
	async onMeshInit() {

		// enable debugging
		this.enableDebug();

		// print the node's info to the console
		this.printNode();

		// capabilities
		// target temperature
		this.registerCapability('target_temperature', 'hvacThermostat', {
			set: 'occupiedHeatingSetpoint',
			setParser(value) {

				var settings = this.getSettings();
				if(settings.heatOnly_enabled == false) {
					if(localTempVar < value) {
						//set mode heat
						this.node.endpoints[0].clusters.hvacThermostat.write('systemMode',
							4)
							.then(res => {
								this.log('write systemMode: ', res);

								//set occupiedHeatingSetpoint
								this.node.endpoints[0].clusters.hvacThermostat.write('occupiedHeatingSetpoint',
									Math.round(value * 1000 / 10))
									.then(res => {
										this.log('write occupiedHeatingSetpoint: ', res);
									})
									.catch(err => {
										this.error('Error write occupiedHeatingSetpoint: ', err);
									});
							})
							.catch(err => {
								this.error('Error write systemMode: ', err);
							});
					} else if(localTempVar > value) {
						//set mode cool
						this.node.endpoints[0].clusters.hvacThermostat.write('systemMode',
							3)
							.then(res => {
								this.log('write systemMode: ', res);

								//set occupiedCoolingSetpoint
								this.node.endpoints[0].clusters.hvacThermostat.write('occupiedCoolingSetpoint',
									Math.round(value * 1000 / 10))
									.then(res => {
										this.log('write occupiedCoolingSetpoint: ', res);
									})
									.catch(err => {
										this.error('Error write occupiedCoolingSetpoint: ', err);
									});
							})
							.catch(err => {
								this.error('Error write systemMode: ', err);
							});
					} else {
						//set mode off
						this.node.endpoints[0].clusters.hvacThermostat.write('systemMode',
							0)
							.then(res => {
								this.log('write systemMode: ', res);
							})
							.catch(err => {
								this.error('Error write systemMode: ', err);
							});
					}
				} else {
					//set occupiedHeatingSetpoint
					this.node.endpoints[0].clusters.hvacThermostat.write('occupiedHeatingSetpoint',
						Math.round(value * 1000 / 10))
						.then(res => {
							this.log('write occupiedHeatingSetpoint: ', res);
						})
						.catch(err => {
							this.error('Error write occupiedHeatingSetpoint: ', err);
						});
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
		this.registerCapability('measure_temperature', 'hvacThermostat', {
			get: 'localTemp',
			reportParser(value) {
				return Math.round((value / 100) * 10) / 10;
			},
			report: 'localTemp',
			getOpts: {
				getOnStart: true,
				getOnOnline: true,
			},
		});
		// thermostat mode
// 		if (this.hasCapability('thermostat_mode')) {
//			this.registerCapability('thermostat_mode', 'hvacThermostat', {
//				set: 'systemMode',
// 				setParser(value) {
// 					var sendValue = 4;
// 					if(value == "off") { sendValue = 0; } //OFF
// 					else if(value == "cool") { sendValue = 3; } //Cooling
// 					else if(value == "heat") { sendValue = 4; } //Heating

// 					this.node.endpoints[0].clusters.hvacThermostat.write('systemMode',
// 						sendValue)
// 						.then(res => {
// 							this.log('write systemMode: ', res);
// 						})
// 						.catch(err => {
// 							this.error('Error write systemMode: ', err);
// 						});
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
//			this.registerCapability('measure_battery', 'genPowerCfg', {
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
			this.registerCapability('measure_battery', 'genPowerCfg', {
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
		// target temperature
		this.registerAttrReportListener('hvacThermostat', 'occupiedHeatingSetpoint', 1, 300, 10, value => {
			const parsedValue = Math.round((value / 100) * 10) / 10;
			this.log('hvacThermostat - occupiedHeatingSetpoint: ', value, parsedValue);
			occupiedHeatingSetpointVar = parsedValue;
			this.setCapabilityValue('target_temperature', parsedValue);
		}, 0);
		// local temperature
		this.registerAttrReportListener('hvacThermostat', 'localTemp', 1, 300, 10, value => {
			const parsedValue = Math.round((value / 100) * 10) / 10;
			this.log('hvacThermostat - localTemp: ', value, parsedValue);
			localTempVar = parsedValue;
			this.setCapabilityValue('measure_temperature', parsedValue);
		}, 0);
		// maesure battery
//		this.registerAttrReportListener('genPowerCfg', 'batteryPercentageRemaining', 1, 3600, null, value => {
//			const parsedValue = Math.round(value / 2);
//			this.log('genPowerCfg - batteryPercentageRemaining: ', value, parsedValue);
//			this.setCapabilityValue('measure_battery', parsedValue);
//		}, 0);
		this.registerAttrReportListener('genPowerCfg', 'batteryVoltage', 300, 3600, null, value => {
			if ( Math.round((value - 23) / (30 - 23) * 100) > 100 ) {
				this.log('genPowerCfg - batteryVoltage: ', value, Math.round(100));
				this.setCapabilityValue('measure_battery', Math.round(100));
			} else {
				this.log('genPowerCfg - batteryVoltage: ', value, Math.round((value - 23) / (30 - 23) * 100));
				this.setCapabilityValue('measure_battery', Math.round((value - 23) / (30 - 23) * 100));
			}
		}, 0);
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
			this.node.endpoints[0].clusters.hvacThermostat.write('localTemperatureCalibration', newSettingsObj.temperature_Calibration)
				.then(result => {
					this.log('localTemperatureCalibration: ', result);
				})
				.catch(err => {
					this.log('could not write localTemperatureCalibration');
					this.log(err);
				});
		}

		//ctrlSeqeOfOper changed
		if (changedKeysArr.includes('heatOnly_enabled')) {
			this.log('heatOnly_enabled: ', newSettingsObj.heatOnly_enabled);

			var value = 4;
			if(newSettingsObj.heatOnly_enabled == true){
				value = 2;
			}

			this.node.endpoints[0].clusters.hvacThermostat.write('ctrlSeqeOfOper', value)
				.then(result => {
					this.log('ctrlSeqeOfOper: ', result);
					if(newSettingsObj.heatOnly_enabled){
						this.node.endpoints[0].clusters.hvacThermostat.write('systemMode', 4)
							.then(result => {
								this.log('systemMode: ', result);
								this.node.endpoints[0].clusters.hvacThermostat.write('occupiedHeatingSetpoint',
									Math.round(occupiedHeatingSetpointVar * 1000 / 10))
									.then(res => {
										this.log('write occupiedHeatingSetpoint: ', res);
										callback(null, true);
									})
									.catch(err => {
										this.error('Error write occupiedHeatingSetpoint: ', err);
									});
							})
							.catch(err => {
								this.log('could not write systemMode', err);
								callback(err, false);
							});
					} else {
						callback(null, true);
					}
				})
				.catch(err => {
					this.log('could not write ctrlSeqeOfOper', err);
					callback(err, false);
				});
		}

		//ctrlSeqeOfOper changed
//		if (changedKeysArr.includes('intelMode_enabled')) {
//			this.log('intelMode_enabled: ', newSettingsObj.intelMode_enabled);
//			callback(null, true);
//		}
	}
}

module.exports = Bitron_902010_32;