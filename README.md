# pipe-channels

Channels as streams inside a stream, negotiated.

## Install

```
$ npm install pipe-channels --save
```

## Server

```
var Channels = require('pipe-channels');

var server = Channels.createServer();

// listen for new channel requests:
server.on('request', function(request) {
  // request.payload has arbitrary values passed in by client
  if (request.payload.token == 'this is a token') {
    var channel = request.grant(); // channel is an object stream
  } else {
    request.deny('just because'); // deny the channel
  }
});

// pipe server into duplex stream
stream.pipe(server).pipe(stream);
```


## Client

```js
var client = require('pipe-channels').createClient();

// ask for a channel, passing in any arbitrary payload:
var payload = { token: 'this is a token'};
client.channel(payload, function(err, channel) {
  if (err) {
    console.error('could not get a channel because', err.message);
  } else {
    // now I have a channel, an object stream that I can pipe
    stream.pipe(channel).pipe(stream);
  }
});
```


## License

ISC