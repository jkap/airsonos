let Promise = require('bluebird');
let sonos = require('sonos');
let DeviceTunnel = require('./tunnel');

async function bootDevice(device) {
  var desc = await device.deviceDescriptionAsync();
  var zones = (await device.getTopologyAsync()).zones;
  var uuid = desc.UDN.split('uuid:').pop();
  var valid = zones.some(zone => {
    return (zone.coordinator === 'true') && zone.uuid === uuid;
  });

  if (!valid) return;

  return DeviceTunnel.createFor(device, {}).then((tunnel) => {

    tunnel.on('error', function(err) {
      if (err.code === 415) {
        console.error('Warning!', err.message);
        console.error('AirSonos currently does not support codecs used by applications such as iTunes or AirFoil.');
        console.error('Progress on this issue: https://github.com/stephen/nodetunes/issues/1');
      } else {
        console.error('Unknown error:');
        console.error(err);
      }
    });

    tunnel.start();
    console.log(`${ tunnel.deviceName } (@ ${ tunnel.device.host }:${ tunnel.device.port }, ${ tunnel.device.groupId })`);

    return tunnel;
  });
}

class AirSonos {

  constructor(options) {
    this.tunnels = {};
    this.options = options || {};
  }

  start() {
    sonos.search(device => {
      device = Promise.promisifyAll(device);

      bootDevice(device);
    });
  }

  refresh() {
    return this.searchForDevices().then((devices) => {
      // remove old groups
      // add new groups
      // update existing groups with new configurations
    });
  }

  stop() {
    return Promise.all(this.tunnels.map(tunnel.stop));
  }
}

module.exports = AirSonos;
