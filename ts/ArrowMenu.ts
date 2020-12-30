import * as $ from 'jquery'
import { ShaderManager } from './ShaderManager'

export class ArrowMenu {
    currentPath: string[] = []
    currentIndex: number = null
    menu = {
        "BPM": ()=> this.bpm(),
        "Effects": {
            "Back": {}
        },
        "Randomize effects": ()=> this.randomizeEffects(true),
        "Randomize parameters": ()=> this.randomizeEffects(false),
        "Take photo":  ()=> this.takePhoto(),
        "New GIF": ()=> this.newGIF(),
        "Save GIF":  ()=> this.saveGIF(),
    }
    shaderManager: ShaderManager
    gifJockey: any

    // activate effect + visualize
    // take effect into accound
    // implement functions
    // improve code

    constructor(shaderManager: ShaderManager, gifJockey: any) {
        this.gifJockey = gifJockey
        this.buildEffects(shaderManager)
        this.currentPath = []
        this.buildMenu()
        document.addEventListener('keydown', (event: KeyboardEvent)=> this.onKeyDown(event))
    }

    getCurrentItem() {
        let currentItem: any = this.menu
        for(let property of this.currentPath) {
            currentItem = currentItem[property]
        }
        return currentItem
    }

    getCurrentItemProperties() {
        let currentItem = this.getCurrentItem()
        let properties = []
        for(let property in currentItem) {
            properties.push(property)
        }
        return { currentItem, properties }
    }

    onKeyDown(event: KeyboardEvent) {
        if($('#loading').hasClass('loading')) {
            return
        }
        let { currentItem, properties } = this.getCurrentItemProperties()
        if(event.code == 'Escape') {
            this.goBack()
            return
        }
        if(event.code == 'ContextMenu') {
            this.takePhoto()
            return
        }
        if(event.code == 'ArrowUp') {
            this.currentIndex = this.currentIndex == null ? properties.length-1 : this.currentIndex - 1
            if(this.currentIndex < 0) {
                this.currentIndex = 0
            }
            let currentName = properties[this.currentIndex]
            $('#arrow-menu').find('.selected').removeClass('selected')
            $('#arrow-menu').find('[data-name="'+currentName+'"]').addClass('selected')
        } else if(event.code == 'ArrowDown') {
            this.currentIndex = this.currentIndex == null ? 0 : this.currentIndex + 1
            if(this.currentIndex > properties.length-1) {
                this.currentIndex = properties.length-1
            }
            let currentName = properties[this.currentIndex]
            $('#arrow-menu').find('.selected').removeClass('selected')
            $('#arrow-menu').find('[data-name="'+currentName+'"]').addClass('selected')
        }
        
        if(this.currentIndex != null) {
            if(event.code == 'Enter') {
                let currentName = properties[this.currentIndex]
                this.onItemClick(null, currentItem, properties[this.currentIndex], $('#arrow-menu').find('[data-name="'+currentName+'"]'))
            }
            let currentFunction = currentItem[properties[this.currentIndex]]
            if(event.code == 'ArrowLeft') {
                let currentName = properties[this.currentIndex]
                if(currentName == 'Back') {
                    this.onItemClick(null, currentItem, properties[this.currentIndex], $('#arrow-menu').find('[data-name="'+currentName+'"]'))
                }
                if(typeof currentFunction === 'function') {
                    let currentName = properties[this.currentIndex]
                    currentFunction(null, -1, $('#arrow-menu').find('[data-name="'+currentName+'"]'))
                }
            } else if(event.code == 'ArrowRight') {
                if(typeof currentFunction === 'function') {
                    let currentName = properties[this.currentIndex]
                    currentFunction(null, 1, $('#arrow-menu').find('[data-name="'+currentName+'"]'))
                }
            }
        }
    }

    buildEffects(shaderManager: ShaderManager) {
        this.shaderManager = shaderManager
        let effects: any = this.menu['Effects']
        for(let effectName in shaderManager.shaderParameters) {
            let effect = shaderManager.shaderParameters[effectName]
            let effectObject: any = { 'Back': {} }
            effectObject['Enable'] = ()=> {
                let currentItem: any = this.menu
                for(let property of this.currentPath) {
                    currentItem = currentItem[property]
                }
                let properties = []
                for(let property in currentItem) {
                    properties.push(property)
                }
                let currentName = properties[this.currentIndex]
                effect.on = !effect.on
                if(effect.on) {
                    $('#arrow-menu').find('[data-name="'+currentName+'"]').addClass('enabled').find('span.text').text('Disable')
                } else {
                    $('#arrow-menu').find('[data-name="'+currentName+'"]').removeClass('enabled').find('span.text').text('Enable')
                }
                shaderManager.updateActiveShaders()
                shaderManager.onToggleShaders(true)
            }
            for(let parameter in effect.parameters) {
                effectObject[parameter] = (percent: number, delta: number, divJ: JQuery)=> {
                    if(effect.parameters[parameter].type == 'color') {
                        let barJ = divJ.find('.bar:first')
                        let c = this.shaderManager.getRandomColor()
                        effect.parameters[parameter].value = c
                        barJ.css({'background-color': c})
                        shaderManager.onParamsChange(true)
                        return
                    }
                    let d = effect.parameters[parameter].max - effect.parameters[parameter].min
                    const nSteps = 20
                    if(delta != null) {
                        effect.parameters[parameter].value += delta * (d/nSteps)
                    } else if(percent) {
                        effect.parameters[parameter].value = effect.parameters[parameter].min + d * percent
                    }
                    if(effect.parameters[parameter].value < effect.parameters[parameter].min) {
                        effect.parameters[parameter].value = effect.parameters[parameter].min
                    }
                    if(effect.parameters[parameter].value > effect.parameters[parameter].max) {
                        effect.parameters[parameter].value = effect.parameters[parameter].max
                    }
                    let p = 100 * (effect.parameters[parameter].value - effect.parameters[parameter].min) / d
                    let barJ = divJ.find('.bar:first')
                    barJ.css({'width': '' + p + '%' })
                    divJ.find('.value:first').text('' + effect.parameters[parameter].value.toFixed(2))
                    shaderManager.onParamsChange(true)
                }
            }
            effectObject['Take photo'] = ()=> this.takePhoto()
            effectObject['Validate'] = {}
            effects[effectName] = effectObject
        }
        effects['Validate'] = {}
    }

    bpm() {
        this.gifJockey.bpm.tap()
    }
    
    randomizeEffects(force=false) {
        this.shaderManager.randomizeParams(force)
    }

    takePhoto() {
        this.gifJockey.deselectAndTakeSnapshot()
        this.gifJockey.gifManager.playGif(this.gifJockey.gifManager.gifID-1)
    }

    newGIF() {
        this.gifJockey.gifManager.saveAndAddGif()
    }

    saveGIF() {
        this.gifJockey.gifManager.currentGif.preview(true)
    }

    buildMenu() {
        let currentItem: any = this.menu
        for(let property of this.currentPath) {
            currentItem = currentItem[property]
        }
        let currentList = $('#arrow-menu')
        currentList.empty()
        let isEffect = this.currentPath[this.currentPath.length-1] == "Effects"
        let isParameter = this.currentPath[this.currentPath.length-2] == "Effects"
        for(let property in currentItem) {
            let liJ = $('<li>').attr('data-name', property)
            let barJ = $('<div class="bar">')
            let textJ = $('<span class="text">').text(property)
            liJ.append(barJ)
            liJ.append(textJ)
            if(isEffect) {
                let effect = this.shaderManager.shaderParameters[property]
                if(effect != null && effect.on) {
                    liJ.addClass('enabled')
                }
            }
            if(isParameter) {
                let effectName = this.currentPath[this.currentPath.length-1]
                let propertyIsEnable = property == 'Enable'
                let effect = this.shaderManager.shaderParameters[effectName]
                if(effect != null) { // If effect and not Back or Validate
                    if( propertyIsEnable) {
                        if(effect.on) {
                            liJ.addClass('enabled')
                            textJ.text('Disable')
                        } else {
                            liJ.removeClass('enabled')
                        }
                    } else if(effect.parameters[property] != null) {
                        if(effect.parameters[property].type == 'color') {
                            liJ.addClass('enabled')
                            barJ.css({ 'background-color': effect.parameters[property].value })
                        } else {
                            let d = effect.parameters[property].max - effect.parameters[property].min
                            let p = 100 * (effect.parameters[property].value - effect.parameters[property].min) / d
                            barJ.css({'width': '' + p + '%' })
                            let valueJ = $('<span class="value">').text(''+effect.parameters[property].value.toFixed(2))
                            liJ.append(valueJ)
                        }
                    }
                }
            }
            liJ.click((event: JQueryMouseEventObject)=> this.onItemClick(event, currentItem, property, liJ))
            currentList.append(liJ)
        }
    }

    goBack() {
        if(this.currentPath.length>0) {
            this.currentPath.pop()
        }
        $('#arrow-menu').find('.selected').removeClass('selected')
        this.currentIndex = null
        this.buildMenu()
    }

    onItemClick(event: JQueryMouseEventObject, parent: any, itemName: string, liJ: JQuery) {
        if(typeof (parent[itemName]) === 'function') {
            let x = event != null ? (event.clientX - $(event.target.parentElement).position().left) / $(event.target.parentElement).width() : 0.5
            return parent[itemName](x, null, liJ)
        }
        if(itemName == 'Back' || itemName == 'Validate') {
            this.currentPath.pop()
        } else {
            this.currentPath.push(itemName)
        }
        $('#arrow-menu').find('.selected').removeClass('selected')
        this.currentIndex = null
        this.buildMenu()
    }
}

export let arrowMenu: ArrowMenu = null

export let initializeArrowMenu = (shaderManager: ShaderManager, gifJokey: any)=> {
    arrowMenu = new ArrowMenu(shaderManager, gifJokey)
    return arrowMenu
}