/// <reference path="../node_modules/@types/jquery/index.d.ts"/>

import { GUI, Controller } from "./GUI"
import { Webcam } from "./Webcam"
import { Renderer } from "./Renderer"
import { ShaderManager } from "./ShaderManager"
import { Gif, GifManager } from "./Gif"
import { BPM } from "./BPM"
// import { FilterManager } from "./Filters"

class GifJokey {
	
	imageID = 0

	gui: GUI
	viewer: Window = null

	// filterManager = new FilterManager(this)
	bpm: BPM = new BPM(this)
	gifManager = new GifManager(this)
	webcam: Webcam = null
	renderer: Renderer = null
	shaderManager: ShaderManager = null

	guiWasFocusedWhenPressedEnter = false
	showGifThumbnails = false

	constructor() {
		console.log("Gif Grave")
		
		// Webcam.set({
		// 	width: 320,
		// 	height: 240,
		// 	image_format: 'jpeg',
		// 	jpeg_quality: 90,
		// 	swfURL: './lib/webcam.swf'
		// });
		// Webcam.attach( '#camera' );
		// // $('#camera').css({margin: 'auto'})


		// $("#takeSnapshot").click(this.takeSnapshot)
		// $("#createViewer").click(this.createViewer)
		$("#camera").click(()=>this.deselectImages())
		$("#gif-thumbnails").mousedown(()=>this.deselectImages())

		let thumbnailsJ: any = $("#thumbnails")
		thumbnailsJ.sortable(({ stop: ()=> this.sortImagesStop() }))
	    thumbnailsJ.disableSelection()

		let outputsJ: any = $("#outputs")
		outputsJ.sortable(({ stop: ()=> this.gifManager.sortGifsStop() }))
	    outputsJ.disableSelection()


		$( document ).keydown((event:KeyboardEvent) => this.onKeyDown(event))
		$( '#gui' ).keydown((event:KeyboardEvent) => {
			console.log(event.keyCode)
			if(event.keyCode == 13 || event.keyCode == 27) {
				console.log('prevent key down')
				event.preventDefault()
				event.stopPropagation()
				return -1
			}
		})

	    this.createGUI()
	    this.webcam = new Webcam(()=>this.webcamLoaded())

	    this.gifManager.addGif()

	    this.toggleGifThumbnails(this.showGifThumbnails)
	}
	
	onKeyDown(event: KeyboardEvent) {
		if(event.keyCode == 32) {			// space bar
			this.takeSnapshot()
			event.preventDefault()
		} else if(event.keyCode == 13) {	// enter
			// Ignore if one of the dat.gui item is focused
			if(!this.gui.isFocused()) {
				this.bpm.tap()
			}
		} else if(event.keyCode == 27) {	// escape
			// Ignore if one of the dat.gui item is focused
			if(!this.gui.isFocused()) {
				this.bpm.stopTap()
			}
		} else if(String.fromCharCode(event.keyCode) == 'R') {
			this.shaderManager.randomizeParams()
		}
	}

	webcamLoaded() {
		this.renderer = new Renderer(this.webcam, this.gui)
		this.shaderManager = new ShaderManager(this.gui, this.renderer.camera, this.renderer.scene, this.renderer.renderer)
		this.renderer.setShaderManager(this.shaderManager)
		document.addEventListener('shaderChanged', ()=> this.updateFilteredImage())
		this.shaderManager.randomizeParams()
	}

	initialize() {
		this.animate()
	}

	createGUI() {

		this.gui = new GUI({ autoPlace: false, width: '100%' })
		document.getElementById('gui').appendChild(this.gui.getDomElement())

		this.gui.addButton('Take snapshot', ()=> this.takeSnapshot())
		this.gui.addButton('Create viewer', ()=> this.createViewer())
		this.gui.add(this, 'showGifThumbnails').name('Show Gifs').onChange((value: boolean)=> this.toggleGifThumbnails(value))

		this.bpm.createGUI(this.gui)
		this.gifManager.createGUI(this.gui)
		// onSliderChange()

		// $(gui.getDomElement()).css({ width: '100%' })
	}

	toggleGifThumbnails(show: boolean) {
		let gifThumbnailsJ = $('#gif-thumbnails')
		let visible = gifThumbnailsJ.is(':visible')
		if(show && !visible) {
			gifThumbnailsJ.show()
			document.dispatchEvent(new Event('cameraResized'))
		} else if (!show && visible) {
			gifThumbnailsJ.hide()
			document.dispatchEvent(new Event('cameraResized'))
		}
	}

	setFilteredImage(imageJ:any, resultJ:any) {

		imageJ.siblings('.filtered').remove()

		let imageName = imageJ.attr('data-name')
		resultJ.insertBefore(imageJ)

		this.gifManager.setFilteredImage(imageName, resultJ.clone())

		// if(viewer != null) {
		// 	(<any>viewer).setFilteredImage(imageJ, resultJ)
		// }
	}

	removeImage(imageAlt: string) {
		this.gifManager.removeImage(imageAlt)

		$('#thumbnails').children("[data-name='"+imageAlt+"']").remove()

		// if(viewer != null) {
		// 	(<any>viewer).removeImage(imageAlt)
		// }
		this.nextImage()
	}

	selectImage(imageName: string) {
		let imagesToSelectJ = $('#thumbnails').children("[data-name='"+imageName+"']")
		let imagesAlreadySelected = imagesToSelectJ.hasClass('gg-selected')
		$('#thumbnails').children().removeClass('gg-selected')
		
		if(imagesAlreadySelected || imagesToSelectJ.length == 0) {
			this.renderer.setContent(this.webcam.video)
			return
		}

		imagesToSelectJ.addClass('gg-selected')

		let imgJ = imagesToSelectJ.find('img.original')
		this.renderer.setContent(<any>imgJ[0])

		let filteredImageJ = imagesToSelectJ.find('img.filtered')
		if(filteredImageJ.length > 0) {
			let args = JSON.parse(filteredImageJ.attr('data-filter'))
			this.shaderManager.setShaderParameters(args)
		}

		// this.filterManager.setImage(imgJ)
	}

	deselectImages() {
		$('#thumbnails').children().removeClass('gg-selected')
		this.renderer.setContent(this.webcam.video)
		this.gifManager.deselectGif()
	}

	addImage(data_uri: string, canvas: HTMLCanvasElement=null, context: CanvasRenderingContext2D=null) {
		// display results in page
		let imageName = 'img-' + this.imageID
		let imgJ = $('<img src="' + data_uri + '" data-name="' + imageName + '" alt="img-' + this.imageID + '">')
		this.imageID++

		this.gifManager.addImage(imgJ.clone())

		let thumbnailImageJ = imgJ.clone()
		this.createThumbnail(thumbnailImageJ)

		imgJ.on('load', ()=>{
			// this.selectImage(imageName)
			this.nextImage()
		})
		// if(viewer != null) {
		// 	(<any>viewer).addImage(imgJ.clone())
		// }
		return thumbnailImageJ
	}

	createThumbnail(imgJ: any, filteredImageJ: any = null) {
		let imageName = imgJ.attr('data-name')
		let liJ = $('<li class="ui-state-default gg-thumbnail" data-name="'+imageName+'">')
		let buttonJ = $('<button type="button" class="gg-small-btn close-btn">')
		let spanJ = $('<span class="ui-icon ui-icon-closethick">')
		let divJ = $('<div class="gg-thumbnail-container">')
		buttonJ.append(spanJ)
		divJ.append(imgJ.addClass('gg-hidden original'))
		divJ.append(filteredImageJ)
		liJ.append(divJ)
		liJ.append(buttonJ)
		buttonJ.click(()=> this.removeImage(imageName) )
		liJ.mousedown((event: JQueryMouseEventObject)=>{
			setTimeout(()=>this.selectImage(imageName), 0)
			event.preventDefault()
			event.stopPropagation()
			return -1
		}) // add timeout to not to disturbe draggable
		$('#thumbnails').append(liJ)
	}

	takeSnapshot() {
		
		// let filteredDataURL = canvas.toDataURL()
		let imageDataURL = this.webcam.getImage()
		let imageJ = this.addImage(imageDataURL)

		this.updateFilteredImage(imageJ)
		// Webcam.snap((data_uri: string, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D)=>this.addImage(data_uri, canvas, context))
	}

	getSelectedImage() {
		return $('#thumbnails').children('.gg-selected').first()
	}

	updateFilteredImage(imageJ: any=null) {
		if(imageJ == null) {
			imageJ = this.getSelectedImage().find('img.original')
		}

		let filtered = this.renderer.getFilteredImage()
		let filteredImage = filtered.image
		let shaderParameters = filtered.shaderParameters

		filteredImage.className = 'filtered'
		let filteredImageJ = $(filteredImage)
		let imageName = imageJ.attr('data-name')
		filteredImageJ.attr('data-name', imageName)

		filteredImageJ.attr('data-filter', JSON.stringify(shaderParameters))

		this.setFilteredImage(imageJ, filteredImageJ)
	}

	nextImage() {
		this.gifManager.nextImage()

		if(this.viewer != null && this.viewer.hasOwnProperty('nextImage')) {
			(<any>this.viewer).nextImage()
		}
	}

	// let sortImagesStart = (event: Event, ui: any)=> {
	// 	let imageName = $(ui.item).attr('data-name')
	// 	selectImage(imageName)
	// }

	sortImagesStop() {
		let thumbnailsJ = $('#thumbnails').children()
		let imageNames: Array<string> = []
		thumbnailsJ.each(function(index: number, element: Element) {
			imageNames.push($(element).attr('data-name'))
		})

		this.gifManager.sortImages(imageNames)
	}

	createViewer() {
		let windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes"
		this.viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures)
	}

	previousIsOnBeat = false

	animate() {
		requestAnimationFrame(()=>this.animate())

		if(!this.bpm.isAutoBPM()) {
			return
		}

		let isOnBeat = this.bpm.isOnBeat()
		if(isOnBeat && !this.previousIsOnBeat) {
			this.nextImage()
		}
		this.previousIsOnBeat = isOnBeat
	}

	emptyThumbnails() {
		$('#thumbnails').empty()
		$('#thumbnails').append($('<li>').addClass('placeholder'))
	}

	setGif(gif: Gif) {
		this.emptyThumbnails()

		for(let imagePairJ of gif.getImagePairsJ()) {
			this.createThumbnail(imagePairJ.filter('.original'), imagePairJ.filter('.filtered'))
		}
		this.selectImage(gif.getFirstImageJ().attr('data-name'))
		this.nextImage()
	}

	playGif(gif: Gif) {
		if(this.viewer != null) {
			(<any>this.viewer).setGif(gif.containerJ.find('img.filtered').clone())
		}
	}
}

let gifJokey: GifJokey = null
document.addEventListener("DOMContentLoaded", function(event) { 
	gifJokey = new GifJokey()
	gifJokey.initialize()
});

