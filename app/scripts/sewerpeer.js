(function (window, document, undefined) {

window.SewerPeer = SewerPeer;

function SewerPeer(options) {
  var dataConnections = {};
  var peer;
  var sewerBus = options.sewerBus;

  function setupClient() {
    var key = options.key || 'x6wcgg5nrtuzncdi';
    var iceServers = options.iceServers || [
      {url: 'stun://stun.l.google.com:19302'},
      {url: 'stun://stun1.l.google.com:19302'},
      {url: 'stun://stun2.l.google.com:19302'},
      {url: 'stun://stun3.l.google.com:19302'},
      {url: 'stun://stun4.l.google.com:19302'}
    ];
    peer = new Peer({
      key: key,
      config: {
        iceServers: iceServers
      }
    });
    peer.on('open', function(id) {
      log('Your peer ID is: ' + id);
      sewerBus.emit('p2p.open', id);
    });
    peer.on('connection', handleNewConnection);
    peer.on('error', function (err) {
      log('Peer error: ' + err);
      sewerBus.emit('p2p.error', err);
    });
    return peer;
  }

  function setupHandlers() {
    _.forEach(options.handlers, function (handler, type) {
      var handlers = messageHandlers[type];
      if (!handlers) {
        handlers = messageHandlers[type] = [];
      }
      handlers.push(handler);
    });
  }

  function handleNewConnection(dataConnection) {
    // add some event handlers to new connections
    var peerId = dataConnection.peer;
    dataConnections[peerId] = dataConnection;
    dataConnection.on('data', function (data) {
      switch (data.type) {
        case 'peers4u':
          var peerList = data.data;
          _.forEach(peerList, function (pid) {
            if (dataConnections[pid] === undefined) {
              connectTo(pid);
            }
          });
          break;
        default:
          dispatchPeerMessage(data, peerId, dataConnection);
          break;
      }
    });
    dataConnection.on('open', function () {
      log(peerId + ' opened');
      sendPeerListTo(peerId);
      sewerBus.emit('p2p.peer.open', peerId);
    });
    dataConnection.on('close', function () {
      log(peerId + ' closed');
      delete dataConnections[peerId];
      sewerBus.emit('p2p.peer.close', peerId);
    });
    dataConnection.on('error', function (err) {
      log(peerId + ' error: ' + err);
      sewerBus.emit('p2p.peer.error', peerId, err);
    });
  }

  function connectTo(peerId) {
    if (dataConnections[peerId] === undefined) {
      var connection = peer.connect(peerId);
      handleNewConnection(connection);
    }
  }

  function sendPeerListTo(peerId) {
    // send a list of everyone but the target peer
    var connection = dataConnections[peerId];
    if (!connection) {
      return;
    }
    var peerIds = _.filter(_.keys(dataConnections),
      function (pid) {
        return pid != peerId;
      }
    );
    sendMessageToPeer(peerId, 'peers4u', peerIds);
  }

  function broadcast(msgType, data) {
    var packet = {
      type: msgType,
      data: data
    }
    _.forEach(dataConnections, function (connection) {
      connection.send(packet);
    });
  }

  function sendMessageToPeer(peerId, msgType, msg) {
    var packet = {
      type: msgType,
      data: msg
    }
    var connection = dataConnections[peerId];
    connection.send(packet);
  }

  function dispatchPeerMessage(data, peerId, dataConnection) {
    var msgType = data.type;
    if (!msgType) {
      return;
    }
    console.log('p2p.in.' + msgType);
    sewerBus.emit('p2p.in.' + msgType, data.data, peerId, dataConnection);
  }

  function log(m) {
    console.log(m);
  }

  return {
    setupClient: setupClient,
    connectTo: connectTo,
    sendMessageToPeer: sendMessageToPeer,
    broadcast: broadcast
  };
}

}(window, document));
