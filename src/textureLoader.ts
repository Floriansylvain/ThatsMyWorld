import { NearestFilter, Texture } from "three"

export default class TextureLoader {
	private image: HTMLImageElement
	private width: number
	private height: number

	constructor(
		src: string,
		width: number,
		height: number,
		callback: (textures: Texture[]) => void
	) {
		this.image = document.createElement("img")
		this.image.src = src
		this.width = width
		this.height = height

		this.image.addEventListener(
			"load",
			() => this.onImageLoaded(callback),
			false
		)
	}

	private onImageLoaded(callback: (textures: Texture[]) => void) {
		const textures = [] as Texture[]

		for (let i = 0; i < 6; i++) {
			const canvas = document.createElement("canvas")
			canvas.width = this.width
			canvas.height = this.height

			const context = canvas.getContext("2d")
			context?.drawImage(
				this.image,
				0,
				this.height * i,
				this.width,
				this.height,
				0,
				0,
				this.width,
				this.height
			)

			const texture = new Texture(canvas)
			texture.needsUpdate = true
			texture.magFilter = NearestFilter
			textures.push(texture)
		}

		callback(textures)
	}
}
