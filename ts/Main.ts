/// <reference path="../node_modules/@types/jquery/index.d.ts"/>

declare var Webcam: any

let imageIndex = 0
let viewer: Window = null

let take_snapshot = ()=> {
	// take snapshot and get image data
	Webcam.snap( function(data_uri: string) {
		// display results in page
		let imgJ = $('<img src="'+data_uri+'">')
		$('#results').append(imgJ)
		nextImage();
		(<any>viewer).addImage(imgJ)
	} );
}

let nextImage = ()=> {
	let imagesJ = $('#results').children()
	imageIndex++

	if(imageIndex >= imagesJ.length) {
		imageIndex = 0
	}

	console.log(imageIndex)

	imagesJ.each( function(index) {
		if(index == imageIndex) {
			$(this).show()
		} else {
			$(this).hide()
		}
	})
}

let createViewer = ()=> {
	let windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes"
	viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures)
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
			take_snapshot();
		}
	});

	$("#takeSnapshot").click(take_snapshot)
	$("#createViewer").click(createViewer)

	setInterval(nextImage, 300)
});
