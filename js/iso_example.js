var stats, scene, renderer, composer;
		var camera, cameraControl;
		var geometry, surfacemesh, wiremesh;
		var meshers = {
		     'Marching Cubes': MarchingCubes
		  ,  'Marching Tetraheda' : MarchingTetrahedra
	    ,  'Naive Surface Nets': SurfaceNets
		};
		var testdata = {};

		function updateMesh() {

		  scene.remove( surfacemesh );
		  scene.remove( wiremesh );

      //Create surface mesh
			geometry	= new THREE.Geometry();

		  var mesher = meshers[ document.getElementById("mesher").value ]
		    , field  = testdata[ document.getElementById("datasource").value ]();

		  var start = (new Date()).getTime();
      var result = mesher( field.data, field.dims );
      var end = (new Date()).getTime();

      //Update statistics
      document.getElementById("resolution").value = field.dims[0] + 'x' + field.dims[1] + 'x' + field.dims[2];
      document.getElementById("vertcount").value = result.vertices.length;
      document.getElementById("facecount").value = result.faces.length;
      document.getElementById("meshtime").value = (end - start) / 1000.0;

      geometry.vertices.length = 0;
      geometry.faces.length = 0;

      for(var i=0; i<result.vertices.length; ++i) {
        var v = result.vertices[i];
        geometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
      }

      for(var i=0; i<result.faces.length; ++i) {
        var f = result.faces[i];
        if(f.length === 3) {
          geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
        } else if(f.length === 4) {
          geometry.faces.push(new THREE.Face4(f[0], f[1], f[2], f[3]));
        } else {
          //Polygon needs to be subdivided
        }
      }

      var cb = new THREE.Vector3(), ab = new THREE.Vector3();
      for (var i=0; i<geometry.faces.length; ++i) {
        var f = geometry.faces[i];
        var vA = geometry.vertices[f.a];
        var vB = geometry.vertices[f.b];
        var vC = geometry.vertices[f.c];
        cb.sub(vC, vB);
        ab.sub(vA, vB);
        cb.crossSelf(ab);
        cb.normalize();
        if (result.faces[i].length == 3) {
          f.normal.copy(cb)
          continue;
        }

        // quad
        if (cb.isZero()) {
          // broken normal in the first triangle, let's use the second triangle
          var vA = geometry.vertices[f.a];
          var vB = geometry.vertices[f.c];
          var vC = geometry.vertices[f.d];
          cb.sub(vC, vB);
          ab.sub(vA, vB);
          cb.crossSelf(ab);
          cb.normalize();
        }
        f.normal.copy(cb);
      }

      geometry.verticesNeedUpdate = true;
      geometry.elementsNeedUpdate = true;
      geometry.normalsNeedUpdate = true;

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

			var material	= new THREE.MeshNormalMaterial();
			surfacemesh	= new THREE.Mesh( geometry, material );
			surfacemesh.doubleSided = true;
			var wirematerial = new THREE.MeshBasicMaterial({
			    color : 0xffffff
			  , wireframe : true
			});
			wiremesh = new THREE.Mesh(geometry, wirematerial);
			wiremesh.doubleSided = true;
			scene.add( surfacemesh );
			scene.add( wiremesh );

      var bb = geometry.boundingBox;
      wiremesh.position.x = surfacemesh.position.x = -(bb.max.x + bb.min.x) / 2.0;
      wiremesh.position.y = surfacemesh.position.y = -(bb.max.y + bb.min.y) / 2.0;
      wiremesh.position.z = surfacemesh.position.z = -(bb.max.z + bb.min.z) / 2.0;
		}

		if( !init() )	animate();

		// init the scene
		function init(){

			if( Detector.webgl ){
				renderer = new THREE.WebGLRenderer({
					antialias		: true,	// to get smoother output
					preserveDrawingBuffer	: true	// to allow screenshot
				});
				renderer.setClearColorHex( 0xBBBBBB, 1 );
			}else{
			  renderer = new THREE.CanvasRenderer();
			}

			renderer.setSize( window.innerWidth, window.innerHeight );
			document.getElementById('container').appendChild(renderer.domElement);

			// add Stats.js - https://github.com/mrdoob/stats.js
			stats = new Stats();
			stats.domElement.style.position	= 'absolute';
			stats.domElement.style.bottom	= '0px';
			document.body.appendChild( stats.domElement );

			// create a scene
			scene = new THREE.Scene();

			// put a camera in the scene
			camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.set(0, 0, 40);
			scene.add(camera);

			// create a camera contol
			cameraControls	= new THREE.TrackballControls( camera, document.getElementById('container') )

			// transparently support window resize
			THREEx.WindowResize.bind(renderer, camera);
			// allow 'p' to make screenshot
			THREEx.Screenshot.bindKey(renderer);
			// allow 'f' to go fullscreen where this feature is supported
			if( THREEx.FullScreen.available() ){
				THREEx.FullScreen.bindKey();
				document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
			}

			// here you add your objects
			// - you will most likely replace this part by your own
			var light	= new THREE.AmbientLight( Math.random() * 0xffffff );
			scene.add( light );
			var light	= new THREE.DirectionalLight( Math.random() * 0xffffff );
			light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
			scene.add( light );

			//Initialize dom elements
			testdata = createTestData();
			var ds = document.getElementById("datasource");
			for(var id in testdata) {
			  ds.add(new Option(id, id), null);
			}
			ds.onchange = updateMesh;
			var ms = document.getElementById("mesher");
			for(var alg in meshers) {
			  ms.add(new Option(alg, alg), null);
			}
			ms.onchange = updateMesh;

			document.getElementById("showfacets").checked = true;
			document.getElementById("showedges").checked  = true;

			//Update mesh
			updateMesh();

			return false;
		}

		// animation loop
		function animate() {

			// loop on request animation loop
			// - it has to be at the begining of the function
			// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
			requestAnimationFrame( animate );

			// do the render
			render();

			// update stats
			stats.update();
		}

		// render the scene
		function render() {
			// variable which is increase by Math.PI every seconds - usefull for animation
			var PIseconds	= Date.now() * Math.PI;

			// update camera controls
			cameraControls.update();

      surfacemesh.visible = document.getElementById("showfacets").checked;
      wiremesh.visible = document.getElementById("showedges").checked;

			// actually render the scene
			renderer.render( scene, camera );
		}
