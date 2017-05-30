/// <reference path="../node_modules/@types/jquery/index.d.ts"/>

import { GUI, Controller } from "./GUI"
import { GifViewer } from "./GifViewer"
import { FilterManager } from "./Filters"

declare var Webcam: any
declare var stasilo: any

let gui: GUI
let filterManager: FilterManager

let imageID = 0
let gifID = 0
let imageIndex = 0
let viewer: Window = null
let thumbnailsJ: any = null
let bpmDetectionFolder: GUI = null

let gifViewer: GifViewer = null

let setFilteredImage = (imageJ:any, resultJ:any)=> {
	let imageName = imageJ.attr('data-name')
	resultJ.insertBefore(imageJ)

	gifViewer.replaceImage(imageName, resultJ.clone())
	currentGif.replaceImage(imageName, resultJ.clone())
	// if(viewer != null) {
	// 	(<any>viewer).setFilteredImage(imageJ, resultJ)
	// }
}

let removeImage = (imageAlt: string)=> {
	gifViewer.removeImage(imageAlt)
	currentGif.removeImage(imageAlt)

	$('#thumbnails').children("[data-name='"+imageAlt+"']").remove()

	// if(viewer != null) {
	// 	(<any>viewer).removeImage(imageAlt)
	// }
	nextImage()
}

let selectImage = (imageName: string) => {
	$('#thumbnails').children().removeClass('gg-selected')
	$('#thumbnails').children("[data-name='"+imageName+"']").addClass('gg-selected')

	let imgJ = $('#thumbnails').children("[data-name='"+imageName+"']").find('img.original-image')
	
	filterManager.setImage(imgJ)
}

let addImage = (data_uri: string, canvas: HTMLCanvasElement=null, context: CanvasRenderingContext2D=null)=> {
	// display results in page
	let imageName = 'img-' + imageID
	let imgJ = $('<img src="' + data_uri + '" data-name="' + imageName + '" alt="img-' + imageID + '">')
	imageID++
	gifViewer.addImage(imgJ.clone())
	currentGif.addImage(imgJ.clone())

	createThumbnail(imgJ.clone())
	selectImage(imageName)
	nextImage()
	// if(viewer != null) {
	// 	(<any>viewer).addImage(imgJ.clone())
	// }
}

let createThumbnail = (imgJ: any)=> {
	let imageName = imgJ.attr('data-name')
	let liJ = $('<li class="ui-state-default gg-thumbnail" data-name="'+imageName+'">')
	let buttonJ = $('<button type="button" class="close-btn">')
	let spanJ = $('<span class="ui-icon ui-icon-closethick">')
	let divJ = $('<div class="gg-thumbnail-container">')
	buttonJ.append(spanJ)
	divJ.append(imgJ.addClass('gg-hidden original-image'))
	liJ.append(divJ)
	liJ.append(buttonJ)
	buttonJ.click(()=>{
		removeImage(imageName)
	})
	liJ.mousedown(()=>setTimeout(()=>{selectImage(imageName)}, 0)) // add timeout to not to disturbe draggable
	$('#thumbnails').append(liJ)
}

let takeSnapshot = ()=> {
	// take snapshot and get image data
	Webcam.snap(addImage)
}

let nextImage = ()=> {
	gifViewer.nextImage()
	for(let [gifName, gif] of gifs) {
		gif.nextImage()
	}
}

// let sortImagesStart = (event: Event, ui: any)=> {
// 	let imageName = $(ui.item).attr('data-name')
// 	selectImage(imageName)
// }

let sortImagesStop = ()=> {
	let thumbnailsJ = $('#thumbnails').children()
	let imageNames: Array<string> = []
	thumbnailsJ.each(function(index: number, element: Element) {
		imageNames.push($(element).attr('data-name'))
	})
	gifViewer.sortImages(imageNames)
	currentGif.sortImages(imageNames)
}

let createViewer = ()=> {
	let windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes"
	viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures)
}

let song: any = null
let previousIsOnBeat = false

let animate = ()=> {
	requestAnimationFrame(animate)

	if(song == null || !autoBPM) {
		return
	}

	let isOnBeat = song.isOnBeat()
	if(isOnBeat && !previousIsOnBeat) {
		nextImage()
	}
	previousIsOnBeat = isOnBeat
}

let bpmDetectionButton: Controller = null
let tapButton: Controller = null
let autoBPM = true

let toggleBPMdetection = ()=> {
	autoBPM = !autoBPM
	bpmDetectionButton.setName(autoBPM ? 'Manual BPM' : 'Auto BPM')
	tapButton.setVisibility(!autoBPM)
	bpmDetectionFolder.setVisibility(autoBPM)
	if(autoBPM) {
		stopBPMinterval()
	}
}

let bpm = 0
let lastTap = Date.now()
let nTaps = 0
const MaxTapTime = 3000
let averageBPM = 0
let tapIntervalID:number = null

let tapTimeoutID:number = null

let stopBPMinterval = ()=> {
	if(tapIntervalID != null) {
		clearInterval(tapIntervalID)
		tapIntervalID = null
	}
} 

let setBPMinterval = (bpm: number, newBPM:number=null)=> {
	stopBPMinterval()
	let delay = 1 / (bpm / 60 / 1000)
	tapIntervalID = setInterval(nextImage, delay)
	tapButton.setName('Tapping - BPM: ' + bpm.toFixed(2) + (newBPM != null ? ' | ' + newBPM.toFixed(2) : ''))
}

let stopTap = ()=> {
	nTaps = 0
	tapButton.setName('Tap - BPM: ' + averageBPM.toFixed(2))
}

let tap = ()=> {
	nTaps++

	let now = Date.now()
	if(nTaps == 1) {
		lastTap = now
		tapButton.setName('Tapping')
		return
	}

	let newBPM = 60 / ( (now - lastTap) / 1000 )
	averageBPM = ( averageBPM * (nTaps - 1) + newBPM ) / nTaps

	setBPMinterval(averageBPM, newBPM)

	if(tapTimeoutID != null) {
		clearTimeout(tapTimeoutID)
	}
	tapTimeoutID = setTimeout(stopTap, MaxTapTime)

	lastTap = now
}

let createGUI = ()=> {

	gui = new GUI({ autoPlace: false, width: '100%' })
	document.getElementById('gui').appendChild(gui.getDomElement())

	gui.addButton('Take snapshot', takeSnapshot)
	gui.addButton('Add gif', addGif)
	gui.addButton('Create viewer', createViewer)
	bpmDetectionButton = gui.addButton('Manual BPM', toggleBPMdetection)

	tapButton = gui.addButton('Tap', tap)

	tapButton.setVisibility(!autoBPM)
	bpmDetectionFolder = gui.addFolder('BPM detection settings')

	let sliders:any = { sensitivity: null, analyserFFTSize: null, passFreq: null, visualizerFFTSize: null }

	let onSliderChange = () => {
		let sens = sliders.sensitivity.getValue()
		let analyserFFTSize = Math.pow(2, sliders.analyserFFTSize.getValue())
		let visualizerFFTSize = Math.pow(2, sliders.visualizerFFTSize.getValue())
		let passFreq = sliders.passFreq.getValue()

		song = new stasilo.BeatDetector( {	sens: sens,
							 				visualizerFFTSize: visualizerFFTSize, 
											analyserFFTSize:   analyserFFTSize,
											passFreq: passFreq })
	}

	sliders.sensitivity = bpmDetectionFolder.addSlider('Sensitivity', 5, 1, 16, 1).onChange(onSliderChange)
	sliders.analyserFFTSize = bpmDetectionFolder.addSlider('Analyser FFT Size', 7, 5, 15, 1)
	sliders.passFreq = bpmDetectionFolder.addSlider('Bandpass Filter Frequency', 600, 1, 10000, 1)
	sliders.visualizerFFTSize = bpmDetectionFolder.addSlider('Visualizer FFT Size', 7, 5, 15, 1)

	// onSliderChange()

	// $(gui.getDomElement()).css({ width: '100%' })
}

let emptyThumbnails = ()=> {
	$('#thumbnails').empty()
}

let gifs: Map<number, GifViewer> = new Map()
let currentGif: GifViewer = null

let getGifContainer = ()=> {
	return currentGif.containerJ.parentUntil('li.gg-thumbnail')
}

let addGif = ()=> {
	emptyThumbnails()

	let currentGifJ = $('<li class="gg-thumbnail" data-name="'+gifID+'">')
	let buttonJ = $('<button type="button" class="close-btn">')
	let spanJ = $('<span class="ui-icon ui-icon-closethick">')
	let divJ = $('<div class="gg-thumbnail-container">')
	buttonJ.append(spanJ)
	currentGifJ.append(divJ)
	currentGifJ.append(buttonJ)
	buttonJ.click(()=>{
		removeGif(gifID)
	})
	currentGifJ.mousedown(() => selectGif(gifID) )
	
	gifID++
	$('#outputs').append(currentGifJ)

	currentGif = new GifViewer(divJ)
	gifs.set(gifID, currentGif)
}

let removeGif = (gifID: number)=> {
	$('#outputs').find('[data-name="' + gifID + '"]').remove()
}

let selectGif = (gifID: number)=> {

	$('#outputs').children().removeClass('gg-selected')	
	$('#outputs').children("[data-name='"+gifID+"']").addClass('gg-selected')

	currentGif = gifs.get(gifID)

	if(viewer != null) {
		(<any>viewer).setCurrentGif(currentGif.getChildren())
	}
}


document.addEventListener("DOMContentLoaded", function(event) { 

	Webcam.set({
		width: 320,
		height: 240,
		image_format: 'jpeg',
		jpeg_quality: 90
	});
	Webcam.attach( '#camera' );
	// $('#camera').css({margin: 'auto'})
	$( document ).keydown(function(event) {
		if(event.keyCode == 32) {			// space bar
			takeSnapshot()
		} else if(event.keyCode == 13) {	// enter
			tap()
		} else if(event.keyCode == 27) {	// escape
			stopTap()
		}
	});

	$("#takeSnapshot").click(takeSnapshot)
	$("#createViewer").click(createViewer)

	gifViewer = new GifViewer($('#result'))

	addGif()

	animate()

	thumbnailsJ = $("#thumbnails")
	thumbnailsJ.sortable(({ stop: sortImagesStop }))
    thumbnailsJ.disableSelection()

    createGUI()

    filterManager = new FilterManager(setFilteredImage)
});

