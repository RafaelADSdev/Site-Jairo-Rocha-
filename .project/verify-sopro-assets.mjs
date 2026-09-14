import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

// Blender retains the original scene: web exports must NOT silently include it.
for (const [name, meshes] of [['terreo', 61], ['superior', 57]]) {
  const file = readFileSync(new URL(`../public/models/sopro-${name}-detalhado.glb`, import.meta.url));
  assert.equal(file.toString('ascii', 0, 4), 'glTF');
  assert.equal(file.readUInt32LE(4), 2);
  assert.equal(file.readUInt32LE(8), file.length);
  const gltf = JSON.parse(file.subarray(20, 20 + file.readUInt32LE(12)).toString());
  assert.equal(gltf.scenes.length, 1, 'Only the selected interior scene is shipped');
  assert.equal(gltf.meshes.length, meshes, 'Room/material grouping remains optimized');
  assert(file.length < 1_200_000, 'Interior file budget is 1.2 MB');
  assert(gltf.images.every(image => image.bufferView !== undefined && !image.uri), 'Textures are embedded');
  assert(gltf.meshes.every(mesh => mesh.primitives.every(primitive => primitive.extensions?.KHR_draco_mesh_compression)), 'All geometry uses Draco');
  console.log(JSON.stringify({name, bytes: file.length, scenes: gltf.scenes.length, meshes: gltf.meshes.length}));
}
