'use strict';

const { BoundCluster } = require('zigbee-clusters');

class onOffBoundCluster extends BoundCluster {

  constructor({
    onSetOff,
    onSetOn
  }) {
    super();
    this._onSetOn = onSetOn;
    this._onSetOff = onSetOff;
  }

  setOn() {
    if (typeof this._onSetOn === 'function') {
      this._onSetOn();
    }
  }

  setOff() {
    if (typeof this._onSetOff === 'function') {
      this._onSetOff();
    }
  }
}

module.exports = onOffBoundCluster;