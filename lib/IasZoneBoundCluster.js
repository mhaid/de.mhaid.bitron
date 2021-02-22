'use strict';

const { BoundCluster } = require('zigbee-clusters');

class IasZoneBoundCluster extends BoundCluster {

  constructor({
    onZoneStatusChangeNotification, endpoint
  }) {
    super();
    this._onZoneStatusChangeNotification = onZoneStatusChangeNotification;
    this._endpint = endpoint;
  }

  zoneStatusChangeNotification({ zoneStatus, extendedStatus, zoneId, delay }) {
    if (typeof this._onZoneStatusChangeNotification === 'function') {
      this._onZoneStatusChangeNotification({ zoneStatus, extendedStatus, zoneId, delay },this._endpint);
    }
  }y
}

module.exports = IasZoneBoundCluster;