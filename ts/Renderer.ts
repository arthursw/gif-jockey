import * as _THREE from 'THREE'
declare var THREE: typeof _THREE

import { Webcam } from "./Webcam"
import { ShaderManager } from "./ShaderManager"
import { GUI } from "./GUI"

export class Renderer {
	camera: THREE.OrthographicCamera
	scene: THREE.Scene
	renderer: THREE.WebGLRenderer
	shaderManager: ShaderManager

	texture: THREE.Texture
	// material: THREE.ShaderMaterial
	material: THREE.MeshBasicMaterial
	mesh: THREE.Mesh

	webcam: Webcam

	constructor(webcam: Webcam, gui: GUI) {
		this.webcam = webcam
		let width = webcam.width
		let height = webcam.height
		this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 )
		this.scene = new THREE.Scene()

		this.renderer = new THREE.WebGLRenderer( { antialias: true } )
		this.renderer.setSize( this.webcam.width, this.webcam.height )

		let container = document.getElementById( 'camera' )
		container.appendChild( this.renderer.domElement )


		this.texture = new THREE.Texture( webcam.video )
		// this.material = new THREE.MeshBasicMaterial( (<any>{ map: this.texture, overdraw: true } ))
		this.material = new THREE.MeshBasicMaterial( (<any>{ map: this.texture } ))
		// this.material = new THREE.ShaderMaterial(PixelateShader)
		// this.material.uniforms.tDiffuse = { value: this.texture }

		this.texture.minFilter = THREE.LinearFilter
		this.texture.magFilter = THREE.LinearFilter

		let geometry = new THREE.PlaneGeometry(webcam.width, webcam.height)
		this.mesh = new THREE.Mesh(geometry, this.material)

		this.scene.add(this.mesh)
		
		this.camera.position.z = 5
		window.addEventListener( 'resize', ()=> this.windowResize(), false )

		this.shaderManager = new ShaderManager(gui, this.camera, this.scene, this.renderer)

		requestAnimationFrame(()=>this.render())
	}
	
	getDomElement(): any {
		return this.renderer.domElement
	}

	windowResize(){

		// let width = this.webcam.width
		// let height = this.webcam.height
		// this.camera.left = width / -2
		// this.camera.right = width / 2
		// this.camera.top = height / -2
		// this.camera.bottom = height / 2
		
		// this.camera.updateProjectionMatrix()
		// this.camera.position.z = 5

		this.renderer.setSize( this.webcam.width, this.webcam.height )
	}

	render() {
  		requestAnimationFrame(()=>this.render())
		if (this.webcam.streaming) {
			this.texture.needsUpdate = true
		}
		this.shaderManager.animate()
		// this.renderer.render( this.scene, this.camera )
	}
}