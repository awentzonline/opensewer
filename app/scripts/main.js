(function (window, document, undefined) {
  $(function () {
    // a series of filthy tubes
    var sewer = new Sewer({
      container: document.getElementById('opensewer')
    });
    sewer.init();

    var t0 = new Date('2015-9-26').getTime();
    var tScale = 0.1;

    var camera = sewer.sewer3d.getCamera();
    camera.position.z = 10;
    camera.lookAt(new THREE.Vector3());
    $('#chatForm').on('submit', function (event) {
      event.preventDefault();
      var el = $('input[name=chatText]');
      var msg = el.val();
      el.val('');
      var item = {
        type: 'text',
        t: new Date().getTime(),
        x: 0,
        y: 0,
        z: tScale * (new Date().getTime() - t0),
        body: msg
      };
      console.log(item);
      sewer.createItem(item);
      return false;
    });
    $('#newPeerForm').on('submit', function (event) {
      event.preventDefault();
      var el = $('input[name=newPeerId]');
      var peerId = el.val().trim();
      if (peerId) {
        sewer.peer.connectTo(peerId);
        el.val('');
      }
      return false;
    });
    sewer.sewerBus.on('p2p.open', function (peerId) {
      $('#your-id').text(peerId);
    });
    sewer.sewerBus.on('p2p.close', function (peerId) {
      $('#your-id').text('disconnected');
    });
    sewer.sewerBus.on('p2p.error', function (peerId, err) {
      $('#your-id').text('Error: ' + err);
    });

    requestAnimationFrame(moveCamera);
    function moveCamera() {
      camera.position.z = tScale * (new Date().getTime() - t0);
      requestAnimationFrame(moveCamera);
    }
  })
}(window, document));
