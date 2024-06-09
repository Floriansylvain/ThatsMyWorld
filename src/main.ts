import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import Face from "./face"
import Block from "./block"

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

const image = document.createElement("img")
image.src = "/grass.png"
image.addEventListener("load", onImageLoaded, false)

function onImageLoaded() {
	const textures = [] as THREE.Texture[]

	for (let i = 0; i < 6; i++) {
		const canvas = document.createElement("canvas")
		canvas.width = 16
		canvas.height = 16

		const context = canvas.getContext("2d")
		context?.drawImage(image, 0, 16 * i, 16, 16, 0, 0, 16, 16)

		const texture = new THREE.Texture(canvas)
		texture.needsUpdate = true
		texture.magFilter = THREE.NearestFilter
		textures.push(texture)
	}

	onTextureLoaded(textures)
}

function onTextureLoaded(textures: THREE.Texture[]) {
	const chunk = [] as THREE.Vector3[]
	for (let i = -16; i < 16; i++) {
		for (let j = -16; j < 16; j++) {
			chunk.push(
				new THREE.Vector3(
					i,
					Math.ceil(Math.sin(i / 25) * 8 + Math.cos(j / 25) * 8),
					j
				)
			)
		}
	}

	const faces = [
		new Face("Up", chunk.length, textures[0]),
		new Face("North", chunk.length, textures[1]),
		new Face("South", chunk.length, textures[2]),
		new Face("East", chunk.length, textures[3]),
		new Face("West", chunk.length, textures[4]),
		new Face("Down", chunk.length, textures[5])
	]

	const cubes = [] as Block[]
	chunk.forEach((block) => {
		cubes.push(new Block(faces, block))
	})

	faces.forEach((face) => {
		if (face.instancedMesh) scene.add(face.instancedMesh)
	})
}

camera.position.x = 20
camera.position.y = 20
camera.position.z = 20

function animate(elapsedTimeMs: number) {
	renderer.render(scene, camera)
	controls.update()
}
