'use strict';

const ThermostatUserInterfaceConfigurationCluster = require('../../lib/ThermostatUserInterfaceConfigurationCluster');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { Cluster,CLUSTER } = require('zigbee-clusters');
Cluster.addCluster(ThermostatUserInterfaceConfigurationCluster);

var localTempVar = 21;
var occupiedSetpoint = 21;
var systemMode = 'heat';

var batteryVoltageMinThreshold = 0;
var batteryVoltageMax = 32;
var batteryVoltageCurrent = 0;


class Bitron_902010_32 extends ZigBeeDevice {

	// this method is called when the device is inited and values are changed
	async onNodeInit({ zclNode }) {

		// print the node's info to the console
		this.printNode();

		// capabilities
		if(this.hasCapability('thermostat_mode')) {
			await this.removeCapability('thermostat_mode');
		}
		if(!this.hasCapability('thermostat_mode_smabit')) {
			await this.addCapability('thermostat_mode_smabit');
		}
		await this.setCapabilityValue('thermostat_mode_smabit','auto');
		

		// local target temperature
		this.registerCapabilityListener('target_temperature', async ( value, opts ) => {

			// read occupiedSetpoint
			var tempVal = await zclNode.endpoints[1].clusters.thermostat.readAttributes((systemMode == 'heat' ? 'occupiedHeatingSetpoint':'occupiedCoolingSetpoint'));
			tempVal = (systemMode == 'heat' ? tempVal.occupiedHeatingSetpoint : tempVal.occupiedCoolingSetpoint);
			this.log('INFO: read occupiedSetpoint: ', tempVal);

			//set occupiedSetpoint
			const parsedValue = (value*10)-(tempVal/10);
			try {
				await zclNode.endpoints[1].clusters.thermostat.setSetpoint({mode:'both',amount:parsedValue});
				this.log('INFO: write occupiedSetpoint',parsedValue);
				occupiedSetpoint = Math.round(tempVal / 10) / 10;
			} catch(err) {
				this.log('ERR: write occupiedSetpoint:', err);
				this.error('Error write occupiedSetpoint');
			}

			return Promise.resolve();
		});

		// capability: real temperature
		this.registerCapability('measure_temperature', CLUSTER.THERMOSTAT, {
			get: 'localTemperature',
			getOpts: {
				getOnStart: true,
				getOnOnline: true,
			},
			report: 'localTemperature',
			async reportParser(value) {
				const parsedValue = Math.round(value / 10) / 10;
				this.log('INFO: report localTemperature', value, parsedValue);
				localTempVar = parsedValue;

				return localTempVar;
			},
			reportOpts: {
				configureAttributeReporting: {
					minInterval: 1,
					maxInterval: 600,
					minChange: 10,
				}
			},
		});

		// capability: thermostat mode
		this.registerCapabilityListener('thermostat_mode_smabit', async ( value, opts ) => {
			return await this.updateSystemMode(value,'homey');
		});

		// capability: battery
		if (this.hasCapability('measure_battery')) {
			this.registerCapability('measure_battery', CLUSTER.POWER_CONFIGURATION, {
				get: 'batteryVoltage',
				getOpts: {
					getOnStart: true,
					getOnOnline: true,
				},
				report: 'batteryVoltage',
				async reportParser(value) {
					if(batteryVoltageMinThreshold == 0) {
						const valueTreshold = await zclNode.endpoints[1].clusters.powerConfiguration.readAttributes('batteryVoltageMinThreshold');
						console.log('INFO: report batteryVoltageMinThreshold', valueTreshold.batteryVoltageMinThreshold);
						batteryVoltageMinThreshold = valueTreshold.batteryVoltageMinThreshold;
					}

					var parsedValue = Math.round((value - batteryVoltageMinThreshold) / (batteryVoltageMax - batteryVoltageMinThreshold) * 100);
					parsedValue = (parsedValue > 100 ? 100 : parsedValue);
					this.log('INFO: report batteryVoltage', value, parsedValue);
					batteryVoltageCurrent = value;
					return parsedValue;
				},
				reportOpts: {
					configureAttributeReporting: {
						minInterval: 0,
						maxInterval: 3600,
						minChange: 1,
					}
				},
			});
		}




		// attr. Reporting: occupiedHeatingSetpoint, occupiedCoolingSetpoint, systemMode
		if(this.isFirstInit()) {
			await this.configureAttributeReporting([
				{
					cluster: CLUSTER.THERMOSTAT,
					attributeName: 'occupiedHeatingSetpoint',
					minInterval: 0,
					maxInterval: 360,
					minChange: 1,
				},
				{
					cluster: CLUSTER.THERMOSTAT,
					attributeName: 'occupiedCoolingSetpoint',
					minInterval: 0,
					maxInterval: 360,
					minChange: 1,
				},
				{
					cluster: CLUSTER.THERMOSTAT,
					attributeName: 'systemMode',
					minInterval: 0,
					maxInterval: 360,
					minChange: 1,
				},
			]);
		}

		// attr. listener: occupiedHeatingSetpoint
		zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME]
			.on('attr.occupiedHeatingSetpoint', async (value) => {
			
			const parsedValue = Math.round(value / 10) / 10;
			this.log('INFO: report occupiedHeatingSetpoint', value, parsedValue);

			if(systemMode != 'cool') {
				occupiedSetpoint = parsedValue;
				this.setCapabilityValue('target_temperature',occupiedSetpoint);
				this.log('INFO: report occupiedHeatingSetpoint used',systemMode);
			} else {
				this.log('INFO: report occupiedHeatingSetpoint ignored',systemMode);
			}
		});

		// attr. listener: occupiedCoolingSetpoint
		zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME]
			.on('attr.occupiedCoolingSetpoint', async (value) => {
			
			const parsedValue = Math.round(value / 10) / 10;
			this.log('INFO: report occupiedCoolingSetpoint', value, parsedValue);

			if(systemMode != 'heat') {
				occupiedSetpoint = parsedValue;
				this.setCapabilityValue('target_temperature',occupiedSetpoint);
				this.log('INFO: report occupiedCoolingSetpoint used',systemMode);
			} else {
				this.log('INFO: report occupiedCoolingSetpoint ignored',systemMode);
			}
		});

		// attr. listener: systemMode
		zclNode.endpoints[1].clusters[CLUSTER.THERMOSTAT.NAME]
			.on('attr.systemMode', async (value) => {

			return await this.updateSystemMode(value,'device');
		});	
	}
	

	// local settings changed
	async onSettings({ oldSettings, newSettings, changedKeys }) {
		this.log(changedKeys);
		this.log('newSettings', newSettings);
		this.log('oldSettings', oldSettings);

		// batteryVoltageMax changed
		if (changedKeys.includes('battery_voltage_max')) {
			try {
				if(newSettings.battery_voltage_max == null) {
					batteryVoltageMax = 32;
				}
				batteryVoltageMax = newSettings.battery_voltage_max * 10 * 2;
				this.log('INFO: batteryVoltageMax', batteryVoltageMax);

				if(batteryVoltageMinThreshold != 0 && batteryVoltageCurrent != 0) {

					var parsedValue = Math.round((batteryVoltageCurrent - batteryVoltageMinThreshold) / (batteryVoltageMax - batteryVoltageMinThreshold) * 100);
					parsedValue = (parsedValue > 100 ? 100 : parsedValue);
					this.setCapabilityValue('measure_battery',parsedValue);
					this.log('INFO: report batteryVoltage', batteryVoltageCurrent, parsedValue);
				}
			} catch(err) {
				this.log('ERR: could not write batteryVoltageMax',err);
				throw new Error("ERR: setting batteryVoltageMax");
			}
		}

		// tempDisplayMode changed
		if (changedKeys.includes('temp_display_mode')) {
			this.log('temp_display_mode:', newSettings.temp_display_mode);
			try {
				var displayMode = newSettings.temp_display_mode;
				if(displayMode != "celsius" && displayMode != "fahrenheit") {
					displayMode = "celsius";
				}
				var result = await this.zclNode.endpoints[1].clusters.thermostatUserInterfaceConfiguration.writeAttributes({temperatureDisplayMode: displayMode});
				this.log('INFO: temperatureDisplayMode', displayMode);
			} catch(err) {
				this.log('ERR: could not write temperatureDisplayMode',err);
				throw new Error("ERR: setting temperatureDisplayMode");
			}
		}

		// keyboard_lockout changed
		if (changedKeys.includes('keyboard_lockout')) {
			this.log('keyboard_lockout:', newSettings.keyboard_lockout);
			try {
				var parsedValue = "no";
				if(newSettings.keyboard_lockout) {
					parsedValue = "level2";
				}
				var result = await this.zclNode.endpoints[1].clusters.thermostatUserInterfaceConfiguration.writeAttributes({keypadLockout: parsedValue});
				this.log('INFO: keypadLockout', newSettings.keyboard_lockout);
			} catch(err) {
				this.log('ERR: could not write keypadLockout',err);
				throw new Error("ERR: setting keypadLockout");
			}
		}

		// localTemperatureCalibration changed
		if (changedKeys.includes('temperature_Calibration')) {
			this.log('temperature_Calibration:', newSettings.temperature_Calibration);
			try {
				var result = await this.zclNode.endpoints[1].clusters.thermostat.writeAttributes({localTemperatureCalibration: newSettings.temperature_Calibration});
				this.log('INFO: localTemperatureCalibration', newSettings.temperature_Calibration);
			} catch(err) {
				this.log('ERR: could not write localTemperatureCalibration',err);
				throw new Error("ERR: setting localTemperatureCalibration");
			}
		}

		//controlSequenceOfOperation changed
		if (changedKeys.includes('thermostat_mode')) {
			this.log('INFO: thermostat_mode:', newSettings.thermostat_mode);
			systemMode = newSettings.thermostat_mode;
			
			if(this.zclNode == null) {
				throw new Error("ERR: Device not yet initialized");
			}

			try {
				var result = await this.zclNode.endpoints[1].clusters.thermostat.writeAttributes({controlSequenceOfOperation: (systemMode == 'heat' ? 'heatingWithReheat' : 'coolingAndHeating4PipesWithReheat')});
				this.log('INFO: write controlSequenceOfOperation',(systemMode == 'heat' ? 'heatingWithReheat' : 'coolingAndHeating4PipesWithReheat'), result);

				await this.updateSystemMode(systemMode,'settings');

				if(systemMode == 'heat') {
					result = await this.zclNode.endpoints[1].clusters.thermostat.writeAttributes({occupiedHeatingSetpoint: occupiedSetpoint * 100});
					this.log('INFO: write occupiedHeatingSetpoint',occupiedSetpoint, occupiedSetpoint*100);	
				} else {
					result = await this.zclNode.endpoints[1].clusters.thermostat.writeAttributes({occupiedCoolingSetpoint: occupiedSetpoint * 100});
					this.log('INFO: write occupiedCoolingSetpoint',occupiedSetpoint, occupiedSetpoint*100);	
				}
			} catch(err) {
				this.log('ERR: write controlSequenceOfOperation', err);
				throw new Error("ERR: setting controlSequenceOfOperation");
			}
		}

		return true;
	}

	async updateSystemMode(value,emitter) {

		if(value == 'auto') {
			value = systemMode;
		}

		if(emitter != 'device') {
			await this.zclNode.endpoints[1].clusters.thermostat.writeAttributes({systemMode: value});
			this.log('INFO: write systemMode',value);
		}

		if(emitter != 'homey') {
			this.setCapabilityValue('thermostat_mode_smabit',(value == 'off' ? 'off':'auto'));
			this.log('INFO: write thermostat_mode_smabit',(value == 'off' ? 'off':'auto'));
		}

		systemMode = value;
		return Promise.resolve();
	}
}

module.exports = Bitron_902010_32;
