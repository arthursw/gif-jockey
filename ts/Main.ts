/// <reference path="../node_modules/@types/jquery/index.d.ts"/>

import { GUI, Controller } from "./GUI"
import { Gif, GifManager } from "./Gif"
import { BPM } from "./BPM"
import { FilterManager } from "./Filters"

declare var Webcam: any

class GifGrave {
	
	imageID = 0

	gui: GUI
	viewer: Window = null

	filterManager = new FilterManager(this)
	bpm: BPM = new BPM(this)
	gifManager = new GifManager(this)

	constructor() {
		console.log("Gif Grave")
		Webcam.set({
			width: 320,
			height: 240,
			image_format: 'jpeg',
			jpeg_quality: 90
		});
		Webcam.attach( '#camera' );
		// $('#camera').css({margin: 'auto'})
		$( document ).keydown((event) => {
			if(event.keyCode == 32) {			// space bar
				this.takeSnapshot()
				event.preventDefault()
			} else if(event.keyCode == 13) {	// enter
				this.bpm.tap()
			} else if(event.keyCode == 27) {	// escape
				this.bpm.stopTap()
			}
		});

		$("#takeSnapshot").click(this.takeSnapshot)
		$("#createViewer").click(this.createViewer)

		let thumbnailsJ: any = $("#thumbnails")
		thumbnailsJ.sortable(({ stop: ()=> this.sortImagesStop() }))
	    thumbnailsJ.disableSelection()

		let outputsJ: any = $("#outputs")
		outputsJ.sortable(({ stop: ()=> this.gifManager.sortGifsStop() }))
	    outputsJ.disableSelection()

	    this.createGUI()

	    this.gifManager.addGif()
	}

	initialize() {
		this.animate()
	}

	createGUI() {

		this.gui = new GUI({ autoPlace: false, width: '100%' })
		document.getElementById('gui').appendChild(this.gui.getDomElement())

		this.gui.addButton('Take snapshot', ()=> this.takeSnapshot())
		this.gui.addButton('Create viewer', ()=> this.createViewer())

		this.bpm.createGUI(this.gui)
		this.gifManager.createGUI(this.gui)
		// onSliderChange()

		// $(gui.getDomElement()).css({ width: '100%' })
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
		$('#thumbnails').children().removeClass('gg-selected')
		$('#thumbnails').children("[data-name='"+imageName+"']").addClass('gg-selected')

		let imgJ = $('#thumbnails').children("[data-name='"+imageName+"']").find('img.original')
		
		this.filterManager.setImage(imgJ)
	}

	addImage(data_uri: string, canvas: HTMLCanvasElement=null, context: CanvasRenderingContext2D=null) {
		// display results in page
		let imageName = 'img-' + this.imageID
		let imgJ = $('<img src="' + data_uri + '" data-name="' + imageName + '" alt="img-' + this.imageID + '">')
		this.imageID++

		this.gifManager.addImage(imgJ.clone())

		this.createThumbnail(imgJ.clone())

		imgJ.on('load', ()=>{
			this.selectImage(imageName)
			this.nextImage()
		})
		// if(viewer != null) {
		// 	(<any>viewer).addImage(imgJ.clone())
		// }
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
		liJ.mousedown(()=>setTimeout(()=>{this.selectImage(imageName)}, 0)) // add timeout to not to disturbe draggable
		$('#thumbnails').append(liJ)
	}

	takeSnapshot() {
		Webcam.snap((data_uri: string, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D)=>this.addImage(data_uri, canvas, context))
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

let gifGrave: GifGrave = null
document.addEventListener("DOMContentLoaded", function(event) { 
	gifGrave = new GifGrave()
	gifGrave.initialize()
});

