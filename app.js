'use strict';

const Homey = require('homey');

class BitronApp extends Homey.App {
	onInit() {
		this.log(Homey.manifest.id,'running...');
	}
}

module.exports = BitronApp;