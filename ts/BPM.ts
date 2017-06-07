import { GUI, Controller } from "./GUI"
declare var stasilo: any

declare type GifGrave = {
	nextImage: ()=> void
}

export class BPM {
	gifGrave: GifGrave
	tapButton: Controller = null
	bpmSlider: Controller

	pause = false
	lastTap = Date.now()
	nTaps = 0
	MaxTapTime = 3000
	averageBPM = 120
	tapIntervalID:number = null
	tapTimeoutID:number = null
	song: any = null

	bpmDetectionFolder: GUI = null
	bpmDetectionButton: Controller = null
	autoBPM = true

	constructor(gifGrave: GifGrave) {
		this.gifGrave = gifGrave
	}

	isAutoBPM() {
		return this.song != null && this.autoBPM
	}

	isOnBeat() {
		return this.isAutoBPM() && this.song.isOnBeat() && !this.pause
	}

	createGUI(gui: GUI) {
		this.bpmDetectionButton = gui.addButton('Manual BPM', ()=> this.toggleBPMdetection())

		this.tapButton = gui.addButton('Tap', ()=> this.tap())
		this.bpmSlider = gui.addSlider('BPM', 120, 40, 250, 1).onChange((value)=>this.setBPMinterval(value, undefined, false))

		this.tapButton.setVisibility(!this.autoBPM)
		this.bpmSlider.setVisibility(!this.autoBPM)
		this.bpmDetectionFolder = gui.addFolder('BPM detection settings')

		let sliders:any = { sensitivity: null, analyserFFTSize: null, passFreq: null, visualizerFFTSize: null }

		let onSliderChange = () => {
			let sens = sliders.sensitivity.getValue()
			let analyserFFTSize = Math.pow(2, sliders.analyserFFTSize.getValue())
			let visualizerFFTSize = Math.pow(2, sliders.visualizerFFTSize.getValue())
			let passFreq = sliders.passFreq.getValue()

			this.song = new stasilo.BeatDetector( {	sens: sens,
								 				visualizerFFTSize: visualizerFFTSize, 
												analyserFFTSize:   analyserFFTSize,
												passFreq: passFreq })
		}

		sliders.sensitivity = this.bpmDetectionFolder.addSlider('Sensitivity', 5, 1, 16, 1).onChange(onSliderChange)
		sliders.analyserFFTSize = this.bpmDetectionFolder.addSlider('Analyser FFT Size', 13, 5, 15, 1).onChange(onSliderChange)
		sliders.passFreq = this.bpmDetectionFolder.addSlider('Bandpass Filter Frequency', 600, 1, 10000, 1).onChange(onSliderChange)
		sliders.visualizerFFTSize = this.bpmDetectionFolder.addSlider('Visualizer FFT Size', 7, 5, 15, 1).onChange(onSliderChange)

		onSliderChange()

		gui.addToggleButton('Pause', 'Resume', this, 'pause')
	}

	toggleBPMdetection() {
		this.autoBPM = !this.autoBPM

		this.bpmDetectionButton.setName(this.autoBPM ? 'Manual BPM' : 'Auto BPM')
		this.tapButton.setVisibility(!this.autoBPM)
		this.bpmSlider.setVisibility(!this.autoBPM)
		this.bpmDetectionFolder.setVisibility(this.autoBPM)
		if(this.autoBPM) {
			this.stopBPMinterval()
		} else if(this.tapIntervalID == null) {
			this.tapIntervalID = setInterval(()=>this.onInterval(), this.getInterval())
		}
	}

	stopBPMinterval() {
		if(this.tapIntervalID != null) {
			clearInterval(this.tapIntervalID)
			this.tapIntervalID = null
		}
	} 

	onInterval() {
		if(this.pause) {
			return
		}
		this.gifGrave.nextImage()
	}

	getInterval(bpm: number = this.averageBPM) {
		return 1 / (bpm / 60 / 1000)
	}

	setBPMinterval(bpm: number, newBPM:number=null, updateBpmSlider = true) {
		this.averageBPM = bpm
		this.stopBPMinterval()
		let delay = this.getInterval(bpm)
		this.gifGrave.nextImage()
		this.tapIntervalID = setInterval(()=>this.onInterval(), delay)
		if(updateBpmSlider) {
			this.tapButton.setName('Tapping' + (newBPM != null ? ' - Instant BPM: ' + newBPM.toFixed(2) : ''))
			this.bpmSlider.setValueNoCallback(bpm)
		}
	}

	stopTap() {
		if(this.isAutoBPM()) {
			return
		}
		this.nTaps = 0
		this.tapButton.setName('Tap')
	}

	tap() {

		if(this.isAutoBPM()) {
			return
		}

		this.nTaps++

		let now = Date.now()
		if(this.nTaps == 1) {
			this.lastTap = now
			this.tapButton.setName('Tapping')
			return
		}

		let newBPM = 60 / ( (now - this.lastTap) / 1000 )
		this.averageBPM = ( this.averageBPM * (this.nTaps - 1) + newBPM ) / this.nTaps

		console.log(this.averageBPM + ', ' + newBPM)
		this.setBPMinterval(this.averageBPM, newBPM)

		if(this.tapTimeoutID != null) {
			clearTimeout(this.tapTimeoutID)
		}
		this.tapTimeoutID = setTimeout(()=>this.stopTap(), this.MaxTapTime)

		this.lastTap = now
	}

}