import { NearestFilter, Texture } from "three"

export default class TextureLoader {
	private image: HTMLImageElement = document.createElement("img")
	private width: number = 16
	private height: number = 16

	load(src: string, width: number, heigth: number): Promise<Texture[]> {
		return new Promise((resolve, reject) => {
			this.image = document.createElement("img")
			this.image.src = src
			this.width = width
			this.height = heigth
			this.image.addEventListener(
				"load",
				() => {
					const textures = this.onImageLoaded()
					resolve(textures)
				},
				false
			)
			this.image.addEventListener("error", (err) => reject(err), false)
		})
	}

	private onImageLoaded(): Texture[] {
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

		console.log(this.image.src + " loaded.")
		return textures
	}
}
