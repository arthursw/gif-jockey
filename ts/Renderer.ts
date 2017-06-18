import * as $ from 'jquery'

import * as THREE from 'THREE'

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
		let cameraJ = $('#camera')

		this.webcam = webcam

		
		let width = webcam.width
		let height = webcam.height

		this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 )
		this.scene = new THREE.Scene()

		this.renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } )
		this.renderer.setSize( width, height )

		let size = this.computeRendererSize(webcam, cameraJ)
		// this.setCanvasSize(size.width, size.height)

		let container = document.getElementById( 'camera' )
		container.appendChild( this.renderer.domElement )

		this.displayVideo()
		
		this.camera.position.z = 5

		window.addEventListener( 'resize', ()=> this.windowResize(), false )
		document.addEventListener('cameraResized', ()=> this.windowResize())

		requestAnimationFrame(()=>this.render())
		this.centerOnRectangle(this.webcam.width, this.webcam.height)

		setTimeout(()=>this.windowResize(), 0)
	}

	resize(width: number, height: number) {
		this.camera.left = width / -2
		this.camera.right = width / 2
		this.camera.top = height / 2
		this.camera.bottom = height / -2
		this.camera.updateProjectionMatrix()
		this.renderer.setSize( width, height )
		console.log('Renderer: set size: ' + width + ', ' + height)
		this.displayVideo()
		this.windowResize()
	}

	displayVideo() {
		if(this.shaderManager != null) {
			this.shaderManager.pause = false
		}
		this.setContent(this.webcam.video)
	}

	displayImage(content: HTMLImageElement | HTMLVideoElement) {
		if(this.shaderManager != null) {
			this.shaderManager.pause = true
		}
		this.setContent(content)
	}

	setContent(content: HTMLImageElement | HTMLVideoElement) {
		console.log('Renderer: set content: ' + content.width + ', ' + content.height)
		this.texture = new THREE.Texture( content )
		this.material = new THREE.MeshBasicMaterial( (<any>{ map: this.texture } ))
		
		this.texture.minFilter = THREE.LinearFilter
		this.texture.magFilter = THREE.LinearFilter

		let geometry = new THREE.PlaneGeometry(content.width, content.height)
		if(this.mesh != null) {
			this.scene.remove(this.mesh)
		}
		this.mesh = new THREE.Mesh(geometry, this.material)

		this.scene.add(this.mesh)
	}

	setShaderManager(shaderManager: ShaderManager) {
		this.shaderManager = shaderManager
	}

	getDomElement(): HTMLCanvasElement {
		return this.renderer.domElement
	}

	getFilteredImage(): {image: HTMLImageElement, shaderParameters: any} {
		// this.shaderManager.animate()
		let canvas = this.getDomElement()
		let result = new Image()
		result.src = canvas.toDataURL()

		return { image: result, shaderParameters: this.shaderManager.getShaderParameters() }
	}

	computeRendererSize(webcam: Webcam, cameraJ: any): {width: number, height: number} {

		let cameraWidth = cameraJ.width()
		let cameraHeight = cameraJ.height()

		let cameraRatio = cameraWidth / cameraHeight
		let webcamRatio = webcam.width / webcam.height
		
		let width: number = null
		let height: number = null

		if(cameraRatio < webcamRatio) {
			width = cameraWidth
			height = cameraWidth / webcamRatio
		} else {
			width = cameraHeight * webcamRatio
			height = cameraHeight
		}

		return { width: width, height: height }
	}

	setCanvasSize(width: number, height: number) {
		$(this.renderer.domElement).css({width: '' + width + 'px', height: '' + height + 'px'})
	}

	centerOnRectangle(width: number, height: number) {
		let margin = 0
		let ratio = Math.max((width + margin) / this.renderer.getSize().width, (height + margin) / this.renderer.getSize().height)
		this.camera.zoom = 1 / ratio
		this.camera.updateProjectionMatrix()
	}
	
	windowResize(){
		let cameraJ = $('#camera')
		let size = this.computeRendererSize(this.webcam, cameraJ)
		this.setCanvasSize(size.width, size.height)
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