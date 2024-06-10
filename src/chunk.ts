import { InstancedMesh, Texture, Vector3 } from "three"
import Face, { Orientation } from "./face"

const FACES_OFFSETS: { [key: string]: Vector3 } = {
	Up: new Vector3(0, 1, 0),
	North: new Vector3(0, 0, 1),
	South: new Vector3(0, 0, -1),
	East: new Vector3(-1, 0, 0),
	West: new Vector3(1, 0, 0),
	Down: new Vector3(0, -1, 0)
}

interface BlockData {
	position: Vector3
	textureName: string
}

export default class Chunk {
	chunk: BlockData[]
	chunkSet: Set<string>
	radius: number
	textures: { [name: string]: Texture[] }
	faces: { [key: string]: Face[] }

	constructor(radius: number, textures: { [name: string]: Texture[] }) {
		this.chunk = []
		this.chunkSet = new Set<string>()
		this.radius = radius
		this.textures = textures
		this.faces = {}
		this.generateChunk()
		this.initializeFaces()
	}

	generateChunk() {
		for (let i = 0; i < this.radius; i++) {
			for (let j = 0; j < this.radius; j++) {
				const max = Math.ceil(Math.sin(i / 30) * 10 + Math.cos(j / 30) * 10)
				for (let k = -16; k <= max; k++) {
					const position = new Vector3(i, k, j)
					let textureName = "stone"
					if (k === max) textureName = "grass"
					else if (k > max - 6) textureName = "dirt"
					this.chunk.push({ position, textureName })
					this.chunkSet.add(position.toArray().toString())
				}
			}
		}
	}

	initializeFaces() {
		for (const textureName in this.textures) {
			const textureFaces = this.textures[textureName].map((texture, index) => {
				const orientation = ["Up", "North", "South", "East", "West", "Down"][
					index
				] as Orientation
				return new Face(orientation, 0, texture)
			})
			this.faces[textureName] = textureFaces
		}
	}

	filterFaces(block: Vector3, textureName: string): Face[] {
		return this.faces[textureName].filter((face) => {
			const offset = FACES_OFFSETS[face.orientation]
			const adjacentBlock = new Vector3(
				block.x + offset.x,
				block.y + offset.y,
				block.z + offset.z
			)
			return !this.chunkSet.has(adjacentBlock.toArray().toString())
		})
	}

	countVisibleFaces() {
		const faceCounts: { [key: string]: { [key: string]: number } } = {}

		this.chunk.forEach(({ position, textureName }) => {
			if (!faceCounts[textureName]) {
				faceCounts[textureName] = {
					Up: 0,
					North: 0,
					South: 0,
					East: 0,
					West: 0,
					Down: 0
				}
			}
			Object.keys(FACES_OFFSETS).forEach((orientation) => {
				const offset = FACES_OFFSETS[orientation]
				const adjacentBlock = new Vector3(
					position.x + offset.x,
					position.y + offset.y,
					position.z + offset.z
				)
				if (!this.chunkSet.has(adjacentBlock.toArray().toString())) {
					faceCounts[textureName][orientation]++
				}
			})
		})

		for (const textureName in faceCounts) {
			for (const orientation in faceCounts[textureName]) {
				const face = this.faces[textureName].find(
					(f) => f.orientation === orientation
				)
				if (!face?.instancedMesh) return
				face.instancedMesh.count = faceCounts[textureName][orientation]
				face.instancedMesh = new InstancedMesh(
					face?.geometry,
					face?.material,
					faceCounts[textureName][orientation]
				) // TODO dégueulasse
			}
		}

		return faceCounts
	}
}
