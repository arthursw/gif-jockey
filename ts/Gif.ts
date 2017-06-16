import { GUI, Controller } from "./GUI"
import { BPM } from "./BPM"

declare var gifshot: any

declare type GifJockey = {
	viewer: Window
	bpm: BPM
	emptyThumbnails: ()=> void
	setGif: (gif: Gif)=> void
	playGif: (gif: Gif)=> void
}

export class Gif {
	static gifManager: GifManager
	containerJ: any
	imageIndex: number
	hasPreview = false

	constructor(containerJ: any) {
		this.containerJ = containerJ
		this.imageIndex = 0
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

	addImage(imgJ: any, filteredImageJ: any=null) {
		let divJ = $('<div class="gg-image-container">')
		divJ.attr('data-name', imgJ.attr('data-name'))
		divJ.append(imgJ.addClass('gg-hidden original'))

		if(filteredImageJ != null) {
			divJ.append(filteredImageJ)
		}

		this.containerJ.append(divJ)
	}

	setFilteredImage(imageName:string, resultJ:any) {
		let originalImageJ = this.getImageJ(imageName)
		originalImageJ.siblings('.filtered').remove()
		resultJ.insertBefore(originalImageJ)
		resultJ.css({width: '100%'})
	}

	replaceImage(oldImageName: string, newImageJ: any) {
		newImageJ.css({width: '100%'})
		this.getImageJ(oldImageName).replaceWith(newImageJ)
	}

	removeImage(imageName: string) {
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
			}, (obj:any)=> {
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

	constructor(gifJockey: GifJockey) {
		this.gifJockey = gifJockey
		Gif.gifManager = this
		// this.toggleThumbnails(false)
	}

	createGUI(gui: GUI) {
		gui.addButton('Add gif', ()=> this.addGif())
		gui.addSlider('Gif degradation', this.gifQuality, 1, 5000, 1).onChange((value: number)=>{ this.gifQuality = value })
		gui.addButton('Save gif', ()=> this.currentGif.preview(true))
		// gui.addButton('Save gif', ()=> {
		// 	if(!this.currentGif.hasPreview) {
		// 		this.currentGif.preview(true)
		// 	} else {
		// 		let linkJ = $('#result').find('a')
		// 		linkJ[0].click()
		// 	}
		// })
		this.gif = new Gif($('#result'))
	}

	removeImage(imageName: string) {
		this.gif.removeImage(imageName)
		this.currentGif.removeImage(imageName)
	}

	addImage(imgJ: any) {
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
		this.gifJockey.emptyThumbnails()
		this.gif.empty()

		let currentGifJ = $('<li class="gg-thumbnail" data-name="gif-'+this.gifID+'">')
		let closeButtonJ = $('<button type="button" class="gg-small-btn close-btn">')
		let closeSpanJ = $('<span class="ui-icon ui-icon-closethick">')
		let playButtonJ = $('<button type="button" class="gg-small-btn play-btn">')
		let playSpanJ = $('<span class="ui-icon ui-icon-play">')
		let divJ = $('<div class="gg-thumbnail-container">')
		closeButtonJ.append(closeSpanJ)
		playButtonJ.append(playSpanJ)
		currentGifJ.append(divJ)
		currentGifJ.append(closeButtonJ)
		currentGifJ.append(playButtonJ)
		let currentGifID = this.gifID
		closeButtonJ.click( ()=> this.removeGif(currentGifID) )
		playButtonJ.mousedown( (event: JQueryEventObject)=> {
			$('#outputs').find('.gg-small-btn.play-btn').removeClass('playing')
			playButtonJ.addClass('playing')
			this.playGif(currentGifID)
			event.stopPropagation()
			return -1
		})
		currentGifJ.mousedown( (event: JQueryMouseEventObject )=> {
			this.selectGif(currentGifID) 
			event.stopPropagation()
			event.preventDefault()
			return -1
		})
		
		$('#outputs').append(currentGifJ)

		this.currentGif = new Gif(divJ)
		this.gifs.set(this.gifID, this.currentGif)

		this.gifID++
	}

	removeGif(gifID: number) {
		$('#outputs').find('[data-name="gif-' + gifID + '"]').remove()
	}

	toggleThumbnails(show: boolean) {
		let thumbnailsJ = $('#thumbnails')
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

	selectGif(gifID: number) {

		let gifsToSelectJ = $('#outputs').children("[data-name='gif-"+gifID+"']")
		let gifsAlreadySelected = gifsToSelectJ.hasClass('gg-selected')
		$('#outputs').children().removeClass('gg-selected')
		
		if(gifsAlreadySelected || gifsToSelectJ.length == 0) {
			this.toggleThumbnails(false)
			return
		}

		gifsToSelectJ.addClass('gg-selected')

		this.currentGif = this.gifs.get(gifID)

		this.gif.setGif(this.currentGif)
		this.gifJockey.setGif(this.currentGif)
		
		this.toggleThumbnails(true)
	}

	deselectGif() {
		$('#outputs').children().removeClass('gg-selected')
		this.toggleThumbnails(false)
	}

	playGif(gifID: number) {
		let gif = this.gifs.get(gifID)
		this.gifJockey.playGif(gif)
	}

	sortGifsStop = ()=> {

	}
}