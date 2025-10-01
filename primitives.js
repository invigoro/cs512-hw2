// cube
const cubePositions = new Float32Array([
  -1, -1, -1,  // 0
   1, -1, -1,  // 1
   1,  1, -1,  // 2
  -1,  1, -1,  // 3
  -1, -1,  1,  // 4
   1, -1,  1,  // 5
   1,  1,  1,  // 6
  -1,  1,  1   // 7
]);

const cubeColors = new Float32Array([
  1,0,0,  0,1,0,  0,0,1, 1,1,0, 1,0,1, 0,1,1, 1,1,0, 1,0,1
]);


const cubeIndices = new Uint16Array([
  // Front
  4, 5, 6,   4, 6, 7,
  // Back
  1, 0, 3,   1, 3, 2,
  // Top
  3, 7, 6,   3, 6, 2,
  // Bottom
  0, 1, 5,   0, 5, 4,
  // Right
  1, 2, 6,   1, 6, 5,
  // Left
  0, 4, 7,   0, 7, 3,
]);

const tetrahedronPositions = new Float32Array([
  1, 1, 1,    // Vertex 0
 -1, -1, 1,   // Vertex 1
 -1, 1, -1,   // Vertex 2
 1, -1, -1    // Vertex 3
]);

const tetrahedronColors = new Float32Array([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
  1, 1, 0
]);

const tetrahedronIndices = new Uint16Array([
  0, 1, 2,
  0, 3, 1,
  0, 2, 3,
  1, 3, 2
]);

class buff {
  constructor(bvbo, bnbo, bibo, len){
    this.vbo = bvbo;
    this.nbo = bnbo;
    this.ibo = bibo;
    this.length = len;
  }
}

function createCylinder(radius = 1, height = 2, segments = 32) {
  const positions = [];
  const colors = [];
  const indices = [];

  // Generate vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    // Top circle
    positions.push(x, height / 2, z);
    colors.push(Math.random(), Math.random(), Math.random());

    // Bottom circle
    positions.push(x, -height / 2, z);
    colors.push(Math.random(), Math.random(), Math.random());
  }

  // Center points for caps
  const topCenterIndex = positions.length / 3;
  positions.push(0, height / 2, 0);
  colors.push(1, 1, 1);
  const bottomCenterIndex = positions.length / 3;
  positions.push(0, -height / 2, 0);
  colors.push(1, 1, 1);

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

  // Top cap
  for (let i = 0; i < segments; i++) {
    let p1 = i * 2;
    let p2 = ((i + 1) % segments) * 2;
    indices.push(topCenterIndex, p1, p2);
  }

  // Bottom cap
  for (let i = 0; i < segments; i++) {
    let p1 = i * 2 + 1;
    let p2 = ((i + 1) % segments) * 2 + 1;
    indices.push(bottomCenterIndex, p2, p1);
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices)
  };
}

function createSphere(radius = 1, latBands = 24, longBands = 24) {
  const positions = [];
  const colors = [];
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
      colors.push(Math.random(), Math.random(), Math.random());
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
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices)
  };
}

function createCone(radius = 1, height = 2, segments = 32) {
  const positions = [];
  const colors = [];
  const indices = [];

  const apexIndex = 0;
  positions.push(0, height / 2, 0); // Apex
  colors.push(1, 1, 1);

  // Circle vertices
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    positions.push(x, -height / 2, z);
    colors.push(Math.random(), Math.random(), Math.random());
  }

  const baseCenterIndex = positions.length / 3;
  positions.push(0, -height / 2, 0); // center of base
  colors.push(1, 1, 1);

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
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices)
  };
}

function createTorus(majorRadius = 1, minorRadius = 0.3, majorSegments = 32, minorSegments = 16) {
  const positions = [];
  const colors = [];
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
      colors.push(Math.random(), Math.random(), Math.random());
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
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices)
  };
}