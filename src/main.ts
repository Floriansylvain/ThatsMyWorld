import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import Face from "./face"
import Block from "./block"
import TextureLoader from "./textureLoader"
// import TextureLoader from "./textureLoader"

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

let grassTextures = [] as THREE.Texture[]
let dirtTextures = [] as THREE.Texture[]

async function loadTextures() {
	const textureLoader = new TextureLoader(16, 16)
	grassTextures = await textureLoader.load("/grass.png")
	dirtTextures = await textureLoader.load("/dirt.png")
	// const debugTextures = await textureLoader.load("/debug.png")
	onTextureLoaded()
}

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

function onTextureLoaded() {
	const chunk = [] as THREE.Vector3[]
	const chunkSet = new Set<string>()
	const radius = 32
	for (let i = 0; i < radius; i++) {
		for (let j = 0; j < radius; j++) {
			const max = Math.ceil(Math.sin(i / 30) * 10 + Math.cos(j / 30) * 10)
			for (let k = -64; k < max; k++) {
				const vec3 = new THREE.Vector3(i, k, j)
				chunk.push(vec3)
				chunkSet.add(vec3.toArray().toString())
			}
		}
	}

	const faceCounts = countVisibleFaces(chunkSet, chunk)

	const grassFaces = [
		new Face("Up", faceCounts.Up, grassTextures[0]),
		new Face("North", faceCounts.North, grassTextures[1]),
		new Face("South", faceCounts.South, grassTextures[2]),
		new Face("East", faceCounts.East, grassTextures[3]),
		new Face("West", faceCounts.West, grassTextures[4]),
		new Face("Down", faceCounts.Down, grassTextures[5])
	]

	const dirtFaces = [
		new Face("Up", faceCounts.Up, dirtTextures[0]),
		new Face("North", faceCounts.North, dirtTextures[1]),
		new Face("South", faceCounts.South, dirtTextures[2]),
		new Face("East", faceCounts.East, dirtTextures[3]),
		new Face("West", faceCounts.West, dirtTextures[4]),
		new Face("Down", faceCounts.Down, dirtTextures[5])
	]

	const cubes = [] as Block[]
	chunk.forEach((block) => {
		cubes.push(new Block(filterFaces(grassFaces, block, chunkSet), block))
	})

	grassFaces.forEach((face) => {
		if (face.instancedMesh) scene.add(face.instancedMesh)
	})
}

camera.position.x = 15
camera.position.y = 15
camera.position.z = 15

function animate(elapsedTimeMs: number) {
	renderer.render(scene, camera)
	controls.update()
}

loadTextures()
