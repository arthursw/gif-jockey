import { GUI, Controller } from "./GUI"

declare type GifGrave = {
	viewer: Window
	emptyThumbnails: ()=> void
	setGif: (gif: Gif)=> void
	playGif: (gif: Gif)=> void
}

export class Gif {
	containerJ: any
	imageIndex: number

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
	}

	replaceImage(oldImageName: string, newImageJ: any) {
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
}

export class GifManager {
	gifID: number = 0
	gif: Gif
	gifs: Map<number, Gif> = new Map()
	currentGif: Gif = null
	gifGrave: GifGrave

	constructor(gifGrave: GifGrave) {
		this.gifGrave = gifGrave
	}

	createGUI(gui: GUI) {
		gui.addButton('Add gif', ()=> this.addGif())
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
		this.gifGrave.emptyThumbnails()
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
		playButtonJ.click( ()=> {
			$('#outputs').find('.gg-small-btn.play-btn').show()
			playButtonJ.hide()
			this.playGif(currentGifID)
		})
		currentGifJ.mousedown( ()=> this.selectGif(currentGifID) )
		
		$('#outputs').append(currentGifJ)

		this.currentGif = new Gif(divJ)
		this.gifs.set(this.gifID, this.currentGif)

		this.gifID++
	}

	removeGif(gifID: number) {
		$('#outputs').find('[data-name="gif-' + gifID + '"]').remove()
	}

	selectGif(gifID: number) {

		$('#outputs').children().removeClass('gg-selected')	
		$('#outputs').children("[data-name='gif-"+gifID+"']").addClass('gg-selected')

		this.currentGif = this.gifs.get(gifID)

		this.gif.setGif(this.currentGif)
		this.gifGrave.setGif(this.currentGif)
	}

	playGif(gifID: number) {
		let gif = this.gifs.get(gifID)
		this.gifGrave.playGif(gif)
	}

	sortGifsStop = ()=> {

	}
}