// Bundled by build.mjs into one IIFE so the page stays a single self-contained file.
import * as THREE_NS from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
window.THREE = Object.assign({}, THREE_NS, { RoomEnvironment, RoundedBoxGeometry, toCreasedNormals });
