import {
	Color,
	InstancedMesh,
	MeshLambertMaterial,
	PlaneGeometry,
	Vector3
} from "three"

export type Orientation = "North" | "South" | "East" | "West" | "Up" | "Down"

export const DEG_RAD = Math.PI / 180
export const FACE_ORIENTATION = [
	{
		orientation: "North",
		position: new Vector3(0, 0, 0.5),
		rotation: new Vector3(0, 0, 0)
	},
	{
		orientation: "Down",
		position: new Vector3(0, -0.5, 0),
		rotation: new Vector3(90 * DEG_RAD, 0, 0)
	},
	{
		orientation: "Up",
		position: new Vector3(0, 0.5, 0),
		rotation: new Vector3(-90 * DEG_RAD, 0, 0)
	},
	{
		orientation: "East",
		position: new Vector3(0.5, 0, 0),
		rotation: new Vector3(0, 90 * DEG_RAD, 0)
	},
	{
		orientation: "West",
		position: new Vector3(-0.5, 0, 0),
		rotation: new Vector3(0, -90 * DEG_RAD, 0)
	},
	{
		orientation: "South",
		position: new Vector3(0, 0, -0.5),
		rotation: new Vector3(0, 180 * DEG_RAD, 0)
	}
]

export default class Face {
	material: MeshLambertMaterial
	orientation: Orientation
	geometry: PlaneGeometry
	instancedMesh: InstancedMesh | undefined
	instaceIndex: number = 0

	constructor(color: Color, orientation: Orientation, instancesCount: number) {
		this.material = new MeshLambertMaterial({ color })

		this.orientation = orientation

		const orientationFace = FACE_ORIENTATION.find(
			(x) => x.orientation === orientation
		)

		this.geometry = new PlaneGeometry()
		this.geometry.rotateX(orientationFace!.rotation.x)
		this.geometry.rotateY(orientationFace!.rotation.y)
		this.geometry.rotateZ(orientationFace!.rotation.z)
		this.geometry.translate(
			orientationFace!.position.x,
			orientationFace!.position.y,
			orientationFace!.position.z
		)

		this.instancedMesh = new InstancedMesh(
			this.geometry,
			this.material,
			instancesCount
		)
	}
}
