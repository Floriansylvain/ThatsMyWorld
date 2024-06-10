import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import Chunk from "./chunk"
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

let textures: { [name: string]: THREE.Texture[] } = {}

async function loadTextures() {
	const textureLoader = new TextureLoader(16, 16)
	textures["grass"] = await textureLoader.load("/grass.png")
	textures["dirt"] = await textureLoader.load("/dirt.png")
	textures["stone"] = await textureLoader.load("/stone.png")
	onTexturesLoaded()
}

function onTexturesLoaded() {
	const radius = 128
	const chunk = new Chunk(radius, textures)

	chunk.countVisibleFaces()

	const cubes = [] as Block[]
	chunk.chunk.forEach(({ position, textureName }) => {
		const faces = chunk.filterFaces(position, textureName)
		cubes.push(new Block(faces, position))
	})

	Object.values(chunk.faces).forEach((faceArray) => {
		faceArray.forEach((face) => {
			if (face.instancedMesh) scene.add(face.instancedMesh)
		})
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
