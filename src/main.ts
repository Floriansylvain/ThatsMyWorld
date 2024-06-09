import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import Face from "./face"
import Block from "./block"
import TextureLoader from "./textureLoader"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setAnimationLoop(animate)
const controls = new OrbitControls(camera, renderer.domElement)
controls.update()
document.body.appendChild(renderer.domElement)

new TextureLoader("/grass.png", 16, 16, onTextureLoaded)

// const gridHelper = new THREE.GridHelper(1000, 1000)
// scene.add(gridHelper)

// const axesHelper = new THREE.AxesHelper(500)
// scene.add(axesHelper)

const FACES_OFFSETS: { [key: string]: THREE.Vector3 } = {
	Up: new THREE.Vector3(0, 1, 0),
	North: new THREE.Vector3(0, 0, 1),
	South: new THREE.Vector3(0, 0, -1),
	East: new THREE.Vector3(-1, 0, 0),
	West: new THREE.Vector3(1, 0, 0),
	Down: new THREE.Vector3(0, -1, 0)
}

function filterFaces(
	faces: Face[],
	block: THREE.Vector3,
	chunkSet: Set<string>
): Face[] {
	return faces.filter((face) => {
		const offset = FACES_OFFSETS[face.orientation]
		const adjacentBlock = new THREE.Vector3(
			block.x + offset.x,
			block.y + offset.y,
			block.z + offset.z
		)
		return !chunkSet.has(adjacentBlock.toArray().toString())
	})
}

function countVisibleFaces(
	chunkSet: Set<string>,
	chunk: THREE.Vector3[]
): { [key: string]: number } {
	const faceCounts: { [key: string]: number } = {
		Up: 0,
		North: 0,
		South: 0,
		East: 0,
		West: 0,
		Down: 0
	}

	chunk.forEach((block) => {
		Object.keys(FACES_OFFSETS).forEach((orientation) => {
			const offset = FACES_OFFSETS[orientation]
			const adjacentBlock = new THREE.Vector3(
				block.x + offset.x,
				block.y + offset.y,
				block.z + offset.z
			)
			if (!chunkSet.has(adjacentBlock.toArray().toString())) {
				faceCounts[orientation]++
			}
		})
	})

	return faceCounts
}

function onTextureLoaded(textures: THREE.Texture[]) {
	const chunk = [] as THREE.Vector3[]
	const chunkSet = new Set<string>()
	const radius = 64
	for (let i = -radius; i < radius; i++) {
		for (let j = -radius; j < radius; j++) {
			const block = new THREE.Vector3(
				i,
				Math.ceil(Math.sin(i / 25) * 8 + Math.cos(j / 25) * 8),
				j
			)
			chunk.push(block)
			chunkSet.add(block.toArray().toString())
		}
	}

	const faceCounts = countVisibleFaces(chunkSet, chunk)

	const faces = [
		new Face("Up", faceCounts.Up, textures[0]),
		new Face("North", faceCounts.North, textures[1]),
		new Face("South", faceCounts.South, textures[2]),
		new Face("East", faceCounts.East, textures[3]),
		new Face("West", faceCounts.West, textures[4]),
		new Face("Down", faceCounts.Down, textures[5])
	]

	const cubes = [] as Block[]
	chunk.forEach((block) => {
		cubes.push(new Block(filterFaces(faces, block, chunkSet), block))
	})

	faces.forEach((face) => {
		if (face.instancedMesh) scene.add(face.instancedMesh)
	})
}

camera.position.x = 5
camera.position.y = 5
camera.position.z = 5

function animate(elapsedTimeMs: number) {
	renderer.render(scene, camera)
	controls.update()
}
