import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import starImg from "/textures/3.png"
import starImg2 from "/textures/8.png"


export function createScene(canvas) {
   /**
   * @params 
  */
   const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  const params = {
    counts: 200000,
    size: 0.01,
    radius: 2,
    branches: 8,
    spin: 2,
    randomness: 1.63,
    insideColor: "#d9b59c",
    midColor: "#ff8700",
    outsideColor: "#5f00a2",
  }

  /**
   * @instance 
  */
  const colorInside = new THREE.Color(params.insideColor);
  const midColor = new THREE.Color(params.midColor);
  const coloroutside = new THREE.Color(params.outsideColor);

  /**
   * @debug 
  */
  const gui = new dat.GUI();

  /**
   * @texture 
  */
  const loaderManager = new THREE.LoadingManager();

  const textureLoader = new THREE.TextureLoader(loaderManager);
  const starTexture = textureLoader.load(starImg);
  const particlesTexture = textureLoader.load(starImg2)

  /**
   * @scene 
  */
  const scene = new THREE.Scene();

  /**
   * @light 
  */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  /**
  * @camera 
 */
  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    50
  )
  const controls = new OrbitControls(camera, canvas);
  camera.position.z = 5;
  camera.position.y = 4;
  camera.lookAt(new THREE.Vector3())
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = true;
  scene.add(camera);

  /**
   * @stars  
  */
  const generateStars = () => {
    const counts = 10000;
    const starsGeometry = new THREE.BufferGeometry();
    const positionsArray = new Float32Array(counts * 3);

    for (let i = 0; i < counts * 3; i++) {
      positionsArray[i] = ((Math.random() - 0.5) * 2) * 45;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positionsArray, 3));
    const starsPoints = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        size: 0.1,
        color: 0xf1f1f1f1,
        sizeAttenuation: true,
        alphaMap: particlesTexture,
        transparent: true,
        alphaTest: 0.0001,
        depthTest: false,
        depthWrite: true,
      })
    )
    scene.add(starsPoints);
  }
  generateStars();

  /**
   * @galaxy 
  */
  let galaxyGeometry = null,
    galaxyMateiral = null,
    galaxyPoints = null;

  const generateGalaxy = () => {
    if (galaxyPoints !== null) {
      galaxyGeometry.dispose();
      galaxyMateiral.dispose();
      scene.remove(galaxyPoints);
    }

    galaxyGeometry = new THREE.BufferGeometry();
    const positionArray = new Float32Array(params.counts * 3);
    const colorsArray = new Float32Array(params.counts * 3);

    for (let i = 0; i < params.counts * 3; i++) {
      //* positioning of vertex's ----
      let vertex = i * 3;
      let r = Math.random() * params.radius;
      let b = i % params.branches;
      let ba = b / params.branches;
      let ap = ba * Math.PI * 2;
      let sp = params.spin / r * 1.17;

      let rx = (Math.random() - 0.5) * 0.2 * (params.randomness * (r / 1.1));
      let ry = (Math.random() - 0.5) * 0.2 * (params.randomness * (r / 1.5));
      let rz = (Math.random() - 0.5) * 0.2 * (params.randomness * (r / 1.1));


      positionArray[vertex] = (Math.cos(ap + sp) + rx) * r;
      positionArray[vertex + 1] = ry;
      positionArray[vertex + 2] = (Math.sin(ap + sp) + rz) * r;

      galaxyGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positionArray, 3)
      );

      //* positioning of color's ----
      const mixedColor = colorInside.clone();
      mixedColor.lerpColors(
        midColor,
        coloroutside,
        r / (params.radius * 0.8)
      );
      colorsArray[vertex] = mixedColor.r;
      colorsArray[vertex + 1] = mixedColor.g;
      colorsArray[vertex + 2] = mixedColor.b;

      galaxyGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colorsArray, 3)
      )
    }
    galaxyMateiral = new THREE.PointsMaterial({
      size: params.size,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      transparent: true,
      map: starTexture
    });

    galaxyPoints = new THREE.Points(
      galaxyGeometry,
      galaxyMateiral
    )
    scene.add(galaxyPoints);
  };

  /**
    * @galaxy_gui 
  */

  gui.add(params, "counts").min(300).max(500000).step(1).onFinishChange(generateGalaxy);
  gui.add(params, "size").min(0.005).max(0.1).step(0.0001).onFinishChange(generateGalaxy);
  gui.add(params, "radius").min(1).max(7).step(1).onFinishChange(generateGalaxy);
  gui.add(params, "branches").min(3).max(20).step(1).onFinishChange(generateGalaxy);
  gui.add(params, "spin").min(-1).max(5).step(0.001).onFinishChange(generateGalaxy);
  gui.add(params, "randomness").min(1).max(5).step(0.01).onFinishChange(generateGalaxy);
  generateGalaxy();


  /**
   * @renderer 
  */
  const renderer = new THREE.WebGLRenderer({
    canvas
  })
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.max(window.devicePixelRatio, 2));

  /**
   * @animate 
  */
  const clock = new THREE.Clock(true);
  const animation = () => {
    const elapsed = clock.getElapsedTime();

    renderer.render(scene, camera);
    controls.update();

    galaxyPoints.rotation.y = elapsed * -0.09;

    window.requestAnimationFrame(animation);
  }
  animation();

  /**
   * @update 
  */
  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(2 || window.devicePixelRatio);
  })

  /**
   * @helpers 
  */
  // const axesHelper = new THREE.AxesHelper();
  // scene.add(axesHelper);
}