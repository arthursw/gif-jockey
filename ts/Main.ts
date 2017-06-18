import * as $ from 'jquery'

// import '../lib/jquery-ui-1.12.1.custom/jquery-ui'
import 'jquery-ui/ui/disable-selection'
import 'jquery-ui/ui/widgets/droppable'
import 'jquery-ui/ui/widgets/sortable'


import { GUI, Controller } from "./GUI"
import { Webcam } from "./Webcam"
import { Renderer } from "./Renderer"
import { ShaderManager } from "./ShaderManager"
import { Gif, GifManager } from "./Gif"
import { BPM } from "./BPM"
// import { FilterManager } from "./Filters"

let ctrlKey = 17
let cmdKey = 91
let vKey = 86
let cKey = 67

class GifJokey {
	
	imageID = 0

	gui: GUI
	folder: GUI
	viewer: Window = null

	// filterManager = new FilterManager(this)
	bpm: BPM = new BPM(this)
	gifManager = new GifManager(this)
	webcam: Webcam = null
	renderer: Renderer = null
	shaderManager: ShaderManager = null

	guiWasFocusedWhenPressedEnter = false
	showGifThumbnails = false
	showGIF: boolean = true
	ctrlDown = false

	constructor() {
		console.log("Gif Grave")
		
		$("#camera").click(()=>this.deselectImages())
		$("#gif-thumbnails").mousedown((event:JQueryMouseEventObject)=> {
			if(!$.contains($('#outputs')[0], event.target) && !$.contains($('#thumbnails')[0], event.target)) {
				this.deselectImages()
			}
		})

		let thumbnailsJ: any = $("#thumbnails")
		thumbnailsJ.sortable(({ stop: ()=> this.sortImagesStop() }))
	    thumbnailsJ.disableSelection()
	    $('#thumbnails-container').hide()

		let outputsJ: any = $("#outputs")
		outputsJ.sortable(({ stop: ()=> this.gifManager.sortGifsStop() }))
	    outputsJ.disableSelection()
	    outputsJ.hide()

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
		let webcamWidth = location.hash.length > 0 ? parseInt(location.hash.substring(1)) : null

	    this.createGUI(webcamWidth)

	    $('#gif-thumbnails .open-close-btn').mousedown((event:JQueryMouseEventObject)=> {
	    	let outputsJ = $('#outputs')
	    	let visible = outputsJ.is(':visible')
	    	if(visible) {
	    		outputsJ.hide()
	    		this.deselectImages()
	    		document.dispatchEvent(new Event('cameraResized'))
	    		$('#gif-thumbnails .ui-icon').removeClass('ui-icon-caret-1-w').addClass('ui-icon-caret-1-e')
	    	} else {
	    		outputsJ.show()
	    		document.dispatchEvent(new Event('cameraResized'))
	    		$('#gif-thumbnails .ui-icon').removeClass('ui-icon-caret-1-e').addClass('ui-icon-caret-1-w')
	    	}
	    })

	    $('.add-gif-btn').click(()=>this.gifManager.addGif())
	    $('.add-gif-auto-btn').click(()=>this.gifManager.createAutoGif())
	    // $('.snapshot-btn').mousedown((event: JQueryMouseEventObject)=>{
	    // 	this.deselectAndTakeSnapshot()
	    // 	event.stopPropagation()
	    // 	return -1
	    // })
	    $('.upload-image-btn input').change((e:any)=>this.uploadImage(event))
	    $('.upload-image-btn').mousedown((event: JQueryMouseEventObject)=>{
	    	$('.upload-image-btn input').click()
	    	event.stopPropagation()
	    	return -1
	    })
	    
	    
	    this.webcam = new Webcam(()=>this.webcamLoaded(), webcamWidth)

	    // this.toggleGifThumbnails(this.showGifThumbnails)

	    this.initializeClipboard()
	}

	
	initializeClipboard() {

		$(document).keydown((e)=> {
			if (e.keyCode == ctrlKey || e.keyCode == cmdKey) { 
				this.ctrlDown = true
			} else if (this.ctrlDown && e.keyCode == cKey && this.isImageSelected() && !this.gui.isFocused()) {
				this.shaderManager.copyEffects()
			} else if (this.ctrlDown && e.keyCode == vKey && this.isImageSelected() && !this.gui.isFocused()) {
				this.shaderManager.pastEffects()
			}
		}).keyup((e)=> {
			if (e.keyCode == ctrlKey || e.keyCode == cmdKey) {
				this.ctrlDown = false
			}
		})
	}

	onKeyDown(event: KeyboardEvent) {
		if(event.keyCode == 32) {			// space bar
			this.deselectAndTakeSnapshot()
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
		} else if(String.fromCharCode(event.keyCode) == 'R') {
			this.shaderManager.randomizeParams()
		} else if(String.fromCharCode(event.keyCode) == 'D') {
			this.shaderManager.deactivateAll()
		}
	}

	webcamLoaded() {
		this.renderer = new Renderer(this.webcam, this.gui)
		this.shaderManager = new ShaderManager(this.gui, this.renderer.camera, this.renderer.scene, this.renderer.renderer)
		this.renderer.setShaderManager(this.shaderManager)
		document.addEventListener('shaderChanged', ()=> {
			if(this.isImageSelected()) {
				this.updateFilteredImage()
			}
		})
		this.shaderManager.randomizeParams()
		this.gifManager.addGif()
	}

	initialize() {
		this.animate()
	}

	createGUI(webcamWidth: number) {

		this.gui = new GUI({ autoPlace: false, width: '100%' })

		document.getElementById('gui').appendChild(this.gui.getDomElement())

		this.folder = this.gui.addFolder('General')

		this.folder.addButton('Take snapshot (Spacebar)', ()=> this.deselectAndTakeSnapshot())
		// this.folder.addFileSelectorButton('Upload image', 'image/*', (event:any)=> this.uploadImage(event))
		this.folder.addButton('Create viewer', ()=> this.createViewer())

		// this.folder.add(this, 'showGifThumbnails').name('Show Gifs').onChange((value: boolean)=> this.toggleGifThumbnails(value))

		this.folder.addSlider('N images / GIF', this.gifManager.numberOfImages, 1, 10).onChange((value:number)=>this.gifManager.numberOfImages = value)
		this.folder.addSlider('Webcam width', webcamWidth, 100, 1024).onChange((value)=> {
			// this.webcam.resizeVideo(value)
			// this.renderer.resize(this.webcam.width, this.webcam.height)
			location.hash = ''+Math.round(value)
			location.reload()
		})

		this.folder.add(this, 'showGIF').name('Show GIF').onChange(()=>{$('#result').toggle()})
		this.folder.open()

		this.bpm.createGUI(this.gui)
		this.gifManager.createGUI(this.gui)
		// onSliderChange()

		// $(gui.getDomElement()).css({ width: '100%' })
	}

	// toggleGifThumbnails(show: boolean) {
	// 	let gifThumbnailsJ = $('#gif-thumbnails')
	// 	let visible = gifThumbnailsJ.is(':visible')
	// 	if(show && !visible) {
	// 		gifThumbnailsJ.show()
	// 		document.dispatchEvent(new Event('cameraResized'))
	// 	} else if (!show && visible) {
	// 		gifThumbnailsJ.hide()
	// 		document.dispatchEvent(new Event('cameraResized'))
	// 	}
	// }

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

	duplicateImage(imageName: string) {

		let imageThumbnailJ = $('#thumbnails').children("[data-name='"+imageName+"']")
		let img: HTMLImageElement = <any>imageThumbnailJ.find('img.original')[0]
		let imageJ = this.addImage(img.src)

		let filteredImageJ = imageThumbnailJ.find('img.filtered').clone()
		filteredImageJ.attr('data-name', imageJ.attr('data-name'))
		this.setFilteredImage(imageJ, filteredImageJ)

		this.nextImage()
	}

	selectImage(imageName: string) {
		let imagesToSelectJ = $('#thumbnails').children("[data-name='"+imageName+"']")
		let imagesAlreadySelected = imagesToSelectJ.hasClass('gg-selected')
		
		if(imagesAlreadySelected || imagesToSelectJ.length == 0) {
			// this.renderer.displayVideo()
			return
		}

		$('#thumbnails').children().removeClass('gg-selected')

		imagesToSelectJ.addClass('gg-selected')

		let imgJ = imagesToSelectJ.find('img.original')
		this.renderer.displayImage(<any>imgJ[0])

		let filteredImageJ = imagesToSelectJ.find('img.filtered')
		if(filteredImageJ.length > 0) {
			let args = JSON.parse(filteredImageJ.attr('data-filter'))
			this.shaderManager.setShaderParameters(args)
		}

		this.gifManager.selectImage(imageName)
		// this.filterManager.setImage(imgJ)
	}

	deselectImages() {
		$('#thumbnails').children().removeClass('gg-selected')
		if(this.renderer != null) {
			this.renderer.displayVideo()
		}
		if(this.gifManager != null) {
			this.gifManager.deselectGif()
		}
	}

	addImage(data_uri: string, callback:(imgJ:any)=>void=null) {
		// display results in page
		let imageName = 'img-' + (this.imageID++)
		let imgJ = $('<img src="' + data_uri + '" data-name="' + imageName + '" alt="' + imageName + '">')
		let img: HTMLImageElement = <any>imgJ[0]
		

		this.gifManager.addImage(imgJ.clone())

		let thumbnailImageJ = imgJ.clone()
		this.createThumbnail(thumbnailImageJ)

		imgJ.on('load', ()=>{
			// this.selectImage(imageName)

			this.nextImage()
			if(callback != null) {
				callback(imgJ)
			}
		})
		// if(viewer != null) {
		// 	(<any>viewer).addImage(imgJ.clone())
		// }
		return thumbnailImageJ
	}

	createThumbnail(imgJ: any, filteredImageJ: any = null) {
		let imageName = imgJ.attr('data-name')
		let liJ = $('<li class="ui-state-default gg-thumbnail" data-name="'+imageName+'">')
		let closeButtonJ = $('<button type="button" class="gg-small-btn close-btn">')
		let closeButtonIconJ = $('<span class="ui-icon ui-icon-closethick">')
		let duplicateButtonJ = $('<button type="button" class="gg-small-btn duplicate-btn">')
		let duplicateButtonIconJ = $('<span class="ui-icon ui-icon-plusthick">')
		let divJ = $('<div class="gg-thumbnail-container">')
		let selectionRectangleJ = $('<div class="gg-selection-rectangle">')
		closeButtonJ.append(closeButtonIconJ)
		duplicateButtonJ.append(duplicateButtonIconJ)
		divJ.append(imgJ.addClass('gg-hidden original'))
		divJ.append(filteredImageJ)
		liJ.append(selectionRectangleJ)
		liJ.append(divJ)
		liJ.append(closeButtonJ)
		liJ.append(duplicateButtonJ)

		closeButtonJ.click(()=> this.removeImage(imageName) )
		duplicateButtonJ.click(()=> this.duplicateImage(imageName) )
		liJ.mousedown((event: JQueryMouseEventObject)=>{
			setTimeout(()=>this.selectImage(imageName), 0)
		}) // add timeout to not to disturbe draggable

		$('#thumbnails').append(liJ)
	}

	takeSnapshot() {
		let sound: any = document.getElementById('shutter-sound')
		sound.currentTime = 0
		sound.play()

		$('body').css({opacity: 0})
		$('body').animate({opacity: 1}, 250)
		// $('body').addClass('flash')
		// setTimeout(()=>$('body').removeClass('flash'), 500)
		
		let imageDataURL = this.webcam.getImage()
		let imageJ = this.addImage(imageDataURL)

		this.updateFilteredImage(imageJ)
	}

	deselectAndTakeSnapshot() {
		this.deselectAndCallback(()=> this.takeSnapshot())
	}

	deselectAndCallback(callback: ()=> void, delay: number=250) {
		if(this.isImageSelected()) {
			this.deselectImages()
			setTimeout(callback, delay)
		} else {
			callback()
		}
	}

	uploadImage(event: any) {
		let files: FileList = event.dataTransfer != null ? event.dataTransfer.files : event.target.files

		for (let i = 0; i < files.length; i++) {
			let file = files.item(i)
			
			if ( /\.(jpe?g|png|gif)$/i.test(file.name) ) {
				var reader = new FileReader()

				reader.addEventListener("load", (event:any)=> {
					let img = new Image()
					img.src = event.target.result
					img.onload = ()=> {

						let canvas = document.createElement('canvas')
						let context = canvas.getContext('2d')

						let imgRatio = img.width / img.height
						let webcamRatio = this.webcam.width / this.webcam.height

						if(imgRatio < webcamRatio) {
							canvas.height = this.webcam.height
							canvas.width = this.webcam.height * imgRatio
						} else {
							canvas.width = this.webcam.width
							canvas.height = this.webcam.width / imgRatio
						}

						context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)

						let imageJ = this.addImage(canvas.toDataURL(), (imgJ: any)=> {
							this.renderer.displayImage(<any>imgJ[0])
							setTimeout(()=>this.updateFilteredImage(imageJ), 250)
						})
					}
				}, false)

				reader.readAsDataURL(file)
			}
		}
	}

	getSelectedImage() {
		return $('#thumbnails').children('.gg-selected').first()
	}

	isImageSelected(): boolean {
		return this.getSelectedImage().length > 0
	}

	updateFilteredImage(imageJ: any=null) {
		if(imageJ == null) {
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
		// $('#thumbnails').append($('<li>').addClass('placeholder'))
	}

	setGif(gif: Gif) {
		this.emptyThumbnails()

		for(let imagePairJ of gif.getImagePairsJ()) {
			this.createThumbnail(imagePairJ.filter('.original'), imagePairJ.filter('.filtered'))
		}
		
		let firstImageJ = gif.getFirstImageJ()
		if(firstImageJ.length > 0) {
			this.selectImage(firstImageJ.attr('data-name'))
		}

		this.nextImage()
	}

	playGifViewer(gif: Gif) {
		if(this.viewer != null) {
			(<any>this.viewer).setGif(gif.containerJ.find('img.filtered').clone())
		}
	}
}

let gifJokey: GifJokey = null
document.addEventListener("DOMContentLoaded", function(event) { 
	gifJokey = new GifJokey()
	gifJokey.initialize();
	(<any>window).gifJokey = gifJokey
});

