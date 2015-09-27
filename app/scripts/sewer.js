(function (window, document, undefined) {

function Sewer(options) {
  var sewerBus = this.sewerBus = new EventEmitter2({
    newListener: false,
    wildcard: false
  });
  // 3d stuff
  var sewer3d = this.sewer3d = new Sewer3d({
    sewerBus: sewerBus
  });
  // p2p stuff
  var peer = this.peer = SewerPeer({
    sewerBus: sewerBus
  })

  this.init = function () {
    sewer3d.init(options.container);
    peer.setupClient();
  };

  this.createItem = function (item) {
    // immediately create local copy
    sewerBus.emit('p2p.in.item.add', item);
    // update peers
    this.peer.broadcast('item.add', item)
  };

  this.addItem = function (item) {
    switch (item.type) {
      case 'text':
        var node = document.createElement('div');
        node.textContent = item.body;
        addNode(node, new THREE.Vector3(item.x, item.y, item.z));
        break;
    }
  };

  sewerBus.on('p2p.in.item.add', function (item) {
    this.addItem(item);
  }.bind(this));

  function addNode(node, position) {
    var scene = sewer3d.getScene();
    var obj = new THREE.CSS3DSprite(node);
    if (position) {
      obj.position.copy(position);
    }
    scene.add(obj);
    console.log(scene);

    return obj;
  };
}

window.Sewer = Sewer;

}(window, document));
