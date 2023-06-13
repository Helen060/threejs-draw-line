import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';

let hasTouchStartEvent = 'ontouchstart' in document.createElement( 'div' );

let scene, renderer, camera;

let controls;

let mouse = new THREE.Vector3(0, 0, 0);

let width = window.innerWidth;
let height = window.innerHeight;

let isDown = false;
let movePointArr = [];
let isControls = false;

let pathMesh;

let cubeMesh;

let timeCount = 0;

const init = function () {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  // scene.fog = new Fog(scene.background, 1, 200);
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.y = 50;
  camera.position.z = -150;
  // camera.position.x = -50;


  camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;

  document.querySelector('body').appendChild(renderer.domElement);
  
  render();

  addEvent();

  cubeMesh = createCube();
  scene.add(cubeMesh);

  createGrid();

  scene.add(new THREE.AmbientLight(0xffffff, 1));
}

const createGrid = function () {
  let helper = new THREE.GridHelper(300, 20, 0xffffff);
  scene.add(helper);
}

const createCube = function () {
  let geometry = new THREE.BoxGeometry( 6, 6, 6 );
  let material = new THREE.MeshLambertMaterial({color: 0xff00ff,  emissive: 0x072534});
  let cube = new THREE.Mesh(geometry, material);
  cube.name = 'cube';
  cube.position.set(0, 0, 0);
  return cube;
}

const addEvent = function () {

  renderer.domElement.addEventListener(hasTouchStartEvent ? 'touchstart' : 'mousedown', mouseDownHandler, false);
  renderer.domElement.addEventListener(hasTouchStartEvent ? 'touchmove' : 'mousemove', mouseMoveHandler, false);
  renderer.domElement.addEventListener(hasTouchStartEvent ? 'touchend' : 'mouseup', mouseUpHandler, false);

  document.querySelector('.btn-start-animate').addEventListener('click', startHandler, false);
  document.querySelector('.btn-draw-animate').addEventListener('click', endHandler, false);

  window.addEventListener('resize', resizeHandler, false);
}

const get3dPoint = function (ev) {
    let vector = new THREE.Vector3(0, 0, 0);
    let pos = new THREE.Vector3(0, 0, 0);
    let x = ev.touches ? ev.changedTouches[0].clientX : ev.clientX
    let y = ev.touches ? ev.changedTouches[0].clientY : ev.clientY

    vector.x = (x / window.innerWidth) * 2 - 1;
    vector.y = -(y / window.innerHeight) * 2 + 1;

    vector.unproject(camera);
    vector.sub(camera.position).normalize();
    let dir = - camera.position.y / vector.y;
    pos.copy(camera.position).add(vector.multiplyScalar(dir));
    return pos;
}

const mouseDownHandler = function (ev) {
  console.log('down!');
  if (isControls) return false;
  isDown = true;
  mouse.copy(get3dPoint(ev));
  movePointArr = [];
  movePointArr.push(mouse);
}

const mouseMoveHandler = function (ev) {
  if (isControls) return false;
  if (!isDown) return  false;
  console.log('move!');
  movePointArr.push(get3dPoint(ev));
  createPath(movePointArr);
}

const mouseUpHandler = function (ev) {
  if (isControls) return false;
  console.log('up!');
  isDown = false;
  movePointArr.push(get3dPoint(ev));
  createPath(movePointArr);
}

const createPath = function (pathArr) {
  let geometry = new THREE.BufferGeometry().setFromPoints(pathArr);

  if (!pathMesh) {
    let material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    pathMesh = new THREE.Line(geometry, material);

    scene.add(pathMesh);
  } else {
    pathMesh.geometry = geometry;
    pathMesh.geometry.verticesNeedUpdate = true;
  }
}


const render = function (timestamp) {
  requestAnimationFrame(render);
  // controls.update();
  renderer.render(scene, camera);

  if (isControls && cubeMesh && movePointArr.length !== 0) {

    if (timeCount === movePointArr.length) {
      timeCount = 0;
    }

    cubeMesh.position.copy(movePointArr[timeCount]);
    timeCount += 1;
    
  }
}

const startHandler = function (ev) {
  ev.stopPropagation();
  console.log('start');
  isControls = true;
  controls.enabled = isControls;
}

const endHandler = function () {
  console.log('end');
  isControls = false;
  controls.enabled = isControls;
}

const resizeHandler = function () {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  // composer.setSize(width, height);
}

init();
