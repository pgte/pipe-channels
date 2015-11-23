var debug = require('debug')('pipe-channels:client');
var extend = require('xtend');
var MuxDemux = require('mux-demux');
var timers = require('timers');

module.exports = createClient;

var defaultOptions = {
  channelWaitTimeout: 5000,
};

function createClient(_options) {
  var options = extend({}, defaultOptions, _options);
  var waitingChannels = {};
  var pendingAttributionChannels = {};

  var stream = MuxDemux();
  stream.channel = channel;
  stream.on('connection', onConnection);

  return stream;

  function channel(payload, cb) {
    debug('requesting channel, payload = %j', payload);
    var negotiationChannel = stream.createStream();
    negotiationChannel.once('data', onNegotiationReply);
    negotiationChannel.write(payload);

    function onNegotiationReply(reply) {
      debug('got negotiation reply: %j', reply);
      var err = reply[0];
      var id = reply[1];
      if (err) {
        cb(err);
      } else {
        waitForChannel(id, cb);
      }
    }
  }

  function onConnection(stream) {
    debug('got connection %j', stream.meta);
    var cb = waitingChannels[stream.meta];
    if (cb) {
      debug('have callback for channel %j', stream.meta);
      delete waitingChannels[stream.meta];
      timers.setImmediate(cb, null, stream);
    }
  }

  function waitForChannel(id, cb) {
    debug('waiting for channel %j', id);
    waitingChannels[id] = cb;
  }
};
