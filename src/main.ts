import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
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

const blocks: {
	[name: string]: { mesh: THREE.InstancedMesh; index: number; count: number }
} = {}

const blocksToLoad = ["grass", "dirt", "stone"]

async function initBlocks() {
	const textureLoader = new TextureLoader()
	for (let i = 0; i < blocksToLoad.length; i++) {
		const blockName = blocksToLoad[i]
		const textures = await textureLoader.load(`/${blockName}.png`, 16, 16)
		const geometry = new THREE.BoxGeometry(1, 1)
		const materials = textures.map((texture) => {
			return new THREE.MeshBasicMaterial({ map: texture })
		})
		const mesh = new THREE.InstancedMesh(geometry, materials, 0)
		blocks[blockName] = { mesh, index: 0, count: 0 }
		scene.add(mesh)
	}
	onBlocksInitiated()
}

const terrain = {} as {
	[blockName: string]: { x: number; y: number; z: number }[]
}

function initTerrain() {
	for (let x = -256; x < 256; x++) {
		for (let z = -256; z < 256; z++) {
			for (let y = 0; y < 16; y++) {
				let blockName = "stone"
				if (y >= 11 && y < 15) {
					blockName = "dirt"
				} else if (y >= 15) {
					blockName = "grass"
				}
				if (!terrain[blockName]) terrain[blockName] = []
				terrain[blockName].push({ x, y, z })
			}
		}
	}
}

function onBlocksInitiated() {
	initTerrain()

	for (const blockName in terrain) {
		const positions = terrain[blockName]

		const block = blocks[blockName]
		block.count = positions.length
		// block.mesh.geometry.applyMatrix4(block.mesh.matrix)
		const newMesh = new THREE.InstancedMesh(
			block.mesh.geometry,
			block.mesh.material,
			block.count
		)
		block.mesh = newMesh
		scene.add(block.mesh)

		positions.forEach((position) => {
			const dummy = new THREE.Object3D()
			dummy.position.set(position.x, position.y, position.z)
			dummy.updateMatrix()
			block.mesh.setMatrixAt(block.index, dummy.matrix)
			block.index += 1
		})
	}

	// const dummy = new THREE.Object3D()
	// dummy.position.set(x, y, z)
	// dummy.updateMatrix()

	// const block = blocks[blockName]
	// block.mesh.setMatrixAt(blocks[blockName].index, dummy.matrix)
	// block.index += 1
	// block.count += 1

	// if (block.count > block.mesh.count - 1) {
	// 	const newMesh = new THREE.InstancedMesh(
	// 		block.mesh.geometry,
	// 		block.mesh.material,
	// 		block.mesh.count + 64
	// 	)
	// 	block.mesh = newMesh
	// }}
}

camera.position.x = 15
camera.position.y = 15
camera.position.z = 15

function animate(elapsedTimeMs: number) {
	renderer.render(scene, camera)
	controls.update()
}

initBlocks()
