var camera, controls;
var scene;
var renderer;

var t = 0;
var tr = 10;
var tr_num = 0;
var t_tot = 0;

var c = document.getElementById("psd_canvas");
var ctx = c.getContext("2d");

// var spin0 = new Spin();

var spins = new AllSpins(10);

var B = new THREE.Vector3(7.85, 0, 0);

function init() {

  stats = new Stats();
  stats.domElement.style.position	= 'absolute';
  stats.domElement.style.top	= '10px';
  stats.domElement.style.right	= '10px';
  document.body.appendChild( stats.domElement );

  container = document.getElementById('spin_canvas');
  // document.body.appendChild( container );

  if (Detector.webgl) {
    renderer = new THREE.WebGLRenderer({
      antialias: true, // to get smoother output
      preserveDrawingBuffer: true // to allow screenshot
    });
    renderer.setClearColor(0xFFFFFF, 1);
  } else {
    renderer = new THREE.CanvasRenderer();
  }

  console.log(container.offsetWidth)
  console.log(container.offsetHeight)
  renderer.setSize(container.offsetWidth-2, container.offsetHeight-2);

  container.appendChild(renderer.domElement);

  // create a scene
  scene = new THREE.Scene();


  // put a camera in the scene
  camera = new THREE.PerspectiveCamera(30, container.offsetWidth / container.offsetHeight, 0.1, 5000);
  camera.up.set(0, 0, 1);
  camera.position.set(6, 3, 2);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  // create a camera contol
  controls = new THREE.OrbitControls(camera, container);
  controls.damping = 0.2;
  controls.addEventListener('change', render);

  // lights
  var light = new THREE.AmbientLight(Math.random() * 0xffffff);
  scene.add(light);
  var light = new THREE.DirectionalLight(Math.random() * 0xffffff);
  light.position.set(Math.random(), Math.random(), Math.random()).normalize();
  scene.add(light);

  // grid
  var size = 1.5;
  var step = .5;
  var gridHelper = new THREE.GridHelper(size, step);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.setColors(0x999999, 0x999999)
  scene.add(gridHelper);

  // var axisHelper = new THREE.AxisHelper( 2 );
  // scene.add( axisHelper );

  //Update mesh
  updateSpins();

  return false;
}

function updateSpins() {
  // var old_arrow = scene.getObjectByName("arrow0");
  // if (old_arrow) {
  //     // console.log("free");
  //     scene.remove(old_arrow);
  // }
  // old_arrow = null;
  //
  // var dir = spin0.M.normalize();
  // var origin = new THREE.Vector3( 0, 0, 0 );
  // var length = spin0.M0;
  // var hex = 0xff0000;
  // arrow0 = new THREE.ArrowHelper( dir, origin, length, hex, .2, .2 );
  // arrow0.name = "arrow0"
  // scene.add( arrow0 );
  var oldArrows = scene.getObjectByName("allArrows");
  spins.clearArrows();
  scene.remove(oldArrows)
  oldArrows = null;

  spins.updateArrows();
  scene.add(spins.allArrows);
}

// animation loop
function animate() {

  // loop on request animation loop
  requestAnimationFrame(animate);

  var delt = Number($("#tframe").val());

  controls.update();

  var m_canvas = document.createElement("canvas");
  m_canvas.width = 600;
  m_canvas.height = 398;
  var m_context = m_canvas.getContext("2d");

  m_context.rect(70, 81, 10, -40);
  m_context.lineWidth = 2;
  m_context.strokeStyle = "#9C27B0";
  m_context.stroke();

  m_context.rect(140, 81, 20, -40);
  m_context.lineWidth = 2;
  m_context.strokeStyle = "#9C27B0";
  m_context.stroke();

  m_context.fillStyle = "#000";
  m_context.fillRect(70, 80, 500, 2);
  m_context.fillRect(70, 160, 500, 2);
  m_context.fillRect(70, 240, 500, 2);
  m_context.fillRect(70, 320, 500, 2);

  m_context.font = "24px Arial";
  m_context.fillText("RF", 14, 90);
  m_context.fillText("Gx", 14, 170);
  m_context.fillText("Gy", 14, 250);
  m_context.fillText("Gz", 14, 330);

  var c_pos = (t / tr) * 500 + 70
  m_context.fillStyle = "#FFC107";
  m_context.fillRect(c_pos, 30, 2, 340);

  ctx.clearRect(0, 0, 600, 398);
  ctx.drawImage(m_canvas, 0, 0);

  spins.applyBloch(B, delt);
  updateSpins();

  t += delt;
  t_tot += delt;
  if (t > tr) {
    B = new THREE.Vector3(7.85, 0, 0);
    t = 0;
    tr_num += 1;
  } else if (t > 1.4 && t < 1.8) {
    B = new THREE.Vector3(0, 8.3, 0);
  }else if (t > .2) {
    B = new THREE.Vector3(0, 0, 0);
  }

  $("#t_text").html((t).toFixed(2))
  $("#tr_text").html((tr_num).toString())
  $("#ttot_text").html((t_tot).toFixed(2))

  // do the render
  render();

  stats.update();
}

// render the scene
function render() {
  // update camera controls
  // controls.update();

  // actually render the scene
  renderer.render(scene, camera);
}

if (!init()) animate();
