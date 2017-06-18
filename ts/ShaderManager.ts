import * as THREE from 'THREE'

// <script src='node_modules/three/examples/js/postprocessing/EffectComposer.js'></script>
// <script src='node_modules/three/examples/js/postprocessing/RenderPass.js'></script>
// <script src='node_modules/three/examples/js/postprocessing/ShaderPass.js'></script>
// <script src='node_modules/three/examples/js/postprocessing/MaskPass.js'></script> 
// <script src='node_modules/three/examples/js/shaders/CopyShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/BleachBypassShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/BrightnessContrastShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/ColorifyShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/DotScreenShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/EdgeShader2.js'></script> 
// <script src='node_modules/three/examples/js/shaders/KaleidoShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/MirrorShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/SepiaShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/VignetteShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/FilmShader.js'></script>
// <script src='node_modules/three/examples/js/shaders/RGBShiftShader.js'></script> 

import "imports-loader?THREE=THREE!exports-loader?THREE.EffectComposer!../node_modules/three/examples/js/postprocessing/EffectComposer"
import "imports-loader?THREE=THREE!exports-loader?THREE.RenderPass!../node_modules/three/examples/js/postprocessing/RenderPass"
import "imports-loader?THREE=THREE!exports-loader?THREE.ShaderPass!../node_modules/three/examples/js/postprocessing/ShaderPass"
import "imports-loader?THREE=THREE!exports-loader?THREE.MaskPass!../node_modules/three/examples/js/postprocessing/MaskPass"
import "imports-loader?THREE=THREE!exports-loader?THREE.CopyShader!../node_modules/three/examples/js/shaders/CopyShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.BleachBypassShader!../node_modules/three/examples/js/shaders/BleachBypassShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.BrightnessContrastShader!../node_modules/three/examples/js/shaders/BrightnessContrastShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.ColorifyShader!../node_modules/three/examples/js/shaders/ColorifyShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.DotScreenShader!../node_modules/three/examples/js/shaders/DotScreenShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.EdgeShader2!../node_modules/three/examples/js/shaders/EdgeShader2"
import "imports-loader?THREE=THREE!exports-loader?THREE.KaleidoShader!../node_modules/three/examples/js/shaders/KaleidoShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.MirrorShader!../node_modules/three/examples/js/shaders/MirrorShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.SepiaShader!../node_modules/three/examples/js/shaders/SepiaShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.VignetteShader!../node_modules/three/examples/js/shaders/VignetteShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.FilmShader!../node_modules/three/examples/js/shaders/FilmShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.RGBShiftShader!../node_modules/three/examples/js/shaders/RGBShiftShader"
import "imports-loader?THREE=THREE!exports-loader?THREE.HueSaturationShader!../node_modules/three/examples/js/shaders/HueSaturationShader"

import { GUI } from "./GUI"
import { Renderer } from "./Renderer"
import { PixelateShader } from "./Shaders/Pixelate"
import { BadTVShader } from "./Shaders/BadTV"
import { StaticShader } from "./Shaders/Static"
import { FilmShader } from "./Shaders/Film"
import { DotMatrix } from "./Shaders/DotMatrix"

export class ShaderManager {

	shaderParameters: any = {
		badTV: {
			name: 'Bad TV',
			shader: BadTVShader,
			on: true,
			time: true,
			parameters: {
				distortion: {
					name: 'Thick distrotion',
					value: 3.0,
					min: 0.1,
					max: 20,
					randomMin: 0.1,
					randomMax: 3,
					step: 0.1
				},
				distortion2: {
					name: 'Fine distrotion',
					value: 1.0,
					min: 0.1,
					max: 20,
					randomMin: 0.1,
					randomMax: 7,
					step: 0.1
				},
				speed: {
					name: 'Distrotion speed',
					value: 0.3,
					min: 0,
					max: 1,
					randomMin: 0,
					randomMax: 4,
					step: 0.01
				},
				rollSpeed: {
					name: 'Roll speed',
					value: 0.1,
					min: 0,
					max: 1,
					randomMin: 0,
					randomMax: 0.2,
					step: 0.01
				}
			}
		},
		static: {
			name: 'Static',
			shader: StaticShader,
			on: true,
			time: true,
			parameters: {
				amount: {
					name: 'Amount',
					value: 0.5,
					min: 0,
					max: 1,
					randomMin: 0,
					randomMax: 0.2,
					step: 0.01
				},
				size: {
					name: 'Size',
					value: 4,
					min: 1,
					max: 100,
					randomMin: 1,
					randomMax: 20,
					step: 1
				}
			}
		},
		rgbShift: {
			name: 'RGB Shift',
			shader: THREE.RGBShiftShader,
			on: true,
			parameters: {
				amount: {
					name: 'Amount',
					value: 0.005,
					min: 0,
					max: 0.1,
					randomMin: 0,
					randomMax: 0.03,
					step: 0.01
				},
				angle: {
					name: 'Angle',
					value: 180,
					min: 0,
					max: 360,
					step: 1,
					getValue: (value: number)=> 2 * Math.PI * value / 360
				}
			}
		},
		scanLine: {
			name: 'Scanlines',
			shader: FilmShader,
			on: true,
			time: true,
			parameters: {
				sCount: {
					name: 'Count',
					value: 800,
					min: 50,
					max: 10000,
					step: 1
				},
				sIntensity: {
					name: 'S intensity',
					value: 0.9,
					min: 0,
					max: 2,
					step: 0.1
				},
				nIntensity: {
					name: 'N intensity',
					value: 0.4,
					min: 0,
					max: 2,
					step: 0.1
				}
			}
		},
		bleach: {
			name: 'Bleach',
			shader: (<any>THREE).BleachBypassShader,
			on: false,
			parameters: {
				opacity: {
					name: 'Opacity',
					value: 1,
					min: 0,
					max: 10,
					randomMin: 0,
					randomMax: 1.7,
					step: 0.1
				}
			}
		},
		brightnessContrast: {
			name: 'Brightness & Contrast',
			shader: (<any>THREE).BrightnessContrastShader,
			on: false,
			parameters: {
				brightness: {
					name: 'Brightness',
					value: 0.25,
					min: 0,
					max: 1,
					randomMin: 0,
					randomMax: 0.2,
					step: 0.01
				},
				contrast: {
					name: 'Contrast',
					value: 0.7,
					min: 0,
					max: 1,
					step: 0.01
				}
			}
		},
		colorify: {
			name: 'Colorify',
			shader: (<any>THREE).ColorifyShader,
			on: false,
			parameters: {
				color: {
					name: 'Color',
					type: 'color',
					value: '#FFEE44'
				}
			}
		},
		dotScreen: {
			name: 'Dot Screen',
			shader: (<any>THREE).DotScreenShader,
			on: false,
			parameters: {
				tSize: {
					name: 'Size',
					value: 256,
					min: 2,
					max: 1024,
					randomMin: 256,
					randomMax: 512,
					step: 1,
					getValue: (value: number)=> new THREE.Vector2(value, value)
				},
				angle: {
					name: 'Angle',
					value: 180,
					min: 0,
					max: 360,
					step: 1,
					getValue: (value: number)=> 2 * Math.PI * value / 360
				},
				scale: {
					name: 'Scale',
					value: 1,
					min: 0.1,
					max: 10,
					randomMin: 1,
					randomMax: 1,
					step: 0.01
				}
			}
		},
		dotMatrix: {
			name: 'Dot Matrix',
			shader: DotMatrix,
			on: false,
			parameters: {
				sharpness: {
					name: 'Sharpness',
					value: 0.7,
					min: 0,
					max: 1,
					step: 0.01
				},
				gridSize: {
					name: 'Grid Size',
					value: 10,
					min: 0,
					max: 200,
					randomMin: 50,
					randomMax: 200,
					step: 1
				},
				dotSize: {
					name: 'Dot Size',
					value: 0.1,
					min: 0,
					max: 1,
					randomMin: 0,
					randomMax: 0.5,
					step: 0.1
				}
			}
		},
		edgeShader: {
			name: 'Edge',
			shader: (<any>THREE).EdgeShader2,
			on: false,
			parameters: {
				aspect: {
					name: 'Aspect',
					value: 512,
					min: 2,
					max: 1024,
					randomMin: 300,
					randomMax: 512,
					step: 1,
					getValue: (value: number)=> new THREE.Vector2(value, value)
				}
			}
		},
		// verticalTiltShift: {
		// 	name: 'Tilt Shift',
		// 	shader: (<any>THREE).VerticalTiltShiftShader,
		// 	on: false,
		// 	parameters: {
		// 		v: {
		// 			name: 'Amount',
		// 			value: 1 / 512,
		// 			min: 2,
		// 			max: 1024,
		// 			step: 1
		// 		},
		// 		r: {
		// 			name: 'position',
		// 			value: 0.5,
		// 			min: 0,
		// 			max: 1,
		// 			step: 0.01
		// 		}
		// 	}
		// },
		hueSaturation: {
			name: 'Hue & Saturation',
			shader: (<any>THREE).HueSaturationShader,
			on: false,
			parameters: {
				hue: {
					name: 'Hue',
					value: 0,
					min: -1,
					max: 1,
					step: 0.01
				},
				saturation: {
					name: 'Saturation',
					value: 0,
					min: -1,
					max: 1,
					step: 0.01
				}
			}
		},
		kaleido: {
			name: 'Kaleido',
			shader: (<any>THREE).KaleidoShader,
			on: false,
			parameters: {
				sides: {
					name: 'Sides',
					value: 6,
					min: 1,
					max: 12,
					step: 1
				},
				angle: {
					name: 'Angle',
					value: 180,
					min: 0,
					max: 360,
					step: 1,
					getValue: (value: number)=> 2 * Math.PI * value / 360
				}
			}
		},
		mirror: {
			name: 'Mirror',
			shader: (<any>THREE).MirrorShader,
			on: false,
			parameters: {
				side: {
					name: 'Side',
					value: 1,
					min: 0,
					max: 3,
					step: 1
				}
			}
		},
		sepiaShader: {
			name: 'Sepia',
			shader: (<any>THREE).SepiaShader,
			on: false,
			parameters: {
				amount: {
					name: 'Amount',
					value: 1,
					min: 0,
					max: 1,
					step: 0.01
				}
			}
		},
		vignetteShader: {
			name: 'Vignette',
			shader: (<any>THREE).VignetteShader,
			on: false,
			parameters: {
				offset: {
					name: 'Offset',
					value: 1,
					min: 0,
					max: 1,
					step: 0.01
				},
				darkness: {
					name: 'Darkness',
					value: 1,
					min: 0,
					max: 2,
					step: 0.01
				}
			}
		}
	}
	shaderChangedTimeout:number = null
	pause = false

	shaders = new Array<{pass: THREE.ShaderPass, object: any, folder: GUI}>()

	composer: THREE.EffectComposer
	shaderTime = 0
	renderPass: THREE.RenderPass
	copyPass: THREE.ShaderPass

	camera: THREE.OrthographicCamera
	scene: THREE.Scene
	renderer: THREE.WebGLRenderer

	folder: GUI
	clipboard: any

	constructor(gui: GUI, camera: THREE.OrthographicCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
		this.camera = camera
		this.scene = scene
		this.renderer = renderer

		this.renderPass = new THREE.RenderPass( scene, camera )

		let onParamsChange = ()=> this.onParamsChange()
		let onToggleShaders = ()=> this.onToggleShaders()

		this.folder = gui.addFolder('Effects')
		this.folder.open()

		this.folder.addButton('Randomize	 (R)', ()=> this.randomizeParams())
		this.folder.addButton('Deactivate all	 (D)', ()=> this.deactivateAll())
		this.folder.addButton('Copy effects 	(Ctrl + C)', ()=> this.copyEffects())
		this.folder.addButton('Past effects 	(Ctrl + V)', ()=> this.pastEffects())

		for(let shaderName in this.shaderParameters) {
			let shaderObject = this.shaderParameters[shaderName]
			
			let folder = this.folder.addFolder(shaderObject.name)
			this.shaders.push({pass: new THREE.ShaderPass(shaderObject.shader), object: shaderObject, folder: folder})
			
			folder.add(shaderObject, 'on').name('On').onChange(onToggleShaders)
			for(let propertyName in shaderObject.parameters) {
				let propertiesObject = shaderObject.parameters[propertyName]
				if(propertiesObject.type != null && propertiesObject.type == 'color') {
					folder.addColor(propertiesObject, 'value').onChange(onParamsChange)
				} else {
					folder.add(propertiesObject, 'value', propertiesObject.min, propertiesObject.max).step(propertiesObject.step).setName(propertiesObject.name).onChange(onParamsChange)
				}
			}
			folder.open()
		}

		this.copyPass = new THREE.ShaderPass( THREE.CopyShader )

		this.onParamsChange(false)
		this.onToggleShaders()
	}

	deactivateAll() {

		for(let shader of this.shaders) {
			shader.object.on = false
			shader.folder.getControllers()[0].updateDisplay()
			shader.folder.close()
		}

		this.onToggleShaders()
	}

	onToggleShaders(dispatchEvent: boolean=true) {
		//Add Shader Passes to Composer
		//order is important 
		this.composer = new THREE.EffectComposer(this.renderer)
		this.composer.addPass( this.renderPass )
		
		for(let shader of this.shaders) {
			if(shader.object.on) {
				this.composer.addPass(shader.pass)
			}
		}

		this.composer.addPass( this.copyPass )
		this.copyPass.renderToScreen = true
		
		if(dispatchEvent) {
			this.dispatchChange()
		}
	}

	dispatchChange() {
		if(this.shaderChangedTimeout != null) {
			clearTimeout(this.shaderChangedTimeout)
		}
		this.shaderChangedTimeout = setTimeout(()=>document.dispatchEvent(new Event('shaderChanged')), 250)	
	}
	
	onParamsChange(dispatchEvent: boolean=true) {

		for(let shader of this.shaders) {
			for(let propertyName in shader.object.parameters) {
				let propertiesObject = shader.object.parameters[propertyName]
				shader.pass.uniforms[propertyName].value = propertiesObject.getValue != null ? 
					propertiesObject.getValue(propertiesObject.value) : 
					propertiesObject.type != null && propertiesObject.type == 'color' ?
						new THREE.Color(propertiesObject.value) : propertiesObject.value
			}
		}

		if(dispatchEvent) {
			this.dispatchChange()
		}
	}

	getRandomOnInterval(min: number, max: number) {
		return min+(max-min)*Math.random()
	}

	getRandomColor() {
		return '#'+Math.random().toString(16).substr(2,6)
	}

	randomizeParams() {
		let shaderIndices = []
		let nShadersToPick = 3
		for(let i=0 ; i<nShadersToPick ; i++) {
			let shaderIndex = Math.floor(Math.random()*this.shaders.length)
			shaderIndices.push(shaderIndex)
		}

		let i = 0
		for(let shader of this.shaders) {
			shader.object.on = shaderIndices.indexOf(i) >= 0 && shader.object.name != 'Kaleido'
			if(shader.object.on) {
				shader.folder.open()
			} else {
				shader.folder.close()
			}
			for(let propertyName in shader.object.parameters) {
				let propertiesObject = shader.object.parameters[propertyName]
				propertiesObject.value = propertiesObject.type == 'color' ? 
					this.getRandomColor() :  
					this.getRandomOnInterval(propertiesObject.randomMin != null ? Math.max(propertiesObject.randomMin, propertiesObject.min) : propertiesObject.min, 
											 propertiesObject.randomMax != null ? Math.min(propertiesObject.randomMax, propertiesObject.max) : propertiesObject.max)
			}
			for(let controller of shader.folder.getControllers()) {
				controller.updateDisplay()
			}
			i++
		}

		this.onToggleShaders(false)
		this.onParamsChange()
	}

	getShaderParameters(): any {
		let json: any = {}
		for(let shader of this.shaders) {
			let parameters: any = {}
			for(let propertyName in shader.object.parameters) {
				let propertiesObject: any = shader.object.parameters[propertyName]
				parameters[propertyName] = propertiesObject.value
			}
			json[shader.object.name] = { parameters: parameters, on: shader.object.on, time: this.shaderTime }
		}
		return json
	}

	setShaderParameters(json: any) {
		for(let shader of this.shaders) {
			let parameters = json[shader.object.name].parameters
			let on = json[shader.object.name].on
			shader.object.on = on
			if(on) {
				shader.folder.open()
			} else {
				shader.folder.close()
			}
			for(let propertyName in shader.object.parameters) {
				shader.object.parameters[propertyName].value = parameters[propertyName]
			}
			this.shaderTime = json[shader.object.name].time
			for(let controller of shader.folder.getControllers()) {
				controller.updateDisplay()
			}
		}
		this.onToggleShaders(false)
		this.onParamsChange(false)
	}

	copyEffects() {
		this.clipboard = this.getShaderParameters()
	}

	pastEffects() {
		this.setShaderParameters(this.clipboard)
		this.dispatchChange()
	}

	animate() {
		if(!this.pause) {
			this.shaderTime += 0.1
		}
		
		for(let shader of this.shaders) {
			if(shader.object.time) {
				shader.pass.uniforms['time'].value = this.shaderTime
			}
		}
		
		this.composer.render(0.1)
	}
}