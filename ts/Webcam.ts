export class Webcam {
	width = 640
	height = 0
	streaming = false
	video: HTMLVideoElement = null
	canvas: HTMLCanvasElement = null
	context: CanvasRenderingContext2D = null
	photo: HTMLElement = null

	constructor(callback: ()=>void) {

		// this.photo = document.getElementById('photo')
		this.video = document.createElement('video')
		this.canvas = document.createElement('canvas')
		this.context = this.canvas.getContext('2d')

		let n:any = navigator
		n.getMedia = ( navigator.getUserMedia ||
			n.webkitGetUserMedia ||
			n.mozGetUserMedia ||
			n.msGetUserMedia)

		n.getMedia( { video: true, audio: false }, (stream: any) => {
			if (n.mozGetUserMedia) {
				let v: any = this.video
				v.mozSrcObject = stream
			} else {
				var vendorURL = window.URL || (<any>window).webkitURL
				this.video.src = vendorURL.createObjectURL(stream)
			}
			this.video.play()
		},
		function(err: string) {
			console.log("An error occured! " + err)
		}
		);

		this.video.addEventListener('canplay', (ev)=> {
			if (!this.streaming) {
				this.height = this.video.videoHeight / (this.video.videoWidth/this.width)
				
				// Firefox currently has a bug where the height can't be read from
				// the video, so we will make assumptions if this happens.
				
				if (isNaN(this.height)) {
					this.height = this.width / (4/3)
				}
				
				this.video.setAttribute('width', this.width.toString())
				this.video.setAttribute('height', this.height.toString())
				this.canvas.width = this.width
				this.canvas.height = this.height
				this.streaming = true
				callback()
			}
		}, false)

		// this.clearPhoto()
	}

	getImage() {
		if (this.width && this.height) {
			this.context.drawImage(this.video, 0, 0, this.width, this.height)
			return this.canvas.toDataURL()
		}
		return null
	}

	// Fill the photo with an indication that none has been
	// captured.

	// clearPhoto() {
	// 	var context = this.canvas.getContext('2d')
	// 	context.fillStyle = "#AAA"
	// 	context.fillRect(0, 0, this.canvas.width, this.canvas.height)

	// 	var data = this.canvas.toDataURL('image/png')
	// 	this.photo.setAttribute('src', data)
	// }
	
	// // Capture a photo by fetching the current contents of the video
	// // and drawing it into a canvas, then converting that to a PNG
	// // format data URL. By drawing it on an offscreen canvas and then
	// // drawing that to the screen, we can change its size and/or apply
	// // other changes before drawing it.

	// takePicture() {
	// 	var context = this.canvas.getContext('2d')
	// 	if (this.width && this.height) {
	// 		this.canvas.width = this.width
	// 		this.canvas.height = this.height
	// 		context.drawImage(this.video, 0, 0, this.width, this.height)
			
	// 		var data = this.canvas.toDataURL('image/png')
	// 		this.photo.setAttribute('src', data)
	// 	} else {
	// 		this.clearPhoto()
	// 	}
	// }

}