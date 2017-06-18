import * as $ from 'jquery'
import * as gifshot from 'gifshot'

import { GUI, Controller } from "./GUI"
import { BPM } from "./BPM"
import { Webcam } from "./Webcam"

declare type GifJockey = {
	imageID: number
	viewer: Window
	bpm: BPM
	webcam: Webcam
	emptyThumbnails: ()=> void
	setGif: (gif: Gif)=> void
	playGifViewer: (gif: Gif)=> void
	takeSnapshot: ()=> void
	deselectAndCallback: (callback: ()=> void, delay?: number)=> void
	deselectImages: ()=> void
}

export class Gif {
	static gifManager: GifManager
	containerJ: any
	imageIndex: number
	hasPreview = false
	nImages = 0
	id = -1

	constructor(containerJ: any, id: number) {
		this.containerJ = containerJ
		this.imageIndex = 0
		this.id = id
	}

	// setSize(imgJ: any) {
	// 	this.containerJ.width(imgJ[0].naturalWidth)
	// 	this.containerJ.height(imgJ[0].naturalHeight)
	// }

	getImageContainerJ(name: string): any {
		return this.containerJ.find('div[data-name="'+name+'"]')
	}

	getImageJ(name: string): any {
		return this.containerJ.find('img[data-name="'+name+'"]')
	}

	getFilteredImagesJ(): any {
		return this.containerJ.find('img.filtered')
	}

	getFirstImageJ(): any {
		return this.containerJ.find('img.original').first()
	}

	containsImage(name: string): boolean {
		return this.getImageContainerJ(name).length > 0
	}

	getNumberOfImages() {
		return this.nImages
	}

	isEmpty() {
		return this.nImages == 0
	}
	
	addCopy(originalImageJ: any, filteredImageJ: any, imageID: number) {
		let originalJ = originalImageJ.clone()
		originalJ.attr('data-name', 'img-'+imageID)
		let filteredJ = filteredImageJ.clone()
		filteredJ.attr('data-name', 'img-'+imageID)
		this.addImage(originalJ, filteredJ)
	}

	addImage(originalImageJ: any, filteredImageJ: any=null) {
		this.nImages++
		this.containerJ.find('.gg-placeholder').remove()

		let divJ = $('<div class="gg-image-container">')
		divJ.attr('data-name', originalImageJ.attr('data-name'))
		divJ.append(originalImageJ.addClass('gg-hidden original'))

		if(filteredImageJ != null) {
			divJ.append(filteredImageJ)
		}

		this.containerJ.append(divJ)
	}

	setFilteredImage(imageName:string, resultJ:any) {
		let originalImageJ = this.getImageJ(imageName)
		originalImageJ.siblings('.filtered').remove()
		resultJ.insertBefore(originalImageJ)
		// resultJ.css({width: '100%'})
	}

	replaceImage(oldImageName: string, newImageJ: any) {
		// newImageJ.css({width: '100%'})
		this.getImageJ(oldImageName).replaceWith(newImageJ)
	}

	removeImage(imageName: string) {
		this.nImages--
		this.getImageContainerJ(imageName).remove()
	}

	nextImage() {
		let imagesJ = this.containerJ.children()
		this.imageIndex++

		if(this.imageIndex >= imagesJ.length) {
			this.imageIndex = 0
		}

		// avoid to use hide() / show() because it affects the size of dom element in chrome which is a problem with the thumbnail scrollbar
		// imagesJ.css({opacity: 0})
		// $(imagesJ[this.imageIndex]).css({opacity: 1})


		imagesJ.hide()
		$(imagesJ[this.imageIndex]).show()
	}

	sortImages(imageNames: string[]) {
		let imageContainersJ = this.containerJ.children()
		for(let imageName of imageNames) {
			let imageContainerJ = this.containerJ.children('div[data-name="' + imageName + '"]')
			this.containerJ.append(imageContainerJ)
		}
	}

	getImagePairsJ(): any[] {
		let imagePairsJ = []
		for(let child of this.containerJ.children()) {
			imagePairsJ.push($(child).find('img').clone())
		}
		return imagePairsJ
	}

	setGif(gif: Gif) {
		this.empty()
		let imagePairsJ = gif.getImagePairsJ()
		for(let imagePairJ of imagePairsJ) {
			this.addImage(imagePairJ.filter('.original'), imagePairJ.filter('.filtered'))
		}
	}

	empty() {
		this.containerJ.empty()
		this.nImages = 0
	}

	preview(save = false) {
		let imagesJ = this.getFilteredImagesJ().toArray()
		if(imagesJ.length == 0) {
			return
		}
		let width = imagesJ[0].naturalWidth
		let height = imagesJ[0].naturalHeight
		let interval = Gif.gifManager.gifJockey.bpm.getInterval() / 1000
		gifshot.createGIF({
		    gifWidth: width,
		    gifHeight: height,
    		interval: interval,
			images: imagesJ,
			sampleInterval: Gif.gifManager.gifQuality
			}, (obj:{image: string, error: any})=> {
				if (!obj.error) {
					var image = obj.image, animatedImage = document.createElement('img')
					animatedImage.src = image
					let aJ = $('<a download="gif.gif" href="' + image + '">')
					aJ.append(animatedImage)
					$('#gif-result').empty().append(aJ)
					this.hasPreview = true
					if(save) {
						aJ[0].click()
					}
				}
			}
		);
	}
}

export class GifManager {
	gifID: number = 0
	gif: Gif
	gifs: Map<number, Gif> = new Map()
	currentGif: Gif = null
	gifJockey: GifJockey
	gifQuality: number = 10
	numberOfImages = 4
	nSnapshots = 0
	autoGifInterval = -1

	constructor(gifJockey: GifJockey) {
		this.gifJockey = gifJockey
		Gif.gifManager = this
		// this.toggleThumbnails(false)
	}

	createGUI(gui: GUI) {
		let folder = gui.addFolder('Export GIF')
		folder.addSlider('Gif degradation', this.gifQuality, 1, 5000, 1).onChange((value: number)=>{ this.gifQuality = value })
		folder.addButton('Save gif', ()=> this.currentGif.preview(true))
		// gui.addButton('Save gif', ()=> {
		// 	if(!this.currentGif.hasPreview) {
		// 		this.currentGif.preview(true)
		// 	} else {
		// 		let linkJ = $('#result').find('a')
		// 		linkJ[0].click()
		// 	}
		// })
		this.gif = new Gif($('#result'), this.gifID++)
	}

	removeImage(imageName: string) {
		this.gif.removeImage(imageName)
		this.currentGif.removeImage(imageName)
	}

	addImage(imgJ: any) {
		if(this.gifs.size == 0) {
			this.addGif()
		}

		this.gif.addImage(imgJ.clone())
		this.currentGif.addImage(imgJ.clone())
	}

	setFilteredImage(imageName: any, resultJ: any) {
		this.gif.setFilteredImage(imageName, resultJ.clone())
		this.currentGif.setFilteredImage(imageName, resultJ.clone())
	}

	nextImage() {
		this.gif.nextImage()
		for(let [gifName, gif] of this.gifs) {
			gif.nextImage()
		}
	}

	sortImages(imageNames: string[]) {
		this.gif.sortImages(imageNames)
		this.currentGif.sortImages(imageNames)
	}

	getGifContainer = ()=> {
		return this.currentGif.containerJ.parentUntil('li.gg-thumbnail')
	}

	addGif() {
		this.gifJockey.deselectImages()
		this.gifJockey.emptyThumbnails()
		this.gif.empty()

		let currentGifJ = $('<li class="gg-thumbnail" data-name="gif-'+this.gifID+'">')
		let closeButtonJ = $('<button type="button" class="gg-small-btn close-btn">')
		let closeSpanJ = $('<span class="ui-icon ui-icon-closethick">')
		let playButtonJ = $('<button type="button" class="gg-small-btn play-btn">')
		let playSpanJ = $('<span class="ui-icon ui-icon-play">')
		let duplicateButtonJ = $('<button type="button" class="gg-small-btn duplicate-btn">')
		let duplicateButtonIconJ = $('<span class="ui-icon ui-icon-plusthick">')
		duplicateButtonJ.append(duplicateButtonIconJ)
		let divJ = $('<div class="gg-thumbnail-container">')
		let selectionRectangleJ = $('<div class="gg-selection-rectangle">')

		closeButtonJ.append(closeSpanJ)
		playButtonJ.append(playSpanJ)

		currentGifJ.append(selectionRectangleJ)
		currentGifJ.append(divJ)
		currentGifJ.append(closeButtonJ)
		currentGifJ.append(duplicateButtonJ)
		currentGifJ.append(playButtonJ)
		let currentGifID = this.gifID
		closeButtonJ.click( ()=> this.removeGif(currentGifID) )
		duplicateButtonJ.click(()=> this.duplicateGif(currentGifID) )
		playButtonJ.mousedown( (event: JQueryEventObject)=> {
			this.playGif(currentGifID)
			event.stopPropagation()
			return -1
		})
		currentGifJ.mousedown( (event: JQueryMouseEventObject )=> {
			this.selectGif(currentGifID)
		})
		
		let width = $('#outputs').width()
		let ratio = this.gifJockey.webcam.height / this.gifJockey.webcam.width
		let height = width * ratio
		currentGifJ.css({width: width, height: height})

		let outputJ = $('#outputs')
		outputJ.append(currentGifJ)

		this.currentGif = new Gif(divJ, this.gifID)
		this.gifs.set(this.currentGif.id, this.currentGif)

		this.gifID++

		(<any>currentGifJ).droppable({
			classes: {
				"ui-droppable-hover": "ui-state-hover",
				"ui-droppable-active": "ui-state-default"
			},
			drop: ( event:any, ui:any )=> {
				let originalJ = ui.helper.find('img.original')
				let filteredJ = ui.helper.find('img.filtered')
				let gif = this.gifs.get(currentGifID)

				// Ignore if the gif already contains the image:
				if(gif.containsImage(originalJ.attr('data-name'))) {
					return
				}

				gif.addCopy(originalJ, filteredJ, this.gifJockey.imageID++)
			}
		})

		// outputsJ.sortable(({ stop: ()=> this.gifManager.sortGifsStop(), connectWith: '#thumbnails', receive: function( event: any, ui: any ) {
		// 	if(ui.sender.is('#thumbnails')) {
				
		// 	}
		// } }))
	}

	createAutoGif() {
		if(this.autoGifInterval != null) {
			clearInterval(this.autoGifInterval)
			this.autoGifInterval = null
		}
		if(this.currentGif == null || !this.currentGif.isEmpty()) {
			this.addGif()
		}
		
		this.gifJockey.deselectAndCallback(()=> {
			this.nSnapshots = 0
			this.autoGifInterval = setInterval(()=>{
				this.gifJockey.takeSnapshot()
				this.nSnapshots++
				if(this.nSnapshots == this.numberOfImages) {
					clearInterval(this.autoGifInterval)
					this.autoGifInterval = null
				}
			}, this.gifJockey.bpm.getInterval())
		})
	}

	removeGif(gifID: number) {
		$('#outputs').find('[data-name="gif-' + gifID + '"]').remove()
		$('#thumbnails').empty()
		this.gifs.delete(gifID)
		if(this.currentGif != null && this.currentGif.id == gifID) {
			this.currentGif = null
		}
	}

	duplicateGif(gifID: number) {
		let gif = this.gifs.get(gifID)
		this.addGif()

		let imagePairsJ = gif.getImagePairsJ()
		for(let imagePairJ of imagePairsJ) {
			let originalImageJ = imagePairJ.filter('.original')
			let filteredImageJ = imagePairJ.filter('.filtered')
			this.currentGif.addCopy(originalImageJ, filteredImageJ, this.gifJockey.imageID++)
		}
	}

	toggleThumbnails(show: boolean) {
		let thumbnailsJ = $('#thumbnails-container')
		let thumbnailsVisible = thumbnailsJ.is(':visible')
		if(show && !thumbnailsVisible) {
			thumbnailsJ.show()
			document.dispatchEvent(new Event('cameraResized'))
		} else if (!show && thumbnailsVisible) {
			thumbnailsJ.hide()
			document.dispatchEvent(new Event('cameraResized'))
		}
		// let resultJ = $('#result')
		// let resultVisible = resultJ.is(':visible')
		// if(show && !resultVisible) {
		// 	resultJ.show()
		// } else if (!show && resultVisible) {
		// 	resultJ.hide()
		// }
	}

	selectGif(gifID: number) {

		let gifsToSelectJ = $('#outputs').children("[data-name='gif-"+gifID+"']")
		
		if(gifsToSelectJ.length == 0) {
			this.toggleThumbnails(false)
			return
		}

		let gifsAlreadySelected = gifsToSelectJ.hasClass('gg-selected')

		if(gifsAlreadySelected) {
			return
		}

		$('#outputs').children().removeClass('gg-selected')

		gifsToSelectJ.addClass('gg-selected')

		this.currentGif = this.gifs.get(gifID)

		this.gif.setGif(this.currentGif)
		this.gifJockey.setGif(this.currentGif)
		
		this.toggleThumbnails(true)
	}

	// Select parent gif when select an image 
	selectImage(imageName: string) {
		if(this.currentGif != null && this.currentGif.getImageJ(imageName).length > 0) {
			return
		} else {
			for(let [gifID, gif] of this.gifs) {
				if(gif.getImageJ(imageName).length > 0) {
					this.selectGif(gifID)
					return
				}
			}
		}
	}

	deselectGif() {
		$('#outputs').children().removeClass('gg-selected')
		this.toggleThumbnails(false)
		// this.currentGif = null
	}

	playGif(gifID: number) {
		$('#outputs').find('.gg-small-btn.play-btn').removeClass('playing')
		let gif = this.gifs.get(gifID)
		gif.containerJ.parent().find('.play-btn').addClass('playing')

		this.gifJockey.playGifViewer(gif)
	}

	sortGifsStop = ()=> {

	}
}