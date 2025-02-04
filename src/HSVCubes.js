import * as THREE from "three";
import {hsv2rgb} from './ColorUtils';
import {createTickPlane, createAxisArrow, PLANE_SIZE, PLANE_THICKNESS} from './CubeUtils';

const NUM = 6;   // number of cubes in circle
const MAX_RADIUS = 60;

let STEPS = 7;
const HEIGHT = 140;
const OFFSET_Y = 10;


const addHSVProps = (cubes, steps) => {
  STEPS = steps - 1;
  const hsvProps = []
  for (let i = 0; i <= STEPS; i++) {
    const value = i / STEPS * 100.0;
    for (let j = 0; j <= i; j++) {
      const saturation = j / STEPS * 100.0;
      const numCubes = Math.max(j * NUM, 1);
      for (let k = 0; k < numCubes; k++) {
        const degree = 360.0 / numCubes * k;
        const color = hsv2rgb(degree, saturation, value);
        const [x, y, z] = getCubePosition(degree, saturation, value);
        hsvProps.push({
          color: color,
          position: [x, y, z],
          vals: {
            H: degree,
            S: saturation,
            V: value,
          },
          forceShow: {
            // if saturation is 0,
            // show this cube whenever filtered by any hue value
            H: saturation === 0,
          }
        });
      }
    }
  }
  hsvProps.sort(_sortByColor);
  for (let i = 0; i < cubes.length; i++) {
    const cube = cubes[i];
    cube.userData.HSV = hsvProps[i];
  }
  return;
};

const createHSVAxes = () => {
  const axes = [];
  const ticks = [];
  const conf = [
    // saturation
    {
      dir: [1, 0, 0],
      origin: [0, OFFSET_Y + HEIGHT, 0],
      len: MAX_RADIUS + 30,
      color: 0xbbbbbb,
    },
    // value
    {
      dir: [0, 1, 0],
      origin: [0, OFFSET_Y, 0],
      len: HEIGHT + 40,
      color: 0xeeeeee,
    },
  ];
  for (const c of conf) {
    const axis = createAxisArrow(c.origin, c.dir, c.color, c.len, 'HSV');
    axes.push(axis);
  }

  // tick for saturation axis
  for (let i = 0; i <= STEPS; i++) {
    const saturation = i / STEPS * 100.0;
    const pos = getCubePosition(0, saturation, 100.0);
    pos[0] += PLANE_THICKNESS / 2;
    pos[1] += PLANE_SIZE / 2;
    const plane = createTickPlane(0, 0xdddddd, pos, 'HSV', 'S', saturation);
    ticks.push(plane);
  }

  // tick for value axis
  for (let i = 0; i <= STEPS; i++) {
    const value = i / STEPS * 100.0;
    const pos = getCubePosition(180, 0, value);
    pos[0] -= PLANE_SIZE / 2;
    const plane = createTickPlane(1, 0xdddddd, pos, 'HSV', 'V', value);
    ticks.push(plane);
  }

  // hue
  axes.push(createColorHueRing());
  for (let i = 0; i < NUM; i++) {
    const degree = 360.0 / NUM * i;
    const rad = (Math.PI / 180) * degree;
    const pos = getCubePosition(degree, 100.0, 100.0);
    pos[0] += PLANE_SIZE / 2 * Math.cos(rad);
    pos[2] += PLANE_SIZE / 2 * Math.sin(rad);
    pos[1] += PLANE_SIZE / 2;
    const color = hsv2rgb(degree, 100.0, 100.0);
    const plane = createTickPlane(2, color, pos, 'HSV', 'H', degree);
    plane.rotation.y = -rad;
    ticks.push(plane);
  }

  return [axes, ticks];
};

const createColorHueRing = () => {
  const N = STEPS * NUM;
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const color = new THREE.Color();
  const colors = [];
  for (let i = 0; i <= N; i++) {
    const degree = 360.0 / N * i;
    const [x, y, z] = getCubePosition(degree, 100.0, 100.0);
    vertices.push(x, y, z);
    color.setHSL(i / N, 1.0, 0.5);
    colors.push( color.r, color.g, color.b );
  }
  geometry.setAttribute( 'position',
      new THREE.Float32BufferAttribute( vertices, 3 ) );
  geometry.setAttribute( 'color',
      new THREE.Float32BufferAttribute( colors, 3 ) );
  const material = new THREE.LineBasicMaterial(
      { color: 0xffffff, vertexColors: THREE.VertexColors } );
  const line = new THREE.Line(geometry, material);
  line.material.linewidth = 2;
  line.userData.model = 'HSV';
  line.visible = false;
  return line;
};

const _sortByColor = (a, b) => {
  if (a.color > b.color) {
      return 1;
  }
  if (a.color < b.color ) {
      return -1;
  }
  return 0;
};


const getCubePosition = (degree, saturation, value) =>{
  const radian = -(degree * Math.PI / 180.0);
  const radius = MAX_RADIUS * saturation / 100.0;
  return [
    Math.cos(radian) * radius,
    HEIGHT * (value / 100.0) + OFFSET_Y,
    Math.sin(radian) * radius
  ];
};

export {addHSVProps, createHSVAxes};
