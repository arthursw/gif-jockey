/// <reference path="../node_modules/@types/jquery/index.d.ts"/>

declare var Webcam: any
declare var stasilo: any

let imageID = 0
let imageIndex = 0
let viewer: Window = null


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
	let divJ = $('<div class="gg-thumbnail" data-name="'+imageAlt+'">')
	let buttonJ = $('<button type="button" class="btn btn-default btn-xs close-btn">')
	let spanJ = $('<span class="glyphicon glyphicon-remove" aria-hidden="true">')
	buttonJ.append(spanJ)
	divJ.append(imgJ)
	divJ.append(buttonJ)
	buttonJ.click(()=>{
		removeImage(imageAlt)
	})
	$('#thumbnails').append(divJ)
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

let createViewer = ()=> {
	let windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes"
	viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures)
}

let song = null
let previousIsOnBeat = false

let animate = ()=> {
	requestAnimationFrame(animate)

	let isOnBeat = song.isOnBeat()
	if(song != null && isOnBeat && !previousIsOnBeat) {
		nextImage()
		console.log("IsOnBeat")
	}
	previousIsOnBeat = isOnBeat
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
		if(event.keyCode == 32) {
			takeSnapshot();
		}
	});

	$("#takeSnapshot").click(takeSnapshot)
	$("#createViewer").click(createViewer)

	song = new stasilo.BeatDetector({sens: 				5.0,
						 			 visualizerFFTSize: 256, 
									 analyserFFTSize:   256, 
									 passFreq:          600})
	song.setVolume(0)
	animate()
});
