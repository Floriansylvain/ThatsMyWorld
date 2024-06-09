import { Object3D, Vector3 } from "three"
import Face from "./face"
import { degToRad } from "three/src/math/MathUtils.js"

function randInt(min: number, max: number): number {
	const minCeiled = Math.ceil(min)
	const maxFloored = Math.floor(max)
	return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}

export default class Block {
	faces: Face[]
	facesIndexes: number[] = []
	position: Vector3

	constructor(faces: Face[], position: Vector3) {
		this.faces = faces
		this.position = position
		this.initFaces()
	}

	setPosition(vec3: Vector3) {
		this.position = vec3
		this.updateFacesPosition()
	}

	private updateFacesPosition() {
		this.faces.forEach((face, i) => {
			const dummy = new Object3D()
			dummy.position.add(this.position)
			dummy.updateMatrix()
			face.instancedMesh!.setMatrixAt(this.facesIndexes[i], dummy.matrix)
			face.instancedMesh!.instanceMatrix.needsUpdate = true
		})
	}

	private initFaces() {
		this.faces.forEach((face) => {
			const dummy = new Object3D()
			dummy.position.add(this.position)
			if (face.orientation === "Up" || face.orientation === "Down") {
				dummy.rotateOnAxis(new Vector3(0, 1, 0), degToRad(90 * randInt(0, 4)))
			}
			dummy.updateMatrix()
			face.instancedMesh?.setMatrixAt(face.instaceIndex, dummy.matrix)
			this.facesIndexes.push(face.instaceIndex)
			face.instaceIndex += 1
		})
	}
}
