var debug = require('debug')('pipe-channels:client');
var MuxDemux = require('mux-demux');
require("setimmediate");

module.exports = createClient;

function createClient() {
  var waitingChannels = {};

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

  function onConnection(conn) {
    debug('got connection %j', conn.meta);
    var cb = waitingChannels[conn.meta];
    if (cb) {
      debug('have callback for channel %j', conn.meta);
      delete waitingChannels[conn.meta];
      setImmediate(cb, null, conn);
    }
  }

  function waitForChannel(id, cb) {
    debug('waiting for channel %j', id);
    waitingChannels[id] = cb;
  }
}
