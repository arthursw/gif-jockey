export class GifViewer {
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

	getImageJ(name: string): any {
		return this.containerJ.find('img[data-name="'+name+'"]')
	}

	addImage(imgJ: any) {

		// if(!imgJ.attr('gg-loaded')) {
		// 	imgJ.on('load', ()=> { 
		// 		imgJ.attr('gg-loaded', 'true')
		// 		this.setSize(imgJ)
		// 	})
		// } else {
		// 	this.setSize(imgJ)
		// }

		this.containerJ.append(imgJ)
	}

	replaceImage(oldImageName: string, newImageJ: any) {
		this.getImageJ(oldImageName).replaceWith(newImageJ)
	}

	removeImage(imageName: string) {
		this.getImageJ(imageName).remove()
	}

	nextImage() {
		let imagesJ = this.containerJ.children()
		this.imageIndex++

		if(this.imageIndex >= imagesJ.length) {
			this.imageIndex = 0
		}
		// avoid to use hide() / show() because it affects the size of dom element in chrome which is a problem with the thumbnail scrollbar
		imagesJ.css({opacity: 0})
		$(imagesJ[this.imageIndex]).css({opacity: 1})
	}

	sortImages(imageNames: string[]) {
		let imagesJ = this.containerJ.children()
		for(let imageName of imageNames) {
			this.containerJ.append(this.getImageJ(imageName))
		}
	}

	setChildren(imgJs: any[]) {
		for(let img of imgJs) {
			this.addImage($(img))
		}
	}

	getChildren() {
		return this.containerJ.children().clone()
	}
}