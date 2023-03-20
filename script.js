import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// import { createTextGeometry} from 'https://cdn.jsdelivr.net/npm/three-bmfont-text-es@3.0.5/+esm'
// import * as T from 'https://cdn.jsdelivr.net/npm/three-bmfont-text-es@3.0.5/+esm'
// import loadBmfont from 'https://cdn.jsdelivr.net/npm/load-bmfont@1.4.1/+esm'
// console.log(loadBmfont)
// console.log(T)

// import * as t from 't';


// window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// scene svariables
let scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xffffff, 1, 100);
let renderer = new THREE.WebGLRenderer()
renderer.autoClear = false;
renderer.gammaInput = true;
renderer.gammaOutput = true;

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2(0,0)
let currentIntersectModels = null
let currentIntersectHorse = null

// variables for font and typing
const textureLoader = new THREE.TextureLoader()
const colorTexture = textureLoader.load('assets/metal032_1k_color.jpg')
//const displacementTexture = textureLoader.load('/assets/Metal032_1K_Displacement.jpg')
//const heightTexture = textureLoader.load('/assets/Metal_006_height.png')
const normalTexture = textureLoader.load('assets/metal032_1k_normalGL.jpg')
//const ambientOcclusionTexture = textureLoader.load('/assets/Metal_006_ambientOcclusion.jpg')
const metalnessTexture = textureLoader.load('assets/metal032_1k_metalness.jpg')
const roughnessTexture = textureLoader.load('assets/metal032_1K_roughness.jpg')
let myFont
let text = "type something"
let firstLetter = true;
var textMesh1, textMesh2, textGeo, faceMaterial, textMaterialFront, textMaterialSide, parent;
parent = new THREE.Object3D();
let spheresParent = new THREE.Object3D();

const textMaterial =  new THREE.MeshStandardMaterial({
    // color: colorTexture,
    map: colorTexture,
    // displacementMap: displacementTexture,
    metalnessMap: metalnessTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    metalness: 0.1,
    side: THREE.DoubleSide
})
//scene.background = new THREE.Color(0xffffff)
scene.add(parent)

// canvas variables
const drawingCanvas = document.getElementById( 'text-canvas' );
const ctx = drawingCanvas.getContext( '2d' );

let ctxMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    alphaTest: 0.5
});
ctxMaterial.map = new THREE.CanvasTexture(drawingCanvas)
drawingCanvas.width = sizes.width*3
drawingCanvas.height = sizes.height*3
// ctx.fillStyle = 'hsla(0, 0%, 100%, 0)';
// ctx.globalAlpha = 80
let sphereText = `${text} ${text} ${text}`
ctx.fillRect( 0, 0, drawingCanvas.width, drawingCanvas.height );
ctx.textAlign = 'center'
ctx.font = "64px arial";
ctx.fillStyle = '#000000';
ctx.fillText(sphereText, drawingCanvas.width/4, drawingCanvas.height/2);


// canvas for shader 
const shaderTextColor = "#890620"
const shaderCanvas = document.getElementById( 'shaderText' );
const shaderCtx = shaderCanvas.getContext('2d')
shaderCanvas.width = sizes.width
shaderCanvas.height = sizes.height
shaderCtx.fillStyle = 'blue';
shaderCtx.fillRect( 0, 0, shaderCanvas.width, shaderCanvas.height );
shaderCtx.textAlign = 'center'
shaderCtx.font = `${sizes.height/3}px arial`;
shaderCtx.fillStyle = shaderTextColor;
shaderCtx.fillText(sphereText, shaderCanvas.width/2, shaderCanvas.height/2);
shaderCtx.fillText(sphereText, shaderCanvas.width/2, shaderCanvas.height/3);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,0,9)
// camera.lookAt(0,0,0)
scene.add(camera)

// render target 
//new THREE.WebGL3DRenderTarget
let rt = new THREE.WebGLCubeRenderTarget(256)
//let rtCamera = new THREE.CubeCamera( 0.05, 50, rt );
let rtCamera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     0, // far
  );//new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
//rtCamera.position.set(0,0,6)
let rtScene = new THREE.Scene()
console.log('rtcamer', rtCamera)
rtScene.add(rtCamera)
//scene.add(rtCamera)
//rtScene.background = new THREE.Color(0xff0000)
//rtScene.add(parent)

let cubeCamera, cubeRenderTarget;
cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 1024 );
cubeCamera = new THREE.CubeCamera( 1, 1000, cubeRenderTarget );
let testmaterial = new THREE.MeshStandardMaterial( {
    envMap: cubeCamera.renderTarget.texture,
    roughness: 0.05,
    metalness: 1
} );

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6) // soft white light
ambientLight.position.set(0,3,3)
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.castShadow = true
directionalLight.position.set(0, 0, 5)
//directionalLight.target = parent
scene.add(directionalLight)

const pointLightBack = new THREE.PointLight( 0xffffff, 1, 100 );
pointLightBack.position.set( 0, 0, -10 );
scene.add( pointLightBack );
const pointLightFront = new THREE.PointLight( 0xffffff, 1, 100 );
pointLightFront.position.set( 0, 0, 10 );
scene.add( pointLightFront );



// load font
const fontLoader = new FontLoader()
console.log(fontLoader)
const ttfLoader = new TTFLoader()
ttfLoader.load('fonts/advert.ttf', json => {
    myFont = fontLoader.parse(json)
    const textGeometry = new TextGeometry(text, {
        height: 0.5,
        size: 1,
        font: myFont
    })
    createText()
    
})
// glossy objects
var glossyMaterial = new THREE.MeshStandardMaterial({color: "#6c757d", roughness: 0});
var glossyEnvMap = textureLoader.load('assets/glossy.png');
glossyEnvMap.mapping = THREE.SphericalReflectionMapping;
glossyMaterial.envMap = glossyEnvMap;
var roughnessMap = textureLoader.load('assets/stripe.png');
roughnessMap.magFilter = THREE.NearestFilter;
glossyMaterial.roughnessMap = roughnessMap;
// const testG = new THREE.TorusGeometry( 1, 0.3, 16, 100 );
// const testSphere =  new THREE.Mesh( testG, glossyMaterial );
// testSphere.position.set(-7,-7,-4)
// scene.add(testSphere)

// const octahedronG = new THREE.TorusKnotGeometry( 1, 0.4, 100, 16, 5, 3 );
// const octahedron = new THREE.Mesh(octahedronG, glossyMaterial)
// octahedron.position.set(15,8,-8)
// // octahedron.scale.set(1,1.5,1)
// //octahedron.rotation.y = Math.PI/4
// scene.add(octahedron)


// load model
let marble, elf, horse, elephant, cannon
let models =  []
const gltfLoader = new GLTFLoader();
gltfLoader.load(
	'assets/marble/marble_bust_01_1k.gltf',
	function ( gltf ) {
        marble = gltf.scene
        marble.scale.set(5,5,5)
        marble.position.set(-9,4.5,-4)
        marble.rotation.set(0,1, -0.6)
        marble.traverse(function(node) {
            if (node instanceof THREE.Mesh) {
                node.material = glossyMaterial;
            }
        });
        marble.tagName = 'marble'
        marble.userData.isContainer = true
        scene.add( marble );
        models.push(marble)
	},
);
gltfLoader.load(
	'assets/elf/garden_gnome_1k.gltf',
	function ( gltf ) {
        elf = gltf.scene
        elf.scale.set(4,4,4)
        elf.position.set(-7,-7,-4)
        //elf.rotation.set(0,1.2,0)
        elf.traverse(function(node) {
            if (node instanceof THREE.Mesh) {
                node.material = glossyMaterial;
            }
        });
        elf.tagName = 'elf'
        elf.userData.isContainer = true
		scene.add( elf );
		models.push(elf)
	},
);
gltfLoader.load(
	// resource URL
	'assets/horse/horse_statue_01_1k.gltf',
	// called when the resource is loaded
	function ( gltf ) {
        horse = gltf.scene
        horse.scale.set(15,15,15)
        horse.position.set(2.5,-4,5.5)
        horse.traverse(function(node) {
            if (node instanceof THREE.Mesh) {
                node.material = glossyMaterial;
            }
        });
        horse.tagName = 'horse'
        horse.userData.isContainer = true
		scene.add( horse );
		//models.push(horse)
	},
);
gltfLoader.load(
	'assets/elephant/carved_wooden_elephant_1k.gltf',
	function ( gltf ) {
        elephant = gltf.scene
        elephant.scale.set(25,25,25)
        elephant.position.set(-3,3,-10)
        elephant.traverse(function(node) {
            if (node instanceof THREE.Mesh) {
                node.material = glossyMaterial;
            }
        });
        elephant.tagName = 'elephant'
        elephant.userData.isContainer = true
		scene.add( elephant );
		models.push(elephant)
	},
);
// gltfLoader.load(
// 	'assets/cannon/cannon_01_1k.gltf',
// 	function ( gltf ) {
//         cannon = gltf.scene
//         cannon.scale.set(5,5,5)
//         cannon.position.set(3,-25,-25)
//         cannon.rotation.set(0,-Math.PI * 0.5, 0)
//         cannon.traverse(function(node) {
//             if (node instanceof THREE.Mesh) {
//                 node.material = glossyMaterial;
//             }
//         });
//         cannon.tagName = 'cannon'
//         cannon.userData.isContainer = true
// 		//scene.add( cannon );
// 		//models.push(cannon)
// 	},
// );



// const geometry = new THREE.SphereGeometry( 5, 32, 32 );
// const material = new THREE.MeshStandardMaterial({ color: 0xffff00 })
// const sphere = new THREE.Mesh( geometry, ctxMaterial );
//sphere.scale.set(5,5,5)
//sphere.rotation.x = 2

// sphere.position.x = -5
// sphere.position.y = 3
// sphere.position.z = -4

// sphere.castShadow = true;
// scene.add( sphere );
const spheres = []


addSpheres()


function addSpheres() {
    for(let i = 0; i < 12; i++) {
        const geometry = new THREE.SphereGeometry( 1, 32, 16 );
        const testMat = new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5
        });
        const sphere = new THREE.Mesh( geometry, ctxMaterial );
        const scaleV = Math.random() * (4 - 2 + 1) + 2
        sphere.scale.set(scaleV,scaleV,scaleV)
        sphere.rotation.x = (Math.random()-1) * Math.PI*2 * 5 * i
        sphere.rotation.y = (Math.random()-1) * Math.PI*2 * 5 * i
        sphere.rotation.z = (Math.random()-1) * Math.PI*2 * 5 * i
        //sphere.rotation.z = (Math.random()-1) * Math.PI*2
        spheres.push(sphere)
        spheresParent.add(sphere)
    }
    scene.add(spheresParent)
    console.log(spheres)
    console.log(spheresParent)
}


// set and append renderer
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// shader background
const shadertoyCamera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     0, // far
  );
  const shadertoyScene = new THREE.Scene();
  const plane = new THREE.PlaneGeometry(20, 20);

  const fragmentShader = `
    #include <common>

    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uTime;
    uniform sampler2D uCanvas;

    // vec3 colorA = vec3(0.,0.,0.);
    // vec3 colorB = vec3(1.000,1.,1.);
    vec3 colorA = vec3(0.149,0.141,0.912);
    vec3 colorB = vec3(1.000,0.833,0.224);
    

    float plot (vec2 st, float pct){
        return  smoothstep( pct-0.01, pct, st.y) -
                smoothstep( pct, pct+0.01, st.y);
    }

    //	Classic Perlin 3D Noise 
	//	by Stefan Gustavson

	vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
	vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
	vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

    

    float cnoise(vec3 P){
		vec3 Pi0 = floor(P); // Integer part for indexing
		vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
		Pi0 = mod(Pi0, 289.0);
		Pi1 = mod(Pi1, 289.0);
		vec3 Pf0 = fract(P); // Fractional part for interpolation
		vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
		vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
		vec4 iy = vec4(Pi0.yy, Pi1.yy);
		vec4 iz0 = Pi0.zzzz;
		vec4 iz1 = Pi1.zzzz;

		vec4 ixy = permute(permute(ix) + iy);
		vec4 ixy0 = permute(ixy + iz0);
		vec4 ixy1 = permute(ixy + iz1);

		vec4 gx0 = ixy0 / 7.0;
		vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
		gx0 = fract(gx0);
		vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
		vec4 sz0 = step(gz0, vec4(0.0));
		gx0 -= sz0 * (step(0.0, gx0) - 0.5);
		gy0 -= sz0 * (step(0.0, gy0) - 0.5);

		vec4 gx1 = ixy1 / 7.0;
		vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
		gx1 = fract(gx1);
		vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
		vec4 sz1 = step(gz1, vec4(0.0));
		gx1 -= sz1 * (step(0.0, gx1) - 0.5);
		gy1 -= sz1 * (step(0.0, gy1) - 0.5);

		vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
		vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
		vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
		vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
		vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
		vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
		vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
		vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

		vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
		g000 *= norm0.x;
		g010 *= norm0.y;
		g100 *= norm0.z;
		g110 *= norm0.w;
		vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
		g001 *= norm1.x;
		g011 *= norm1.y;
		g101 *= norm1.z;
		g111 *= norm1.w;

		float n000 = dot(g000, Pf0);
		float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
		float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
		float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
		float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
		float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
		float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
		float n111 = dot(g111, Pf1);

		vec3 fade_xyz = fade(Pf0);
		vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
		vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
		float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
		return 2.2 * n_xyz;
	}
	
	
float noise(vec2 p, float freq ){
	float unit = 1./freq;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
	xy = .5*(1.-cos(PI*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}

	
	float pNoise(vec2 p, int res){
		// p+=u_noise_pan;
		float persistance = .5;
		float n = 0.;
		float normK = 0.;
		float f = 4.;
		float amp = 1.;
		int iCount = 0;
		//noprotect
		for (int i = 0; i<50; i++){
			n+=amp*noise(p, f);
			f*=2.;
			normK+=amp;
			amp*=persistance;
			if (iCount == res) break;
			iCount++;
		}
		float nf = n/normK;
		return nf*nf*nf*nf;
	}

    void main() {
        vec2 st = gl_FragCoord.xy/uResolution.xy;
        vec3 color = vec3(0.0);

        st.x += cnoise( vec3(st*uTime,1.) )/5.;
        
		st.x += cnoise( vec3(st*3000.,1.) )/5.;//*uMouse.x;

        vec3 pct = vec3(st.y);

    // pct.r = smoothstep(0.0,1.0, st.x);
    // pct.g = sin(st.x*PI);
    // pct.b = pow(st.x,0.5);

        color = mix(colorA, colorB, pct);
        vec3 texColor = texture2D(uCanvas,st).rgb;
        //color.x += cnoise( vec3(st*uTime,1.) )/5.;
        color.x += cnoise( vec3(st*uTime,1.) )/5.;
    

        gl_FragColor = vec4(color,1.0) + vec4(texColor,1.0);
    }
  `;
  const myUniforms = {
    uTime: { value: 0 },
    uResolution: { type: "v2", value: new THREE.Vector2(sizes.width, sizes.height) },
    uMouse: { type: "v2", value: new THREE.Vector2() },
    uCanvas: { type: "t", value: new THREE.CanvasTexture(shaderCanvas)},
    uTxtShape: {value: textureLoader.load('assets/cloud1.jpg')},
    uTxtCloudNoise: {value: textureLoader.load('assets/cloud2.jpg')},
    uFac1: {value: 17.8},
    uFac2: {value: 2.7},
    uTimeFactor1: {value: 0.01},
    uTimeFactor2: {value: 0.0027},
    uDisplStrenght1: {value: 0.04},
    uDisplStrenght2: {value: 0.08},
  };
  const material = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms: myUniforms,
  });
  shadertoyScene.add(new THREE.Mesh(plane, material));
  //scene.add(new THREE.Mesh(plane, material))
  rtScene.add(new THREE.Mesh(plane, material))

// cloud sprires
const cloudG = new THREE.PlaneGeometry(1,1)
const cloudMat = new THREE.ShaderMaterial({
    uniforms: {...THREE.UniformsUtils.clone(THREE.ShaderLib.sprite.uniforms), ...myUniforms},
    vertexShader: `
    uniform float rotation;
    uniform vec2 center;
    #include <common>
    #include <uv_pars_vertex>
    #include <fog_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
    
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
    
        vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
        vec2 scale;
        scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
        scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
    
        vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
        vec2 rotatedPosition;
        rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
        rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
        mvPosition.xy += rotatedPosition;
    
        gl_Position = projectionMatrix * mvPosition;
    
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        #include <fog_vertex>
    }
    `,
    fragmentShader: `
    uniform sampler2D uTxtShape;
    uniform sampler2D uTxtCloudNoise;
    uniform float uTime;
    
    uniform float uFac1;
    uniform float uFac2;
    uniform float uTimeFactor1;
    uniform float uTimeFactor2;
    uniform float uDisplStrenght1;
    uniform float uDisplStrenght2;
    varying vec2 vUv;

    

    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 permute(vec4 x) {
           return mod289(((x*34.0)+1.0)*x);
      }
      
      vec4 taylorInvSqrt(vec4 r)
      {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      float snoise3(vec3 v)
        {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      
      // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;
      
      // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
      
        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
      
      // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      
      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
      
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
      
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
      
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
      
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
      
        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
      
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
      
      //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
      
      // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                      dot(p2,x2), dot(p3,x3) ) );
        }

        float fbm3d(vec3 x, const in int it) {
            float v = 0.0;
            float a = 0.5;
            vec3 shift = vec3(100);
        
            
            for (int i = 0; i < 32; ++i) {
                if(i<it) {
                    v += a * snoise3(x);
                    x = x * 2.0 + shift;
                    a *= 0.5;
                }
            }
            return v;
        }

vec4 gammaCorrect(vec4 color, float gamma){
    return pow(color, vec4(1.0 / gamma));
  }
  
  vec4 levelRange(vec4 color, float minInput, float maxInput){
    return min(max(color - vec4(minInput), vec4(0.0)) / (vec4(maxInput) - vec4(minInput)), vec4(1.0));
  }
  
  vec4 levels(vec4 color, float minInput, float gamma, float maxInput){
    return gammaCorrect(levelRange(color, minInput, maxInput), gamma);
  }

    void main() {
        vec2 newUv = vUv;
    
        vec4 txtNoise1 = texture2D(uTxtCloudNoise, vec2(vUv.x + uTime * 0.0001, vUv.y - uTime * 0.00014)); // noise txt
        vec4 txtNoise2 = texture2D(uTxtCloudNoise, vec2(vUv.x - uTime * 0.00002, vUv.y + uTime * 0.000017 + 0.2)); // noise txt
    
        float noiseBig = fbm3d(vec3(vUv * uFac1, uTime * uTimeFactor1), 4)+ 1.0 * 0.5;
        newUv += noiseBig * uDisplStrenght1;
    
        float noiseSmall = snoise3(vec3(newUv * uFac2, uTime * uTimeFactor2));
    
        newUv += noiseSmall * uDisplStrenght2;
    
        vec4 txtShape = texture2D(uTxtShape, newUv);
    
        float alpha = levels((txtNoise1 + txtNoise2) * 0.6, 0.2, 0.4, 0.7).r;
        alpha *= txtShape.r;
    
        gl_FragColor = vec4(vec3(0.95,0.95,0.95), alpha);
    }
    
    `,
    alphaTest: 0.5,
    transparent: true

})
const newCloud = new THREE.Mesh(cloudG, cloudMat)
newCloud.scale.set(10,10,1)
newCloud.position.z = 0
scene.add(newCloud)

// Object
const geometry = new THREE.SphereGeometry( 2, 32, 16 );
const mat = new THREE.MeshBasicMaterial({ color: 0xffff00, envMap: rt.texture })
const sphere = new THREE.Mesh( geometry, material );
sphere.position.y = 1
sphere.position.z = 5
sphere.castShadow = true;
//scene.add( sphere );

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement)
//controls.lookSpeed = 8
controls.enableDamping = true

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    sphereText = `${text} ${text} ${text}`
    ctx.clearRect(0,0, drawingCanvas.width, drawingCanvas.height)
    ctx.fillText(sphereText, drawingCanvas.width/4, drawingCanvas.height/2);
    ctxMaterial.map.needsUpdate = true;
 
    shaderCtx.clearRect(0,0, shaderCanvas.width, shaderCanvas.height)
    shaderCtx.fillStyle = '#0077B6'
    shaderCtx.fillRect(0,0,shaderCanvas.width, shaderCanvas.height)
    shaderCtx.fillStyle = shaderTextColor
    shaderCtx.fillText(sphereText, shaderCanvas.width/2, shaderCanvas.height/2);
    
   
    
    
    pointLightFront.position.x = Math.tan(elapsedTime*0.5) * 20
    parent.rotation.y = Math.sin(elapsedTime * 2) * 0.1
    //parent.position.y = Math.sin(elapsedTime * 10) * 0.05
    spheres.forEach(s => {
        s.rotation.x += 0.005
        s.rotation.y += 0.01
        s.rotation.z += 0.005
        // s.rotation.x = elapsedTime * 0.3
        // s.rotation.y = elapsedTime * 0.3
        // s.rotation.z = elapsedTime * 0.1
    })
    //spheresParent.rotation.x = Math.sin(elapsedTime) * 0.5
    //spheresParent.rotation.y = Math.sin(elapsedTime) * 0.3

    // mouse and raycast
    raycaster.setFromCamera(mouse,camera)
    const intersects = raycaster.intersectObjects(models)
    const textIntersects = raycaster.intersectObjects(parent)
    if(intersects.length) {
        if (!currentIntersectModels) {
            console.log('mouse enter')
            console.log(intersects[0].object)
            gsap.to(intersects[0].object.scale, {
                x: intersects[0].object.scale.x * 1.3,
                y: intersects[0].object.scale.y * 1.3,
                z: intersects[0].object.scale.z * 1.3,
                duration: 1,
                ease: "power2.out"
            })
            document.querySelector("#typeTarget span").innerText = intersects[0].object.parent.tagName
        }
        currentIntersectModels = intersects[0]
    } else {
        if (currentIntersectModels) {
            console.log('mouse leave')
            gsap.to(currentIntersectModels.object.scale, {
                x: currentIntersectModels.object.scale.x / 1.3,
                y: currentIntersectModels.object.scale.y / 1.3,
                z: currentIntersectModels.object.scale.z / 1.3,
                duration: 1,
                ease: "power2.out"
            })
        }
        currentIntersectModels = null
        document.querySelector("#typeTarget span").innerText = ""
    }
    if(horse){
        const modelIntersects = raycaster.intersectObject(horse)
        if(modelIntersects.length){
            if(!currentIntersectHorse) {
                console.log('mouse over horse')
                gsap.to(horse.scale, {
                    x: horse.scale.x * 1.3,
                    y: horse.scale.y * 1.3,
                    z: horse.scale.z * 1.3,
                    duration: 1,
                    ease: "power2.out"
                })
            }
            currentIntersectHorse = horse
            document.querySelector("#typeTarget span").innerText = horse.tagName
            //model.scale.set(1.2, 1.2, 1.2)
        }else{
            if(currentIntersectHorse) {
                console.log('mouse leave horse')
                gsap.to(horse.scale, {
                    x: horse.scale.x / 1.3,
                    y: horse.scale.y / 1.3,
                    z: horse.scale.z / 1.3,
                    duration: 1,
                    ease: "power2.out"
                })
                document.querySelector("#typeTarget span").innerText = ""
            }
            currentIntersectHorse = null
            //model.scale.set(1, 1, 1)
        }
    }

    if(textIntersects.length) {
        console.log('intersects text', textIntersects[0])
    }
    
    
    // renderer.setRenderTarget(rt)
    // renderer.render(rtScene, rtCamera)
    // renderer.setRenderTarget(null)
    // renderer.render(scene, camera)
    //rtCamera.update( renderer, scene );
    //controls.update()
    cubeCamera.update( renderer, shadertoyScene );
    myUniforms.uResolution.value.set(sizes.width, sizes.height, 1);
    myUniforms.uTime.value = elapsedTime;
    renderer.autoClear = true
    //renderer.render(rtScene, rtCamera);
    renderer.render(shadertoyScene, shadertoyCamera)
    renderer.autoClear = false
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

function createText() {
    textGeo = new TextGeometry( text, {
        size: 1.5,
        height: 0.5,
        //curveSegments: curveSegments,

        font: myFont,
        bevelThickness: 0.1,
        bevelSegments: 1,
		bevelSize: 0.1,
		bevelEnabled: true,

    });

    //textGeo.materials = [ textMaterialFront, textMaterialSide ];
    textGeo.materials = [textMaterial, textMaterial]
    
    // textGeo.computeBoundingBox();
    // textGeo.computeVertexNormals();
    textMesh1 = new THREE.Mesh( textGeo, textMaterial );
    textMesh1.geometry.center()
    parent.add(textMesh1)
}

function refreshText() {

    //updatePermalink();

    parent.remove( textMesh1 );
    //if ( mirror ) parent.remove( textMesh2 );

    if ( !text ) return;

    createText();

}

function onDocumentKeyDown( event ) {
    if ( firstLetter ) {

        firstLetter = false;
        text = "";
    }

    var keyCode = event.keyCode;
    myUniforms.uCanvas.value = new THREE.CanvasTexture(shaderCanvas)
    // backspace

    if ( keyCode == 8 ) {

        event.preventDefault();

        text = text.substring( 0, text.length - 1 );
        refreshText();

        return false;
    }
    
}

function onDocumentKeyPress( event ) {
    var keyCode = event.which;
    myUniforms.uCanvas.value = new THREE.CanvasTexture(shaderCanvas)
    // backspace
    if ( keyCode == 8 ) {
        event.preventDefault();

    } else {
        var ch = String.fromCharCode( keyCode );
        text += ch;
        refreshText();
    }
    if (text === 'marble' && marble) {
        gsap.to(camera.position, {
            x: marble.position.x - 1,
            y: marble.position.y + 1,
            z: marble.position.z + 4,
            duration: 3,
            onUpdate: function() {
                camera.lookAt(marble.position)
                controls.target = marble.position
            }
        })
    }

    if (text === 'elephant' && elephant) {
        gsap.to(camera.position, {
            x: elephant.position.x - 1,
            y: elephant.position.y + 2,
            z: elephant.position.z + 6.5,
            duration: 5,
            onUpdate: function() {
                camera.lookAt(elephant.position)
                controls.target = elephant.position
            }
        })
    }

    if (text === 'elf' && elf) {
        gsap.to(camera.position, {
            x: elf.position.x - 1,
            y: elf.position.y + 1,
            z: elf.position.z + 4,
            duration: 5,
            onUpdate: function() {
                camera.lookAt(elf.position)
                controls.target = elf.position
            }
        })
    }

    if (text === 'horse' && horse) {
        gsap.to(camera.position, {
            x: horse.position.x - 1,
            y: horse.position.y +2,
            z: horse.position.z + 3,
            duration: 3,
            onUpdate: function() {
                camera.lookAt(horse.position.x, horse.position.y + 2, horse.position.z)
                controls.target = new THREE.Vector3(horse.position.x, horse.position.y + 2, horse.position.z)
            }
        })
    }
}

document.getElementById('timezone').innerText = Intl.DateTimeFormat().resolvedOptions().timeZone.split('_').join(" ")

document.addEventListener( 'keypress', onDocumentKeyPress, false );
document.addEventListener( 'keydown', onDocumentKeyDown, false );
document.addEventListener('mousemove', (event) => {
    myUniforms.uMouse.value.x = event.pageX
    myUniforms.uMouse.value.y = event.pageY
    // document.getElementById("mouseX").innerText = event.pageX
    // document.getElementById("mouseY").innerText = event.pageY
    // mouse for raycaster
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // update shaders
    myUniforms.uResolution.value.x = sizes.width//renderer.domElement.width;
    myUniforms.uResolution.value.y = sizes.height//renderer.domElement.height;
})