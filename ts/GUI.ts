declare var dat: any

declare type DatController = {
	domElement: HTMLElement
	property: string
	object: any
	onChange: (value: any) => any
	onFinishChange: (value: any) => any
	setValue: (value: number | string) => any
	max: (value: number) => any
	min: (value: number) => any
	step: (value: number) => any
	updateDisplay(): () => any
	remove(): () => void
	options: (options: string[]) => any
}

declare type DatFolder = {
	__controllers: Controller[]
}

export class Controller {
	controller: DatController
	
	constructor(controller: DatController) {
		this.controller = controller
	}

	getDomElement(): HTMLElement {
		return this.controller.domElement
	}

	getParentDomElement(): HTMLElement {
		return this.getDomElement().parentElement.parentElement
	}

	hide() {
		$(this.getParentDomElement()).hide()
	}

	show() {
		$(this.getParentDomElement()).show()
	}

	setVisibility(visible: boolean) {
		if(visible) {
			this.show()
		} else {
			this.hide()
		}
	}

	remove() {
		this.controller.remove()
	}

	contains(element: HTMLElement): boolean {
		return $.contains(this.getParentDomElement(), element)
	}

	getProperty(): string {
		return this.controller.property
	}

	getName(): string {
		return this.controller.property
	}

	getValue(): any {
		return this.controller.object[this.controller.property]
	}

	onChange(callback: (value: any) => any) {
		this.controller.onChange(callback)
		return this
	}

	onFinishChange(callback: (value: any) => any) {
		this.controller.onFinishChange(callback)
		return this
	}

	setValue(value: number | string) {
		this.controller.setValue(value)
	}

	setValueNoCallback(value: number | string) {
		this.controller.object[this.controller.property] = value
		this.controller.updateDisplay()
	}

	max(value: number) {
		this.controller.max(value)
	}

	min(value: number) {
		this.controller.min(value)
	}

	step(value: number) {
		this.controller.step(value)
	}

	updateDisplay() {
		this.controller.updateDisplay()
	}

	options(options: string[]): any {
		return this.controller.options(options)
	}

	setName(name: string) {
		$(this.controller.domElement.parentElement).find('span.property-name').html(name)
	}
}

export class GUI {
	gui: any

	constructor(options: any = null, folder: DatFolder = null) {
		this.gui = folder != null ? folder : new dat.GUI(options)
	}

	getDomElement(): HTMLElement {
		return this.gui.domElement
	}

	hide() {
		$(this.getDomElement()).hide()
	}

	show() {
		$(this.getDomElement()).show()
	}

	setVisibility(visible: boolean) {
		if(visible) {
			this.show()
		} else {
			this.hide()
		}
	}

	add(object: any, propertyName: string, minOrArray: number | Array<string> = null, max: number = null): Controller {
		return new Controller( this.gui.add(object, propertyName, minOrArray, max) )
	}

	addButton(name: string, callback: ()=>any, object: any = {}): Controller {
		let nameNoSpaces = name.replace(/\s+/g, '')
		object[nameNoSpaces] = callback
		let controller = new Controller(this.gui.add(object, nameNoSpaces))
		if(name != nameNoSpaces) {
			controller.setName(name)
		}
		return controller
	}

	addToggleButton(name: string, toggledName: string, object: any = {}, propertyName: string = '_toggled', callback: (enabled?:boolean)=>any=null): Controller {
		let defaultValue: any = object[propertyName]
		let controller:Controller = null
		let newCallback = () => {
			object[propertyName] = !object[propertyName]
			controller.setName(object[propertyName] == defaultValue ? name : toggledName)
			if(callback != null) {
				callback.apply(object, [object[propertyName]])
			}
		}
		controller = this.addButton(name, newCallback, object)
		return controller
	}

	addFileSelectorButton(name: string, fileType: string, callback: (event: any)=>any): Controller {	

		let divJ = $("<input data-name='file-selector' type='file' class='form-control' name='file[]'  accept='" + fileType + "'/>")

		let button = this.addButton(name, ()=> divJ.click() )
		$(button.getDomElement()).append(divJ)
		divJ.hide()
		divJ.change(callback)

		return button
	}

	addSlider(name: string, value: number, min: number, max: number, step: number=null): Controller {
		let object:any = {}
		let nameNoSpaces = name.replace(/\s+/g, '')
		object[nameNoSpaces] = value
		let slider:any = this.add(object, nameNoSpaces, min, max)
		if(name != nameNoSpaces) {
			slider.setName(name)
		}
		if(step != null) {
			slider.step(step)
		}
		return slider
	}

	addSelect(name: string, choices: Array<string>, defaultChoice: string): Controller {
		let object:any = {}
		let nameNoSpaces = name.replace(/\s+/g, '')
		object[nameNoSpaces] = defaultChoice
		let controller:any = this.add(object, nameNoSpaces, choices)
		if(name != nameNoSpaces) {
			controller.setName(name)
		}
		return controller
	}

	addFolder(name: string): GUI {
		return new GUI(null, this.gui.addFolder(name))
	}

	getControllers(): Controller[] {
		return this.gui.__controllers
	}
}