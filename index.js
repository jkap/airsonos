"use strict";
var sonos = require('sonos');
var portastic = require('portastic');
var ip = require('ip');
var NodeTunes = require('nodetunes');
var NicerCast = require('nicercast');


sonos.search(function(device) {
  console.log('setting up airsonos for', device);

  var audioStream = require('stream').PassThrough();

  var airplayServer = new NodeTunes(audioStream, {
    serverName: 'AirSonos@' + device.host
  });
  var icecastServer = new NicerCast(audioStream, {
    name: 'AirSonos@' + device.host
  });

  portastic.find({
      min : 8000,
      max : 8050,
      retrieve: 1
  }, function(err, port) {
    if (err) throw err;

    airplayServer.on('clientConnected', function() {

      // device is an instance of sonos.Sonos
      device.play('x-rincon-mp3radio://' + ip.address() + ':' + port + '/listen.m3u', function(err, playing) {
        device.play(function() {
          
        });
      });
    });

    airplayServer.on('volumeChange', function(vol) {
      vol = 100 - Math.floor(-1 * (Math.max(vol, -30) / 30) * 100);
      device.setVolume(vol, function() {

      });
    });

    airplayServer.start();
    icecastServer.start(port);
  });
});