// adapted from http://threejs.org/examples/css3d_molecules.html

(function (window, document, undefined) {

function Sewer3d(options) {
  var sewerBus = options.sewerBus;
  var camera,
    container,
    renderer,
    root,
    scene;

  this.init = function (sewerContainer) {
    container = $(sewerContainer);
    camera = new THREE.PerspectiveCamera(70, container.width(), container.height(), 1, 5000);
    scene = new THREE.Scene();

    root = new THREE.Object3D();
    scene.add(root);

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.append(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    animate();
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    var width = container.width();
    var height = container.height();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  }

  this.getScene = function () {
    return scene;
  };
  this.getCamera = function () {
    return camera;
  };
}

window.Sewer3d = Sewer3d;

}(window, document));
