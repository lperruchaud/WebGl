import * as THREE from '../vendor/three.js-master/build/three.module.js';
import Stats from '../vendor/three.js-master/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '../vendor/three.js-master/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../vendor/three.js-master/examples/jsm/loaders/FBXLoader.js';

const Scene = {
	vars: {
		container: null,
		scene: null,
		renderer: null,
		camera: null,
		stats: null,
		controls: null,
		texture: null,
		mouse: new THREE.Vector2(),
		raycaster: new THREE.Raycaster(),
		animSpeed: null,
		animPercent: 0.00,
		text: "DAWIN"
	},
	animate: () => {		
		requestAnimationFrame(Scene.animate);
		Scene.vars.raycaster.setFromCamera(Scene.vars.mouse, Scene.vars.camera);

		//Scene.customAnimation();

		if (Scene.vars.goldGroup !== undefined) {
			let intersects = Scene.vars.raycaster.intersectObjects(Scene.vars.goldGroup.children, true);

			if (intersects.length > 0) {
				Scene.vars.animSpeed = 0.05;
			} else {
				Scene.vars.animSpeed = -0.05;
			}

			// let mouse = new THREE.Vector3(Scene.vars.mouse.x, Scene.vars.mouse.y, 0);
			// mouse.unproject(Scene.vars.camera);

			// let ray = new THREE.Raycaster(Scene.vars.camera.position, mouse.sub(Scene.vars.camera.position).normalize()); 
			// let intersects = ray.intersectObjects(Scene.vars.goldGroup.children, true);
			// if(intersects.length > 0) {
			// 	var arrow = new THREE.ArrowHelper(ray.ray.direction, ray.ray.origin, 1000, 0xFF00000);
			// 	Scene.vars.scene.add(arrow);
			// }
		}

		Scene.render();
	},
	render: () => {
		Scene.vars.renderer.render(Scene.vars.scene, Scene.vars.camera);
		Scene.vars.stats.update();
	},
	// customAnimation: () => {
	// 	let vars = Scene.vars;

	// 	if (vars.animSpeed === null) {
	// 		return;
	// 	}

	// 	vars.animPercent = vars.animPercent + vars.animSpeed;

	// 	if (vars.animPercent < 0) {
	// 		vars.animPercent = 0;
	// 		return;
	// 	}
	// 	if (vars.animPercent > 1) {
	// 		vars.animPercent = 1;
	// 		return;
	// 	}

	// 	if (vars.animPercent <= 0.33) {
	// 		Scene.vars.plaquette.position.z = 45 + (75 * vars.animPercent);
	// 		Scene.vars.texte.position.z = 45 + (150 * vars.animPercent);
	// 	}

	// 	if (vars.animPercent >= 0.20 && vars.animPercent <= 0.75) {
	// 		let percent = (vars.animPercent - 0.2) / 0.55;
	// 		vars.socle1.position.x = 25 * percent;
	// 		vars.socle2.position.x = -25 * percent;
	// 		vars.logo.position.x = 45 + 50 * percent;
	// 		vars.logo2.position.x = -45 - 50 * percent;
	// 	} else if (vars.animPercent < 0.20) {
	// 		vars.socle1.position.x = 0;
	// 		vars.socle2.position.x = 0;
	// 		vars.logo.position.x = 45;
	// 		vars.logo2.position.x = -45;
	// 	}

	// 	if (vars.animPercent >= 0.40) {
	// 		let percent = (vars.animPercent - 0.4) / 0.6;
	// 		vars.statuette.position.y = 50 * percent;
	// 	} else if (vars.animPercent < 0.70) {
	// 		vars.statuette.position.y = 0;
	// 	}
	// },

	
    loadFBX: (file, scale, position, rotation, color, namespace, callback) => {
        let loader = new FBXLoader(); 

        if(file=== undefined){
            return;
        }
        loader.load("../fbx/"+file, (object)=>{
            let data = object;

            data.traverse(node=>{
                if(node.isMesh){
                    node.castShadow = true;
                    node.receiveShadow = true;
                        node.material = new THREE.MeshStandardMaterial({
                            color:new THREE.Color(color),
                            roughness: .3,
                            metalness: .6
                        })
                    node.material.color=new THREE.Color(color);
                }
            });

            data.position.x=position[0];
            data.position.y=position[1];
            data.position.z=position[2];

            data.rotation.x=rotation[0];
            data.rotation.y=rotation[1];
            data.rotation.z=rotation[2];

            data.scale.x=data.scale.y=data.scale.z =scale;

            Scene.vars[namespace]=data;

            callback();
        });
        
    },
        
	loadText: (text, scale, position, rotation, color, namespace, callback) => {
		let loader = new THREE.FontLoader();

		if (text === undefined || text === "") {
			return;
		}

		loader.load('./vendor/three.js-master/examples/fonts/helvetiker_regular.typeface.json', (font) => {
			let geometry = new THREE.TextGeometry(text, {
				font,
				size: 1,
				height: 0.1,
				curveSegments: 1,
				bevelEnabled: false
			});

			geometry.computeBoundingBox();
			let offset = geometry.boundingBox.getCenter().negate();
			geometry.translate(offset.x, offset.y, offset.z);

			let material = new THREE.MeshBasicMaterial({
				color: new THREE.Color(color)
			});

			let mesh = new THREE.Mesh(geometry, material);

			mesh.position.x = position[0];
			mesh.position.y = position[1];
			mesh.position.z = position[2];

			mesh.rotation.x = rotation[0];
			mesh.rotation.y = rotation[1];
			mesh.rotation.z = rotation[2];

			mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

			Scene.vars[namespace] = mesh;

			callback();
		});
	},
	onWindowResize: () => {
		let vars = Scene.vars;
		vars.camera.aspect = window.innerWidth / window.innerHeight;
		vars.camera.updateProjectionMatrix();
		vars.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	onMouseMove: (event) => {
		Scene.vars.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		Scene.vars.mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
	},
	init: () => {
		let vars = Scene.vars;

		// Préparer le container pour la scène
		vars.container = document.createElement('div');
		vars.container.classList.add('fullscreen');
		document.body.appendChild(vars.container);

		// ajout de la scène
		vars.scene = new THREE.Scene();
		vars.scene.background = new THREE.Color(0xa0a0a0);
		vars.scene.fog = new THREE.Fog(vars.scene.background, 500, 3000);

		// paramétrage du moteur de rendu
		vars.renderer = new THREE.WebGLRenderer({ antialias: true });
		vars.renderer.setPixelRatio(window.devicePixelRatio);
		vars.renderer.setSize(window.innerWidth, window.innerHeight);
		
		vars.renderer.shadowMap.enabled = true;
		vars.renderer.shadowMapSoft = true;

		vars.container.appendChild(vars.renderer.domElement);

		// ajout de la caméra
		vars.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
		vars.camera.position.set(-1.5, 210, 572);

		// ajout de la lumière
		const lightIntensityHemisphere = .5;
		let light = new THREE.HemisphereLight(0xFFFFFF, 0x444444, lightIntensityHemisphere);
		light.position.set(0, 700, 0);
		vars.scene.add(light);

		// ajout des directionelles
		const lightIntensity = .8;
		const d = 1000;
		let light1 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light1.position.set(0, 700, 0);
		light1.castShadow = true;
		light1.shadow.camera.left = -d;
		light1.shadow.camera.right = d;
		light1.shadow.camera.top = d;
		light1.shadow.camera.bottom = -d;
		light1.shadow.camera.far = 2000;
		light1.shadow.mapSize.width = 4096;
		light1.shadow.mapSize.height = 4096;
		vars.scene.add(light1);
		// let helper = new THREE.DirectionalLightHelper(light1, 5);
		// vars.scene.add(helper);

		let light2 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light2.position.set(-400, 200, 400);
		light2.castShadow = true;
		light2.shadow.camera.left = -d;
		light2.shadow.camera.right = d;
		light2.shadow.camera.top = d;
		light2.shadow.camera.bottom = -d;
		light2.shadow.camera.far = 2000;
		light2.shadow.mapSize.width = 4096;
		light2.shadow.mapSize.height = 4096;
		vars.scene.add(light2);
		// let helper2 = new THREE.DirectionalLightHelper(light2, 5);
		// vars.scene.add(helper2);

		let light3 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light3.position.set(400, 200, 400);
		light3.castShadow = true;
		light3.shadow.camera.left = -d;
		light3.shadow.camera.right = d;
		light3.shadow.camera.top = d;
		light3.shadow.camera.bottom = -d;
		light3.shadow.camera.far = 2000;
		light3.shadow.mapSize.width = 4096;
		light3.shadow.mapSize.height = 4096;
		vars.scene.add(light3);

		// ajout de la sphère
		
		console.log("ok");

		vars.texture = new THREE.TextureLoader().load('./texture/sky.jpg');
		vars.textureUT1 = new THREE.TextureLoader().load('./texture/ultima_green.png');
		vars.textureUT2 = new THREE.TextureLoader().load('./texture/ultima_red.jpg');
		let geometry = new THREE.SphereGeometry(1000, 32, 32);
		let CUltimaThule1 = new THREE.SphereGeometry(35, 45, 32);
		let CUltimaThule2 = new THREE.SphereGeometry(50, 45, 32);
		let ring = new THREE.RingGeometry(120, 160, 50);
		let material = new THREE.MeshPhongMaterial({ map: Scene.vars.texture });
		let materialUT1 = new THREE.MeshPhongMaterial({ map: Scene.vars.textureUT1 });
		let materialUT2 = new THREE.MeshPhongMaterial({ map: Scene.vars.textureUT2 });
		material.side = THREE.DoubleSide;
		
		let materialRing = new THREE.MeshStandardMaterial({
				color:new THREE.Color(0xffffff),
				roughness: .3,
				metalness: .6
			})
		materialRing.side = THREE.DoubleSide;

		let sphere = new THREE.Mesh(geometry, material);

		let ut1 = new THREE.Mesh(CUltimaThule1, materialUT1);
		let ut2 = new THREE.Mesh(CUltimaThule2, materialUT2);
		let r = new THREE.Mesh(ring, materialRing);

		ut1.position.x = 40;
		ut1.position.z = 25;
		ut2.position.x = -40;
		ut2.position.z = -25;

		r.rotation.y = Math.PI/3;
		r.rotation.z = Math.PI/5;

		vars.scene.add(sphere);
		vars.scene.add(ut1);
		vars.scene.add(ut2);
		vars.scene.add(r);


		console.log("ok");

		let hash = document.location.hash.substr(1);
		if (hash.length !== 0) {
			let text = hash.substring();s
			Scene.vars.text = decodeURI(text);
		}
		console.log("ok");

		// Scene.loadFBX("UltimaThule.fbx", 1, [0, 0, 0], [0, 0, 0], 0xC0C0C0, 'Arrokoth', () => {
		// 	console.log("ok");
		// 						let vars = Scene.vars;
		// 						vars.scene.add(Scene.vars.Arrokoth);
		// });
		
		// ajout des controles
		vars.controls = new OrbitControls(vars.camera, vars.renderer.domElement);
		vars.controls.minDistance = 300;
		vars.controls.maxDistance = 600;
		vars.controls.update();

		window.addEventListener('resize', Scene.onWindowResize, false);
		window.addEventListener('mousemove', Scene.onMouseMove, false);

		vars.stats = new Stats();
		vars.container.appendChild(vars.stats.dom);

		
		document.getElementById('loading').style.display = "none";

		Scene.animate();
	}
};

Scene.init();