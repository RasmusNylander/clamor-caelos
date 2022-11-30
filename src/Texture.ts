// Written by Tobias Maneschijn 2022

export interface TextureType {
	imagePath: string;
	id: number;
	width: number;
	height: number;
}

/**
 * Work in progress class for handling textures in a more Object Oriented way
 */

export class Texture {
	public imagePath: string;

	public id: number;

	public width: number;

	public height: number;

	public static loadTexture(
		gl: WebGL2RenderingContext,
		imagePath: string
	): Promise<Texture> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => this.loadTextureFromImage(gl, image).then(resolve);
			image.src = imagePath;
		});
	}

	public static loadTextureFromImage(
		gl: WebGL2RenderingContext,
		image: HTMLImageElement
	): Promise<Texture> {
		return new Promise((resolve, reject) => {
			const texture = gl.createTexture();
			if (!texture) {
				reject(new Error("Could not create texture"));
				return;
			}
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				image
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		});
	}

	// Don't use this. Use the static load functions instead.
	constructor(parameters: TextureType) {
		this.imagePath = parameters.imagePath;
		this.id = parameters.id;
		this.width = parameters.width;
		this.height = parameters.height;
	}
}
