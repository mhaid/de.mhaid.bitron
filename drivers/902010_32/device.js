'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class Bitron_Device extends ZigBeeDevice {

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
		});
		// local temperature
		this.registerCapability('measure_temperature', 'hvacThermostat', {
			get: 'localTemp',
			reportParser(value) {
				return Math.round((value / 100) * 10) / 10;
			},
			report: 'localTemp',
			getOpts: {
				getOnLine: true,
				getOnStart: true,
			},
		});
		// battery
		if (this.hasCapability('measure_battery')) {
			this.registerCapability('measure_battery', 'genPowerCfg', {
				getOpts: {
					getOnLine: true,
					getOnStart: true,
				},
			});
		}

		// reportlisteners 
		// target temperature
		this.registerAttrReportListener('hvacThermostat', 'occupiedHeatingSetpoint', 1, 300, 50, data => {
			const parsedValue = Math.round((data / 100) * 10) / 10;
			this.log('occupiedHeatingSetpoint: ', data, parsedValue);
			this.setCapabilityValue('target_temperature', parsedValue);
		}, 0);
		// local temperature
		this.registerAttrReportListener('hvacThermostat', 'localTemp', 1, 300, 50, value => {
			const parsedValue = Math.round((value / 100) * 10) / 10;
			this.log('hvacThermostat - localTemp: ', value, parsedValue);
			this.setCapabilityValue('measure_temperature', parsedValue);
		}, 0);
		// battery
		this.registerAttrReportListener('genPowerCfg', 'batteryVoltage', 300, 3600, null, value => {
			const parsedValue = Math.round((value - 25) / 5 * 100);
			this.log('genPowerCfg - batteryVoltage: ', value, parsedValue);
			this.setCapabilityValue('measure_battery', parsedValue);
		}, 0);

	}

	// local settings changed
	onSettings(oldSettingsObj, newSettingsObj, changedKeysArr, callback) {
		this.log(changedKeysArr);
		this.log('newSettingsObj', newSettingsObj);
		this.log('oldSettingsObj', oldSettingsObj);
		this.log('test: ', changedKeysArr.includes('temperature_calibration'));

		// temperature calibration changed
		if (changedKeysArr.includes('temperature_calibration')) {
			this.log('temperature_calibration: ', newSettingsObj.temperature_calibration);
			callback(null, true);
			this.node.endpoints[0].clusters.hvacThermostat.write('localTemperatureCalibration', newSettingsObj.temperature_calibration)
				.then(result => {
					this.log('localTemperatureCalibration: ', result);
				})
				.catch(err => {
					this.log('could not write localTemperatureCalibration');
					this.log(err);
				});
		}
		// target temperature changed
		if (changedKeysArr.includes('target_temperature')) {
			this.log('target_temperature: ', newSettingsObj.target_temperature);
			callback(null, true);
			this.node.endpoints[0].clusters.hvacThermostat.write('localTargetTemperature', newSettingsObj.target_temperature)
				.then(result => {
					this.log('localTargetTemperature: ', result);
				})
				.catch(err => {
					this.log('could not write localTargetTemperature');
					this.log(err);
				});
		}
	}
}
module.exports = Bitron_Device;