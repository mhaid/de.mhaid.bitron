'use strict';

const { BoundCluster } = require('zigbee-clusters');

class levelControlBoundCluster extends BoundCluster {

  constructor({
    onMoveToLevel,
    onMove,
    onStep,
    onStop,
    onMoveWithOnOff,
    onStepWithOnOff
  }) {
    super();
    this._onMoveToLevel = onMoveToLevel,
    this._onMove = onMove,
    this._onStep = onStep,
    this._onStop = onStop,
    this._onMoveWithOnOff = onMoveWithOnOff,
    this._onStepWithOnOff = onStepWithOnOff;
  }

  moveToLevel(payload) {
    if (typeof this._onMoveToLevel === 'function') {
      this._onMoveToLevel(payload);
    }
  }

  move(payload) {
    if (typeof this._onMove === 'function') {
      this._onMove(payload);
    }
  }

  step(payload) {
    if (typeof this._onStep === 'function') {
      this._onStep(payload);
    }
  }

  moveWithOnOff(payload) {
    if (typeof this._onMoveWithOnOff === 'function') {
      this._onMoveWithOnOff(payload);
    }
  }

  stepWithOnOff(payload) {
    if (typeof this._onStepWithOnOff === 'function') {
      this._onStepWithOnOff(payload);
    }
  }
}

module.exports = levelControlBoundCluster;