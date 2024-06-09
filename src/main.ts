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

const ambientLight = new THREE.AmbientLight(new THREE.Color("white"), 5)
scene.add(ambientLight)

const chunk = [] as THREE.Vector3[]
for (let i = -16; i < 16; i++) {
	for (let j = -16; j < 16; j++) {
		chunk.push(
			new THREE.Vector3(
				i,
				Math.floor(Math.sin(i / 12) * 4 + Math.cos(j / 12) * 4),
				j
			)
		)
	}
}

const faces = [
	new Face(new THREE.Color("white"), "Up", chunk.length),
	new Face(new THREE.Color("red"), "Down", chunk.length),
	new Face(new THREE.Color("blue"), "North", chunk.length),
	new Face(new THREE.Color("green"), "East", chunk.length),
	new Face(new THREE.Color("yellow"), "West", chunk.length),
	new Face(new THREE.Color("purple"), "South", chunk.length)
]

const cubes = [] as Block[]
chunk.forEach((block) => {
	cubes.push(new Block(faces, block))
})

faces.forEach((face) => {
	if (face.instancedMesh) scene.add(face.instancedMesh)
})

camera.position.x = 20
camera.position.y = 20
camera.position.z = 20

function animate(elapsedTimeMs: number) {
	renderer.render(scene, camera)
	controls.update()
}
