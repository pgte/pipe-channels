var debug = require('debug')('pipe-channels:server');
var cuid = require('cuid');
var MuxDemux = require('mux-demux');

module.exports = createChannel;

function createChannel() {
  var stream = MuxDemux();
  stream.on('connection', onConnection);
  return stream;

  function onConnection(negotiationChannel) {
    debug('got channel request');
    negotiationChannel.once('data', onChannelRequest);
    negotiationChannel.once('error', warnError);

    function onChannelRequest(payload) {
      debug('got payload of channel request: %j', payload);
      var request = {
        payload: payload,
        grant: grant,
        deny: deny,
      };

      debug('emitting request');
      stream.emit('request', request);
    }

    function grant() {
      var channelId = cuid();
      debug('granting channel %j', channelId);
      negotiationChannel.end([null, channelId]);
      return stream.createStream(channelId);
    }

    function deny(cause) {
      debug('denying channel request');
      negotiationChannel.end([{message: cause}]);
    }
  }
}

/* istanbul ignore next */
function warnError(err) {
  var log = (console.warn || console.error || console.log).bind(console);
  log(err.stack || err.message || err);
}
