
//for storing buffer objs and individual shape data (rot, pos, scale)
class shape {
  constructor(bvbo, bnbo, bibo, len, id) {
    this.vbo = bvbo;
    this.nbo = bnbo;
    this.ibo = bibo;
    this.length = len;
    this.id = id;
    this.pickColor = idToColor(id); //this is just id encoded as a color for the onclick event
    //redudancy makes it so the conversion has to happen less frequently. Not that this is computationally intensive lol
  }
  posX = 0;
  posY = 0;
  posZ = 0;
  rotX = 0;
  rotY = 0;
  rotZ = 0;
  scaX = 1;
  scaY = 1;
  scaZ = 1;


  getRotationMatrix() {
    const cx = Math.cos(this.rotY), sx = Math.sin(this.rotY);
    const cy = Math.cos(this.rotX), sy = Math.sin(this.rotX);
    const cz = Math.cos(this.rotZ), sz = Math.sin(this.rotZ);

    // Rotation X
    const rotXMat = [
      1, 0, 0, 0,
      0, cy, sy, 0,
      0, -sy, cy, 0,
      0, 0, 0, 1
    ];

    // Rotation Y
    const rotYMat = [
      cx, 0, -sx, 0,
      0, 1, 0, 0,
      sx, 0, cx, 0,
      0, 0, 0, 1
    ];

    // Rotation Z (optional, will come back to this (probably))
    const rotZMat = [
      cz, sz, 0, 0,
      -sz, cz, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    // Combine Y * X * Z (order matters)
    return multiplyMat4(multiplyMat4(rotYMat, rotXMat), rotZMat);
  }
  getTranslationMatrix() {
    return mat4Translate(mat4Identity(), [this.posX, this.posY, this.posZ]);
  }
  getScaleVector() {
    return [this.scaX, this.scaY, this.scaZ];
  }

}
function idToColor(id) {
  return [
    (id & 0xFF) / 255,
    ((id >> 8) & 0xFF) / 255,
    ((id >> 16) & 0xFF) / 255
  ];
}
function colorToId([r, g, b]) {
  return r + (g << 8) + (b << 16);
}

// cube
const cubePositions = new Float32Array([
  -1, -1, -1,  // 0
  1, -1, -1,  // 1
  1, 1, -1,  // 2
  -1, 1, -1,  // 3
  -1, -1, 1,  // 4
  1, -1, 1,  // 5
  1, 1, 1,  // 6
  -1, 1, 1   // 7
]);

const cubeIndices = new Uint16Array([
  // Front
  4, 5, 6, 4, 6, 7,
  // Back
  1, 0, 3, 1, 3, 2,
  // Top
  3, 7, 6, 3, 6, 2,
  // Bottom
  0, 1, 5, 0, 5, 4,
  // Right
  1, 2, 6, 1, 6, 5,
  // Left
  0, 4, 7, 0, 7, 3,
]);

const tetrahedronPositions = new Float32Array([
  1, 1, 1,    // Vertex 0
  -1, -1, 1,   // Vertex 1
  -1, 1, -1,   // Vertex 2
  1, -1, -1    // Vertex 3
]);

const tetrahedronIndices = new Uint16Array([
  0, 1, 2,
  0, 3, 1,
  0, 2, 3,
  1, 3, 2
]);
function interpolateColors(length = 1, minBrightness = 0.1, color1 = null, color2 = null) {
  //make this a minimum avg brightness of .5 by default
  let colors = []
  let c1, c2, c3;
  let e1, e2, e3;
  if (color1) {
    c1 = color1[0]; c2 = color1[1]; c3 = color1[2];
  }
  else {
    do {
      c1 = Math.random();
      c2 = Math.random();
      c3 = Math.random();
    } while ((c1 + c2 + c3) / 3 < minBrightness)
  }

  if (color2) {
    c1 = color2[0]; c2 = color2[1]; c3 = color2[2];
  }
  else {
    do {
      e1 = Math.random();
      e2 = Math.random();
      e3 = Math.random();
    } while ((e1 + e2 + e3) / 3 < minBrightness)
  }
  for (i = 0; i < length; i++) {
    //interpolate between the two random colors
    i1 = c1 + ((e1 - c1) / length) * (i + 1);
    i2 = c2 + ((e2 - c2) / length) * (i + 1);
    i3 = c3 + ((e3 - c3) / length) * (i + 1);
    colors.push(i1, i2, i3);
  }
  return new Float32Array(colors);
}
//Scale by factor
function scale(array, factor = 1) {
  return array.map(x => x * factor);
}

function createCube(radius = 1) {
  return {
    positions: scale(cubePositions, radius),
    colors: interpolateColors(cubePositions.length),
    indices: cubeIndices,
  };
}

function createTetrahedron(radius = 1) {
  return {
    positions: scale(tetrahedronPositions, radius),
    colors: interpolateColors(tetrahedronPositions.length),
    indices: tetrahedronIndices,
  };
}


function createCylinder(radius = 1, height = 2, segments = 32) {
  const positions = [];
  const indices = [];

  // Generate vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    // Top circle
    positions.push(x, height / 2, z);

    // Bottom circle
    positions.push(x, -height / 2, z);
  }

  // Center points for caps
  const topCenterIndex = positions.length / 3;
  positions.push(0, height / 2, 0);
  const bottomCenterIndex = positions.length / 3;
  positions.push(0, -height / 2, 0);

  // Side indices
  for (let i = 0; i < segments; i++) {
    let p1 = i * 2;
    let p2 = p1 + 1;
    let p3 = ((i + 1) % segments) * 2;
    let p4 = p3 + 1;

    // Side face (two triangles)
    indices.push(p1, p3, p2);
    indices.push(p3, p4, p2);
  }

  // Top cap (CCW order for top face)
for (let i = 0; i < segments; i++) {
  let p1 = ((i + 1) % segments) * 2;
  let p2 = i * 2;
  indices.push(topCenterIndex, p1, p2);
}

// Bottom cap (CCW order from bottom view)
for (let i = 0; i < segments; i++) {
  let p1 = i * 2 + 1;
  let p2 = ((i + 1) % segments) * 2 + 1;
  indices.push(bottomCenterIndex, p1, p2);
}

  return {
    positions: new Float32Array(positions),
    colors: interpolateColors(positions.length),
    indices: new Uint16Array(indices)
  };
}

function createSphere(radius = 1, latBands = 24, longBands = 24) {
  const positions = [];
  const indices = [];

  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= longBands; lon++) {
      const phi = (lon * 2 * Math.PI) / longBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = radius * cosPhi * sinTheta;
      const y = radius * cosTheta;
      const z = radius * sinPhi * sinTheta;

      positions.push(x, y, z);
    }
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < longBands; lon++) {
      const first = lat * (longBands + 1) + lon;
      const second = first + longBands + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: interpolateColors(positions.length),
    indices: new Uint16Array(indices)
  };
}

function createCone(radius = 1, height = 2, segments = 32) {
  const positions = [];
  const indices = [];

  const apexIndex = 0;
  positions.push(0, height / 2, 0); // Apex

  // Circle vertices
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    positions.push(x, -height / 2, z);
  }

  const baseCenterIndex = positions.length / 3;
  positions.push(0, -height / 2, 0); // center of base

  // Side triangles
  for (let i = 1; i <= segments; i++) {
    const next = i % segments + 1;
    indices.push(apexIndex, i, next);
  }

  // Base triangles
  for (let i = 1; i <= segments; i++) {
    const next = i % segments + 1;
    indices.push(baseCenterIndex, next, i);
  }

  return {
    positions: new Float32Array(positions),
    colors: interpolateColors(positions.length),
    indices: new Uint16Array(indices)
  };
}

function createTorus(majorRadius = 1, minorRadius = 0.3, majorSegments = 32, minorSegments = 16) {
  const positions = [];
  const indices = [];

  for (let i = 0; i <= majorSegments; i++) {
    const theta = (i / majorSegments) * 2 * Math.PI;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    for (let j = 0; j <= minorSegments; j++) {
      const phi = (j / minorSegments) * 2 * Math.PI;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      const x = (majorRadius + minorRadius * cosPhi) * cosTheta;
      const y = minorRadius * sinPhi;
      const z = (majorRadius + minorRadius * cosPhi) * sinTheta;

      positions.push(x, y, z);
    }
  }

  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const first = i * (minorSegments + 1) + j;
      const second = first + minorSegments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: interpolateColors(positions.length),
    indices: new Uint16Array(indices)
  };
}