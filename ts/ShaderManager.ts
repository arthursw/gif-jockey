import * as _THREE from 'THREE'
declare var THREE: typeof _THREE

import { GUI } from "./GUI"
import { Renderer } from "./Renderer"
import { PixelateShader } from "./Shaders/Pixelate"
import { BadTVShader } from "./Shaders/BadTV"
import { StaticShader } from "./Shaders/Static"
import { FilmShader } from "./Shaders/Film"

export class ShaderManager {

	badTVParams = {
		mute:true,
		show: true,
		distortion: 3.0,
		distortion2: 1.0,
		speed: 0.3,
		rollSpeed: 0.1
	}
	staticParams = {
		show: true,
		amount:0.5,
		size:4.0
	}
	rgbParams = {
		show: true,
		amount: 0.005,
		angle: 0.0,
	}
	filmParams = {
		show: true,
		count: 800,
		sIntensity: 0.9,
		nIntensity: 0.4
	}

	composer: THREE.EffectComposer
	shaderTime = 0
	renderPass: THREE.RenderPass
	badTVPass: THREE.ShaderPass
	rgbPass: THREE.ShaderPass
	filmPass: THREE.ShaderPass
	staticPass: THREE.ShaderPass
	copyPass: THREE.ShaderPass

	camera: THREE.OrthographicCamera
	scene: THREE.Scene
	renderer: THREE.WebGLRenderer


	constructor(gui: GUI, camera: THREE.OrthographicCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
		this.camera = camera
		this.scene = scene
		this.renderer = renderer

		this.renderPass = new THREE.RenderPass( scene, camera )
		this.badTVPass = new THREE.ShaderPass( BadTVShader )
		this.rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader )
		this.filmPass = new THREE.ShaderPass( FilmShader )
		this.staticPass = new THREE.ShaderPass( StaticShader )
		this.copyPass = new THREE.ShaderPass( THREE.CopyShader )

		this.filmPass.uniforms.grayscale.value = 0

		let onParamsChange = ()=> this.onParamsChange()
		let onToggleShaders = ()=> this.onToggleShaders()

		let f1 = gui.addFolder('Bad TV')
		f1.add(this.badTVParams, 'show').onChange(onToggleShaders)
		f1.add(this.badTVParams, 'distortion', 0.1, 20).step(0.1).listen().setName('Thick Distort').onChange(onParamsChange)
		f1.add(this.badTVParams, 'distortion2', 0.1, 20).step(0.1).listen().setName('Fine Distort').onChange(onParamsChange)
		f1.add(this.badTVParams, 'speed', 0.0,1.0).step(0.01).listen().setName('Distort Speed').onChange(onParamsChange)
		f1.add(this.badTVParams, 'rollSpeed', 0.0,1.0).step(0.01).listen().setName('Roll Speed').onChange(onParamsChange)
		f1.open()
		let f2 = gui.addFolder('RGB Shift')
		f2.add(this.rgbParams, 'show').onChange(onToggleShaders)
		f2.add(this.rgbParams, 'amount', 0.0, 0.1).listen().onChange(onParamsChange)
		f2.add(this.rgbParams, 'angle', 0.0, 2.0).listen().onChange(onParamsChange)
		f2.open()
		let f4 = gui.addFolder('Static')
		f4.add(this.staticParams, 'show').onChange(onToggleShaders)
		f4.add(this.staticParams, 'amount', 0.0,1.0).step(0.01).listen().onChange(onParamsChange)
		f4.add(this.staticParams, 'size', 1.0,100.0).step(1.0).onChange(onParamsChange)
		f4.open()
		let f3 = gui.addFolder('Scanlines')
		f3.add(this.filmParams, 'show').onChange(onToggleShaders)
		f3.add(this.filmParams, 'count', 50, 1000).onChange(onParamsChange)
		f3.add(this.filmParams, 'sIntensity', 0.0, 2.0).step(0.1).onChange(onParamsChange)
		f3.add(this.filmParams, 'nIntensity', 0.0, 2.0).step(0.1).onChange(onParamsChange)
		f3.open()

		this.onParamsChange()
		this.onToggleShaders()
	}

	onToggleShaders() {
		//Add Shader Passes to Composer
		//order is important 
		this.composer = new THREE.EffectComposer(this.renderer)
		this.composer.addPass( this.renderPass )
		
		if (this.filmParams.show){
			this.composer.addPass( this.filmPass )
		}
		if (this.badTVParams.show){
			this.composer.addPass( this.badTVPass )
		}
		if (this.rgbParams.show){
			this.composer.addPass( this.rgbPass )
		}
		if (this.staticParams.show){
			this.composer.addPass( this.staticPass )
		}
		this.composer.addPass( this.copyPass )
		this.copyPass.renderToScreen = true
	}

	onParamsChange() {
		this.badTVPass.uniforms[ 'distortion' ].value = this.badTVParams.distortion
		this.badTVPass.uniforms[ 'distortion2' ].value = this.badTVParams.distortion2
		this.badTVPass.uniforms[ 'speed' ].value = this.badTVParams.speed
		this.badTVPass.uniforms[ 'rollSpeed' ].value = this.badTVParams.rollSpeed
		this.staticPass.uniforms[ 'amount' ].value = this.staticParams.amount
		this.staticPass.uniforms[ 'size' ].value = this.staticParams.size
		this.rgbPass.uniforms[ 'angle' ].value = this.rgbParams.angle * Math.PI
		this.rgbPass.uniforms[ 'amount' ].value = this.rgbParams.amount
		this.filmPass.uniforms[ 'sCount' ].value = this.filmParams.count
		this.filmPass.uniforms[ 'sIntensity' ].value = this.filmParams.sIntensity
		this.filmPass.uniforms[ 'nIntensity' ].value = this.filmParams.nIntensity
	}

	randomizeParams() {
		if (Math.random() <0.2){
			//you fixed it!
			this.badTVParams.distortion = 0.1
			this.badTVParams.distortion2 =0.1
			this.badTVParams.speed =0
			this.badTVParams.rollSpeed =0
			this.rgbParams.angle = 0
			this.rgbParams.amount = 0
			this.staticParams.amount = 0
		} else {
			this.badTVParams.distortion = Math.random() * 10 + 0.1
			this.badTVParams.distortion2 = Math.random() * 10 + 0.1
			this.badTVParams.speed = Math.random() * 0.4
			this.badTVParams.rollSpeed = Math.random() * 0.2
			this.rgbParams.angle = Math.random() * 2
			this.rgbParams.amount = Math.random() * 0.03
			this.staticParams.amount = Math.random() * 0.2
		}
		this.onParamsChange()
	}

	animate() {
		this.shaderTime += 0.1
		this.badTVPass.uniforms[ 'time' ].value =  this.shaderTime
		this.filmPass.uniforms[ 'time' ].value =  this.shaderTime
		this.staticPass.uniforms[ 'time' ].value =  this.shaderTime
		this.composer.render(0.1)
	}
}