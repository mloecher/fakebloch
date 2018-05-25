var spin1 = new Spin();

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer;

var arrowHelper;

init();
animate();

function init() {
    container = document.getElementById( 'canvas' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 30, container.offsetWidth / container.offsetHeight, 0.1, 5000 );
    this.camera.position.set(5, 5, 10);
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    controls = new THREE.OrbitControls( camera );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    scene = new THREE.Scene();

    // arrow
    var dir = new THREE.Vector3( 0, 1, 0 ).normalize();
    var origin = new THREE.Vector3( 0, 0, 0 );
    var length = 2;
    var hex = 0xff0000;
    arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, .2, .2 );
    scene.add( arrowHelper );
    arrowHelper.rotation.x = .7

    arrowHelper2 = new THREE.ArrowHelper( dir, origin, length, hex, .2, .2 );
    scene.add( arrowHelper2 );
    arrowHelper2.rotation.x = .7

    arrowHelper3 = new THREE.ArrowHelper( dir, origin, length, hex, .2, .2 );
    scene.add( arrowHelper3 );
    arrowHelper3.rotation.x = .7

    // axis
    var axisHelper = new THREE.AxisHelper( 5 );
    scene.add( axisHelper );

    // grid
    var size = 2;
    var step = .5;
    var gridHelper = new THREE.GridHelper( size, step );
    scene.add( gridHelper );



    // lights
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -1, -1, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );


    // renderer


    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(container.offsetWidth, container.offsetHeight );
    renderer.setClearColor(0x111111, 1);
    // renderer.setPixelRatio( window.devicePixelRatio );
    // renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );


    // container = document.getElementById( 'container' );
    // container.appendChild( renderer.domElement );

    // stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // stats.domElement.style.zIndex = 100;
    // container.appendChild( stats.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

    render();

}


function animate() {

    requestAnimationFrame(animate);
    controls.update();
    render();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render() {

    var axis = new THREE.Vector3( 0, 1, 0 );
    var angle = .05;

    // arrowHelper.rotateOnAxis(axis, angle)

    // var m1 = new THREE.Matrix4();
    // m1.makeRotationY( .02 );

    // arrowHelper.applyMatrix(m1)

    var q = new THREE.Quaternion();
    q.setFromAxisAngle( axis, .05 ); // axis must be normalized, angle in radians
    arrowHelper.quaternion.multiplyQuaternions( q, arrowHelper.quaternion );

    q.setFromAxisAngle( axis, .045 ); // axis must be normalized, angle in radians
    arrowHelper2.quaternion.multiplyQuaternions( q, arrowHelper2.quaternion );

    q.setFromAxisAngle( axis, .055 ); // axis must be normalized, angle in radians
    arrowHelper3.quaternion.multiplyQuaternions( q, arrowHelper3.quaternion );

    renderer.render( scene, camera );
    // stats.update();

}
