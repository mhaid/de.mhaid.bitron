'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

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
				this.node.endpoints[0].clusters.hvacThermostat.write('occupiedHeatingSetpoint',
					Math.round(value * 1000 / 10))
					.then(res => {
						this.log('write occupiedHeatingSetpoint: ', res);
					})
					.catch(err => {
						this.error('Error write occupiedHeatingSetpoint: ', err);
					});
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
		if (this.hasCapability('thermostat_mode')) {
			this.registerCapability('thermostat_mode', 'hvacThermostat', {
				get: 'systemMode',
				reportParser(value) {
					if(value == 0) { return "off"; } //OFF
					else if(value == 3) { return "cool"; } //Cooling
					else if(value == 4) { return "heat"; } //Heating
					else { return "heat"; } //Default (Heating)
				},
				report: 'systemMode',
				getOpts: {
					getOnStart: true,
					getOnOnline: true,
				},
			});
		}
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
			this.setCapabilityValue('target_temperature', parsedValue);
		}, 0);
		// local temperature
		this.registerAttrReportListener('hvacThermostat', 'localTemp', 1, 300, 10, value => {
			const parsedValue = Math.round((value / 100) * 10) / 10;
			this.log('hvacThermostat - localTemp: ', value, parsedValue);
			this.setCapabilityValue('measure_temperature', parsedValue);
		}, 0);
		// thermostat mode
		this.registerAttrReportListener('hvacThermostat', 'systemMode', 1, 300, 4, value => {
			let parsedValue = "heat";
			
			if(value == 0) { parsedValue = "off"; } //OFF
			else if(value == 3) { parsedValue = "cool"; } //Cooling
			else if(value == 4) { parsedValue = "heat"; } //Heating (default)
			
			this.log('hvacThermostat - systemMode: ', parsedValue);
			this.setCapabilityValue('thermostat_mode', parsedValue);
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
	}

}

module.exports = Bitron_902010_32;