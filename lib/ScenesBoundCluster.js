'use strict';

/**
 * Copy from https://github.com/athombv/com.ikea.tradfri.git
 *
 * Add a parameter `args` for this Object.
 */

const { BoundCluster } = require('zigbee-clusters');

class ScenesBoundCluster extends BoundCluster {

  constructor({
    onRecall
  }) {
    super();
    this._onRecall = onRecall;
  }

  recall(payload) {
    if (typeof this._onRecall === 'function') {
      this._onRecall(payload);
    }
  }
}

module.exports = ScenesBoundCluster;

/*
2021-03-04T17:26:52.509Z zigbee-clusters:endpoint ep: 1, cl: scenes (5), error while handling frame binding_unavailable {
  meta: { transId: 0, linkQuality: 52, dstEndpoint: 1, timestamp: 2276691 },
  frame: ZCLStandardHeader {
    frameControl: Bitmap [ clusterSpecific, disableDefaultResponse ],
    trxSequenceNumber: 11,
    cmdId: 5,
    data: <Buffer 02 00 02>
  }
}
*/