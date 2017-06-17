import { GUI, Controller } from "./GUI"

declare var fx: any

declare type GifJockey = {
	setFilteredImage: (imageJ: any, resultJ:any)=>void
}

class Nub {
	size: number = 10
	position: {x: number, y: number}
	divJ: any

	constructor(name: string, x: number, y: number, relative: boolean, onChange: ()=>void) {
		let parentJ = $('#effect')
		let parent = parentJ[0]

		parentJ.css({width: parentJ.innerWidth(), height: parentJ.innerHeight()})
		this.position = { x: relative ? x * parentJ.innerWidth() : x, y: relative ? y * parentJ.innerHeight() : y }
		let divJ: any = $('<div class="nub">')
		
		divJ.css({top: this.position.y - this.size / 2, left: this.position.x - this.size / 2, position:'absolute'})

		$(parent).append(divJ)
		divJ.draggable({
			containement: parent,
			drag: ( event: Event, ui: any )=> {
				ui.position.left = Math.max(-this.size / 2, Math.min(parentJ.innerWidth() - this.size / 2, ui.position.left ));
				ui.position.top = Math.max(-this.size / 2, Math.min(parentJ.innerHeight() - this.size / 2, ui.position.top ));
				this.position.x = ui.position.left + this.size / 2
				this.position.y = ui.position.top + this.size / 2
				onChange()
			}
		})
		this.divJ = divJ
	}

	remove() {
		this.divJ.remove()
	}
}

class Filter {
	static filterManager: FilterManager

	name: string
	functionName: string

	parameters: Array<{ name: string, type: string }>
	sliders: Map<string, {
			name: string,
			label: string,
			min: number,
			max: number,
			value: number,
			step: number
		}>
	nubs: Map<string, {
			name: string,
			x: number,
			y: number
		}>

	sliderControllers: Map<string, Controller>
	nubControllers: Map<string, Nub>

	constructor(name: string, functionName: string, gui:()=> void, code:()=>void, fileName:string=null) {
		this.name = name
		this.functionName = functionName
		
		this.parameters = []
		this.sliders = new Map()
		this.nubs =  new Map()
		this.sliderControllers = new Map()
		this.nubControllers = new Map()

		gui.apply(this)
	}

	addSlider(name: string, label: string, min: number, max: number, value: number, step: number) {
		this.parameters.push({name: name, type: 'slider'})
		this.sliders.set(name, {
			name: name,
			label: label,
			min: min,
			max: max,
			value: value,
			step: step
		})
	}

	addNub(name: string, x: number, y: number) {
		this.parameters.push({name: name, type: 'nub'})
		this.nubs.set(name, {
			name: name,
			x: x,
			y: y
		})
	}

	setCode(code: string) {
		
	}

	apply(args:any[]=null) {
		let canvas = Filter.filterManager.canvas
		let imageJ = Filter.filterManager.currentImageJ
		if(imageJ == null) {
			return
		}
		let texture = canvas.texture(imageJ[0])
		if(args == null) {
			args = []
			for(let parameter of this.parameters) {
				if(parameter.type == 'slider') {
					args.push(this.sliderControllers.get(parameter.name).getValue())
				} else {
					args.push(this.nubControllers.get(parameter.name).position.x)
					args.push(this.nubControllers.get(parameter.name).position.y)
				}
			}
		}
		canvas.draw(texture)

		canvas[this.functionName].apply(canvas, args)
		canvas.update()
		let result = new Image()
		result.src = canvas.toDataURL()
		result.className = 'filtered'
		let resultJ = $(result)
		let imageName = imageJ.attr('data-name')
		resultJ.attr('data-name', imageName)

		let filterJSON = { name: this.name, args: args }
		resultJ.attr('data-filter', JSON.stringify(filterJSON))

		Filter.filterManager.gifJockey.setFilteredImage(imageJ, resultJ)
	}

	activate(args:any[]=null) {
		Filter.filterManager.currentFilter = this

		let argNameToValue = new Map<string, any>()
		if(args != null) {
			let i=0
			for(let parameter of this.parameters) {
				if(parameter.type == 'slider') {
					argNameToValue.set(parameter.name, args[i])
				}
				else if(parameter.type == 'nub') {
					argNameToValue.set(parameter.name, { x: args[i], y: args[i+1] })
					i++
				}
				i++
			}
		}

		for(let [sliderName, slider] of this.sliders) {
			let value = args != null ? argNameToValue.get(sliderName) : slider.value
			this.sliderControllers.set(sliderName, Filter.filterManager.gui.addSlider(slider.name, value, slider.min, slider.max, slider.step).onChange(()=>this.apply()))
		}

		for(let [nubName, nub] of this.nubs) {
			let position = args != null ? argNameToValue.get(nubName) : nub
			let relative = args == null
			this.nubControllers.set(nubName, new Nub(nub.name, position.x, position.y, relative, ()=>this.apply()))
		}
		
	}

	deativate() {
		for(let [sliderName, slider] of this.sliderControllers) {
			slider.remove()
		}

		for(let [nubName, nub] of this.nubControllers) {
			nub.remove()
		}
	}
}

let perspectiveNubs = [175, 156, 496, 55, 161, 279, 504, 330]

let filters: any = {
    'Adjust': [
        new Filter('Brightness / Contrast', 'brightnessContrast', function() {
            this.addSlider('brightness', 'Brightness', -1, 1, 0, 0.01);
            this.addSlider('contrast', 'Contrast', -1, 1, 0, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).brightnessContrast(' + this.brightness + ', ' + this.contrast + ').update();');
        }),
        new Filter('Hue / Saturation', 'hueSaturation', function() {
            this.addSlider('hue', 'Hue', -1, 1, 0, 0.01);
            this.addSlider('saturation', 'Saturation', -1, 1, 0, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).hueSaturation(' + this.hue + ', ' + this.saturation + ').update();');
        }),
        new Filter('Vibrance', 'vibrance', function() {
            this.addSlider('amount', 'Amount', -1, 1, 0.5, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).vibrance(' + this.amount + ').update();');
        }),
        new Filter('Denoise', 'denoise', function() {
            this.addSlider('exponent', 'Exponent', 0, 50, 20, 1);
        }, function() {
            this.setCode('canvas.draw(texture).denoise(' + this.exponent + ').update();');
        }),
        new Filter('Unsharp Mask', 'unsharpMask', function() {
            this.addSlider('radius', 'Radius', 0, 200, 20, 1);
            this.addSlider('strength', 'Strength', 0, 5, 2, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).unsharpMask(' + this.radius + ', ' + this.strength + ').update();');
        }),
        new Filter('Noise', 'noise', function() {
            this.addSlider('amount', 'Amount', 0, 1, 0.5, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).noise(' + this.amount + ').update();');
        }),
        new Filter('Sepia', 'sepia', function() {
            this.addSlider('amount', 'Amount', 0, 1, 1, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).sepia(' + this.amount + ').update();');
        }),
        new Filter('Vignette', 'vignette', function() {
            this.addSlider('size', 'Size', 0, 1, 0.5, 0.01);
            this.addSlider('amount', 'Amount', 0, 1, 0.5, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).vignette(' + this.size + ', ' + this.amount + ').update();');
        })
    ],
    'Blur': [
        new Filter('Zoom Blur', 'zoomBlur', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('strength', 'Strength', 0, 1, 0.3, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).zoomBlur(' + this.center.x + ', ' + this.center.y + ', ' + this.strength + ').update();');
        }),
        new Filter('Triangle Blur', 'triangleBlur', function() {
            this.addSlider('radius', 'Radius', 0, 200, 50, 1);
        }, function() {
            this.setCode('canvas.draw(texture).triangleBlur(' + this.radius + ').update();');
        }),
        new Filter('Tilt Shift', 'tiltShift', function() {
            this.addNub('start', 0.15, 0.75);
            this.addNub('end', 0.75, 0.6);
            this.addSlider('blurRadius', 'Blur Radius', 0, 50, 15, 1);
            this.addSlider('gradientRadius', 'Gradient Radius', 0, 400, 200, 1);
        }, function() {
            this.setCode('canvas.draw(texture).tiltShift(' + this.start.x + ', ' + this.start.y + ', ' + this.end.x + ', ' + this.end.y + ', ' + this.blurRadius + ', ' + this.gradientRadius + ').update();');
        }),
        new Filter('Lens Blur', 'lensBlur', function() {
            this.addSlider('radius', 'Radius', 0, 50, 10, 1);
            this.addSlider('brightness', 'Brightness', -1, 1, 0.75, 0.01);
            this.addSlider('angle', 'Angle', -Math.PI, Math.PI, 0, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).lensBlur(' + this.radius + ', ' + this.brightness + ', ' + this.angle + ').update();');
        }, 'lighthouse.jpg')
    ],
    'Warp': [
        new Filter('Swirl', 'swirl', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('radius', 'Radius', 0, 600, 200, 1);
            this.addSlider('angle', 'Angle', -25, 25, 3, 0.1);
        }, function() {
            this.setCode('canvas.draw(texture).swirl(' + this.center.x + ', ' + this.center.y + ', ' + this.radius + ', ' + this.angle + ').update();');
        }),
        new Filter('Bulge / Pinch', 'bulgePinch', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('radius', 'Radius', 0, 600, 200, 1);
            this.addSlider('strength', 'Strength', -1, 1, 0.5, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).bulgePinch(' + this.center.x + ', ' + this.center.y + ', ' + this.radius + ', ' + this.strength + ').update();');
        })
        // ,
        // new Filter('Perspective', 'perspective', function() {
        //     var w = 640, h = 425;
        //     this.addNub('a', perspectiveNubs[0] / w, perspectiveNubs[1] / h);
        //     this.addNub('b', perspectiveNubs[2] / w, perspectiveNubs[3] / h);
        //     this.addNub('c', perspectiveNubs[4] / w, perspectiveNubs[5] / h);
        //     this.addNub('d', perspectiveNubs[6] / w, perspectiveNubs[7] / h);
        // }, function() {
        //     var before = perspectiveNubs;
        //     var after = [this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y, this.d.x, this.d.y];
        //     this.setCode('canvas.draw(texture).perspective([' + before + '], [' + after + ']).update();');
        // }, 'perspective.jpg')
    ],
    'Fun': [
        new Filter('Ink', 'ink', function() {
            this.addSlider('strength', 'Strength', 0, 1, 0.25, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).ink(' + this.strength + ').update();');
        }),
        new Filter('Edge Work', 'edgeWork', function() {
            this.addSlider('radius', 'Radius', 0, 200, 10, 1);
        }, function() {
            this.setCode('canvas.draw(texture).edgeWork(' + this.radius + ').update();');
        }),
        new Filter('Hexagonal Pixelate', 'hexagonalPixelate', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('scale', 'Scale', 10, 100, 20, 1);
        }, function() {
            this.setCode('canvas.draw(texture).hexagonalPixelate(' + this.center.x + ', ' + this.center.y + ', ' + this.scale + ').update();');
        }),
        new Filter('Dot Screen', 'dotScreen', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', 0, Math.PI / 2, 1.1, 0.01);
            this.addSlider('size', 'Size', 3, 20, 3, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).dotScreen(' + this.center.x + ', ' + this.center.y + ', ' + this.angle + ', ' + this.size + ').update();');
        }),
        new Filter('Color Halftone', 'colorHalftone', function() {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', 0, Math.PI / 2, 0.25, 0.01);
            this.addSlider('size', 'Size', 3, 20, 4, 0.01);
        }, function() {
            this.setCode('canvas.draw(texture).colorHalftone(' + this.center.x + ', ' + this.center.y + ', ' + this.angle + ', ' + this.size + ').update();');
        })
    ]
}

export class FilterManager {
	gui: GUI
	canvas: any
	currentFilter: Filter
	currentImageJ: any
	nameToFilter: Map<string, Filter>
	filterSelect: Controller
	gifJockey: GifJockey

	constructor(gifJockey: GifJockey) {
		this.gifJockey = gifJockey
		Filter.filterManager = this
		this.nameToFilter = new Map()
		this.initialize()
	}

	activateFilter(name: string, updateSelect:boolean=true, args: any[]=null) {
		if(updateSelect) {
			this.filterSelect.setValueNoCallback(name)
		}
		if(this.currentFilter != null) {
			this.currentFilter.deativate()
		}
		this.currentFilter = this.nameToFilter.get(name)
		this.currentFilter.activate(args)
	}

	initialize() {

		try {
			this.canvas = fx.canvas()
		} catch (e) {
			alert(e)
			return
		}
		$('#effect').append(this.canvas)

		this.gui = new GUI({ autoPlace: false, width: '100%' })
		document.getElementById('gui').appendChild(this.gui.getDomElement())

		let filterNames: Array<string> = []
		for(let filterCategory in filters) {
			for(let filter of filters[filterCategory]) {
				this.nameToFilter.set(filter.name, filter)
				filterNames.push(filter.name)
			}
		}
		let defaultFilter = 'Hue / Saturation'
		this.filterSelect = this.gui.addSelect('Filter', filterNames, defaultFilter).onChange((value: string)=>{
			this.activateFilter(value)
			this.currentFilter.apply()
		})
		this.activateFilter(defaultFilter)
	}

	filterLoadedImage(args: any[]) {
		let image = this.currentImageJ[0]
		let texture = this.canvas.texture(image)
		if(texture._.width == null || texture._.width == 0 && texture._.height == null || texture._.height == 0) {
			console.log("texture not loaded");
			return
		}
		this.canvas.draw(texture)

		if(this.currentFilter != null) {
			this.currentFilter.apply(args)
		}
	}

	filterImage(fromImageData: boolean = false) {
		let args:any[] = null
		if(fromImageData) {
			let imageFilterData = this.currentImageJ.siblings('.filtered').attr('data-filter')
			if(imageFilterData != null && imageFilterData.length > 0) {
				let filter = JSON.parse(imageFilterData)
				args = filter.args
				this.activateFilter(filter.name, true, args)
			}
		}
		let image = this.currentImageJ[0]
		if(	image.naturalWidth != null && image.naturalHeight != null && 
			image.naturalWidth != 0 && image.naturalHeight != 0 ) {
			this.filterLoadedImage(args)
		} else {
			image.onload = () => {
				console.log("Image loaded")
				this.filterLoadedImage(args)
			}
		}
		
	}

	setImage(imgJ: any) {
		this.currentImageJ = imgJ
		this.filterImage(true)
	}
}