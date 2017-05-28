/// <reference path="../node_modules/@types/jquery/index.d.ts"/>

import { GUI, Controller } from "./GUI"

declare var Webcam: any
declare var stasilo: any

let gui: GUI

let imageID = 0
let imageIndex = 0
let viewer: Window = null
let thumbnailsJ: any = null
let bpmDetectionFolder: GUI = null

let removeImage = (imageAlt: string)=> {
	$('#results').children("[data-name='"+imageAlt+"']").remove()
	$('#thumbnails').children("[data-name='"+imageAlt+"']").remove()

	if(viewer != null) {
		(<any>viewer).removeImage(imageAlt)
	}
	nextImage()
}

let addImage = (data_uri: string)=> {
	// display results in page
	let imgJ = $('<img src="' + data_uri + '" data-name="img-' + imageID + '" alt="img-' + imageID + '">')
	imageID++
	$('#results').append(imgJ)
	createThumbnail(imgJ.clone())
	nextImage()
	if(viewer != null) {
		(<any>viewer).addImage(imgJ.clone())
	}
}

let createThumbnail = (imgJ: any)=> {
	let imageAlt = imgJ.attr('data-name')
	let liJ = $('<li class="ui-state-default gg-thumbnail" data-name="'+imageAlt+'">')
	let buttonJ = $('<button type="button" class="btn btn-default btn-xs close-btn">')
	let spanJ = $('<span class="glyphicon glyphicon-remove" aria-hidden="true">')
	buttonJ.append(spanJ)
	liJ.append(imgJ)
	liJ.append(buttonJ)
	buttonJ.click(()=>{
		removeImage(imageAlt)
	})
	$('#thumbnails').append(liJ)
}

let takeSnapshot = ()=> {
	// take snapshot and get image data
	Webcam.snap(addImage)
}

let nextImage = ()=> {
	let imagesJ = $('#results').children()
	imageIndex++

	if(imageIndex >= imagesJ.length) {
		imageIndex = 0
	}
	// avoid to use hide() / show() because it affects the size of dom element in chrome which is a problem with the thumbnail scrollbar
	imagesJ.css({opacity: 0})
	$(imagesJ[imageIndex]).css({opacity: 1})
}

let sortImages = ()=> {
	let thumbnailsJ = $('#thumbnails').children()
	let imageNames: Array<string> = []
	thumbnailsJ.each(function(index: number, element: Element) {
		imageNames.push($(element).attr('data-name'))
	})
	let resultsJ = $('#results')
	let imagesJ = resultsJ.children()
	for(let imageName of imageNames) {
		resultsJ.append(resultsJ.find("[data-name='"+imageName+"']"))
	}
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

	gui = new GUI(null, { autoPlace: false, width: '100%' })
	document.getElementById('gui').appendChild(gui.getDomElement())

	gui.addButton('Take snapshot', takeSnapshot)
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

	onSliderChange()

	// $(gui.getDomElement()).css({ width: '100%' })
}

document.addEventListener("DOMContentLoaded", function(event) { 

	Webcam.set({
		width: 320,
		height: 240,
		image_format: 'jpeg',
		jpeg_quality: 90
	});
	Webcam.attach( '#camera' );

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


	animate()

	thumbnailsJ = $("#thumbnails")
	thumbnailsJ.sortable(({ stop: sortImages }))
    thumbnailsJ.disableSelection()

    createGUI()
});

