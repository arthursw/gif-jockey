/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const GUI_1 = __webpack_require__(5);
const Webcam_1 = __webpack_require__(13);
const Renderer_1 = __webpack_require__(7);
const ShaderManager_1 = __webpack_require__(8);
const Gif_1 = __webpack_require__(6);
const BPM_1 = __webpack_require__(4);
// import { FilterManager } from "./Filters"
class GifJokey {
    constructor() {
        this.imageID = 0;
        this.viewer = null;
        // filterManager = new FilterManager(this)
        this.bpm = new BPM_1.BPM(this);
        this.gifManager = new Gif_1.GifManager(this);
        this.webcam = null;
        this.renderer = null;
        this.shaderManager = null;
        this.guiWasFocusedWhenPressedEnter = false;
        this.showGifThumbnails = false;
        this.previousIsOnBeat = false;
        console.log("Gif Grave");
        // Webcam.set({
        // 	width: 320,
        // 	height: 240,
        // 	image_format: 'jpeg',
        // 	jpeg_quality: 90,
        // 	swfURL: './lib/webcam.swf'
        // });
        // Webcam.attach( '#camera' );
        // // $('#camera').css({margin: 'auto'})
        // $("#takeSnapshot").click(this.takeSnapshot)
        // $("#createViewer").click(this.createViewer)
        $("#camera").click(() => this.deselectImages());
        $("#gif-thumbnails").mousedown(() => this.deselectImages());
        let thumbnailsJ = $("#thumbnails");
        thumbnailsJ.sortable(({ stop: () => this.sortImagesStop() }));
        thumbnailsJ.disableSelection();
        let outputsJ = $("#outputs");
        outputsJ.sortable(({ stop: () => this.gifManager.sortGifsStop() }));
        outputsJ.disableSelection();
        $(document).keydown((event) => this.onKeyDown(event));
        $('#gui').keydown((event) => {
            console.log(event.keyCode);
            if (event.keyCode == 13 || event.keyCode == 27) {
                console.log('prevent key down');
                event.preventDefault();
                event.stopPropagation();
                return -1;
            }
        });
        this.createGUI();
        this.webcam = new Webcam_1.Webcam(() => this.webcamLoaded());
        this.gifManager.addGif();
        this.toggleGifThumbnails(this.showGifThumbnails);
    }
    onKeyDown(event) {
        if (event.keyCode == 32) {
            this.takeSnapshot();
            event.preventDefault();
        }
        else if (event.keyCode == 13) {
            // Ignore if one of the dat.gui item is focused
            if (!this.gui.isFocused()) {
                this.bpm.tap();
            }
        }
        else if (event.keyCode == 27) {
            // Ignore if one of the dat.gui item is focused
            if (!this.gui.isFocused()) {
                this.bpm.stopTap();
            }
        }
        else if (String.fromCharCode(event.keyCode) == 'R') {
            this.shaderManager.randomizeParams();
        }
    }
    webcamLoaded() {
        this.renderer = new Renderer_1.Renderer(this.webcam, this.gui);
        this.shaderManager = new ShaderManager_1.ShaderManager(this.gui, this.renderer.camera, this.renderer.scene, this.renderer.renderer);
        this.renderer.setShaderManager(this.shaderManager);
        document.addEventListener('shaderChanged', () => this.updateFilteredImage());
        this.shaderManager.randomizeParams();
    }
    initialize() {
        this.animate();
    }
    createGUI() {
        this.gui = new GUI_1.GUI({ autoPlace: false, width: '100%' });
        document.getElementById('gui').appendChild(this.gui.getDomElement());
        this.gui.addButton('Take snapshot', () => this.takeSnapshot());
        this.gui.addButton('Create viewer', () => this.createViewer());
        this.gui.add(this, 'showGifThumbnails').name('Show Gifs').onChange((value) => this.toggleGifThumbnails(value));
        this.bpm.createGUI(this.gui);
        this.gifManager.createGUI(this.gui);
        // onSliderChange()
        // $(gui.getDomElement()).css({ width: '100%' })
    }
    toggleGifThumbnails(show) {
        let gifThumbnailsJ = $('#gif-thumbnails');
        let visible = gifThumbnailsJ.is(':visible');
        if (show && !visible) {
            gifThumbnailsJ.show();
            document.dispatchEvent(new Event('cameraResized'));
        }
        else if (!show && visible) {
            gifThumbnailsJ.hide();
            document.dispatchEvent(new Event('cameraResized'));
        }
    }
    setFilteredImage(imageJ, resultJ) {
        imageJ.siblings('.filtered').remove();
        let imageName = imageJ.attr('data-name');
        resultJ.insertBefore(imageJ);
        this.gifManager.setFilteredImage(imageName, resultJ.clone());
        // if(viewer != null) {
        // 	(<any>viewer).setFilteredImage(imageJ, resultJ)
        // }
    }
    removeImage(imageAlt) {
        this.gifManager.removeImage(imageAlt);
        $('#thumbnails').children("[data-name='" + imageAlt + "']").remove();
        // if(viewer != null) {
        // 	(<any>viewer).removeImage(imageAlt)
        // }
        this.nextImage();
    }
    selectImage(imageName) {
        let imagesToSelectJ = $('#thumbnails').children("[data-name='" + imageName + "']");
        let imagesAlreadySelected = imagesToSelectJ.hasClass('gg-selected');
        $('#thumbnails').children().removeClass('gg-selected');
        if (imagesAlreadySelected || imagesToSelectJ.length == 0) {
            this.renderer.setContent(this.webcam.video);
            return;
        }
        imagesToSelectJ.addClass('gg-selected');
        let imgJ = imagesToSelectJ.find('img.original');
        this.renderer.setContent(imgJ[0]);
        let filteredImageJ = imagesToSelectJ.find('img.filtered');
        if (filteredImageJ.length > 0) {
            let args = JSON.parse(filteredImageJ.attr('data-filter'));
            this.shaderManager.setShaderParameters(args);
        }
        // this.filterManager.setImage(imgJ)
    }
    deselectImages() {
        $('#thumbnails').children().removeClass('gg-selected');
        this.renderer.setContent(this.webcam.video);
        this.gifManager.deselectGif();
    }
    addImage(data_uri, canvas = null, context = null) {
        // display results in page
        let imageName = 'img-' + this.imageID;
        let imgJ = $('<img src="' + data_uri + '" data-name="' + imageName + '" alt="img-' + this.imageID + '">');
        this.imageID++;
        this.gifManager.addImage(imgJ.clone());
        let thumbnailImageJ = imgJ.clone();
        this.createThumbnail(thumbnailImageJ);
        imgJ.on('load', () => {
            // this.selectImage(imageName)
            this.nextImage();
        });
        // if(viewer != null) {
        // 	(<any>viewer).addImage(imgJ.clone())
        // }
        return thumbnailImageJ;
    }
    createThumbnail(imgJ, filteredImageJ = null) {
        let imageName = imgJ.attr('data-name');
        let liJ = $('<li class="ui-state-default gg-thumbnail" data-name="' + imageName + '">');
        let buttonJ = $('<button type="button" class="gg-small-btn close-btn">');
        let spanJ = $('<span class="ui-icon ui-icon-closethick">');
        let divJ = $('<div class="gg-thumbnail-container">');
        buttonJ.append(spanJ);
        divJ.append(imgJ.addClass('gg-hidden original'));
        divJ.append(filteredImageJ);
        liJ.append(divJ);
        liJ.append(buttonJ);
        buttonJ.click(() => this.removeImage(imageName));
        liJ.mousedown((event) => {
            setTimeout(() => this.selectImage(imageName), 0);
            event.preventDefault();
            event.stopPropagation();
            return -1;
        }); // add timeout to not to disturbe draggable
        $('#thumbnails').append(liJ);
    }
    takeSnapshot() {
        // let filteredDataURL = canvas.toDataURL()
        let imageDataURL = this.webcam.getImage();
        let imageJ = this.addImage(imageDataURL);
        this.updateFilteredImage(imageJ);
        // Webcam.snap((data_uri: string, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D)=>this.addImage(data_uri, canvas, context))
    }
    getSelectedImage() {
        return $('#thumbnails').children('.gg-selected').first();
    }
    updateFilteredImage(imageJ = null) {
        if (imageJ == null) {
            imageJ = this.getSelectedImage().find('img.original');
        }
        let filtered = this.renderer.getFilteredImage();
        let filteredImage = filtered.image;
        let shaderParameters = filtered.shaderParameters;
        filteredImage.className = 'filtered';
        let filteredImageJ = $(filteredImage);
        let imageName = imageJ.attr('data-name');
        filteredImageJ.attr('data-name', imageName);
        filteredImageJ.attr('data-filter', JSON.stringify(shaderParameters));
        this.setFilteredImage(imageJ, filteredImageJ);
    }
    nextImage() {
        this.gifManager.nextImage();
        if (this.viewer != null && this.viewer.hasOwnProperty('nextImage')) {
            this.viewer.nextImage();
        }
    }
    // let sortImagesStart = (event: Event, ui: any)=> {
    // 	let imageName = $(ui.item).attr('data-name')
    // 	selectImage(imageName)
    // }
    sortImagesStop() {
        let thumbnailsJ = $('#thumbnails').children();
        let imageNames = [];
        thumbnailsJ.each(function (index, element) {
            imageNames.push($(element).attr('data-name'));
        });
        this.gifManager.sortImages(imageNames);
    }
    createViewer() {
        let windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
        this.viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures);
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.bpm.isAutoBPM()) {
            return;
        }
        let isOnBeat = this.bpm.isOnBeat();
        if (isOnBeat && !this.previousIsOnBeat) {
            this.nextImage();
        }
        this.previousIsOnBeat = isOnBeat;
    }
    emptyThumbnails() {
        $('#thumbnails').empty();
        $('#thumbnails').append($('<li>').addClass('placeholder'));
    }
    setGif(gif) {
        this.emptyThumbnails();
        for (let imagePairJ of gif.getImagePairsJ()) {
            this.createThumbnail(imagePairJ.filter('.original'), imagePairJ.filter('.filtered'));
        }
        this.selectImage(gif.getFirstImageJ().attr('data-name'));
        this.nextImage();
    }
    playGif(gif) {
        if (this.viewer != null) {
            this.viewer.setGif(gif.containerJ.find('img.filtered').clone());
        }
    }
}
let gifJokey = null;
document.addEventListener("DOMContentLoaded", function (event) {
    gifJokey = new GifJokey();
    gifJokey.initialize();
});


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BPM {
    constructor(gifJockey) {
        this.tapButton = null;
        this.pause = false;
        this.lastTap = Date.now();
        this.nTaps = 0;
        this.MaxTapTime = 3000;
        this.averageBPM = 120;
        this.tapIntervalID = null;
        this.tapTimeoutID = null;
        this.song = null;
        this.bpmDetectionFolder = null;
        this.bpmDetectionButton = null;
        this.autoBPM = true;
        this.gifJockey = gifJockey;
    }
    isAutoBPM() {
        return this.song != null && this.autoBPM;
    }
    isOnBeat() {
        return this.isAutoBPM() && this.song.isOnBeat() && !this.pause;
    }
    createGUI(gui) {
        this.bpmDetectionButton = gui.addButton('Manual BPM', () => this.toggleBPMdetection());
        this.tapButton = gui.addButton('Tap', () => this.tap());
        this.bpmSlider = gui.addSlider('BPM', 120, 40, 250, 1).onChange((value) => this.setBPMinterval(value, undefined, false));
        this.tapButton.setVisibility(!this.autoBPM);
        this.bpmSlider.setVisibility(!this.autoBPM);
        this.bpmDetectionFolder = gui.addFolder('BPM detection settings');
        let sliders = { sensitivity: null, analyserFFTSize: null, passFreq: null, visualizerFFTSize: null };
        let onSliderChange = () => {
            let sens = sliders.sensitivity.getValue();
            let analyserFFTSize = Math.pow(2, sliders.analyserFFTSize.getValue());
            let visualizerFFTSize = Math.pow(2, sliders.visualizerFFTSize.getValue());
            let passFreq = sliders.passFreq.getValue();
            this.song = new stasilo.BeatDetector({ sens: sens,
                visualizerFFTSize: visualizerFFTSize,
                analyserFFTSize: analyserFFTSize,
                passFreq: passFreq });
        };
        sliders.sensitivity = this.bpmDetectionFolder.addSlider('Sensitivity', 14, 1, 16, 1).onChange(onSliderChange);
        sliders.analyserFFTSize = this.bpmDetectionFolder.addSlider('Analyser FFT Size', 14, 5, 15, 1).onChange(onSliderChange);
        sliders.passFreq = this.bpmDetectionFolder.addSlider('Bandpass Filter Frequency', 600, 1, 10000, 1).onChange(onSliderChange);
        sliders.visualizerFFTSize = this.bpmDetectionFolder.addSlider('Visualizer FFT Size', 7, 5, 15, 1).onChange(onSliderChange);
        onSliderChange();
        gui.addToggleButton('Pause', 'Resume', this, 'pause');
    }
    toggleBPMdetection() {
        this.autoBPM = !this.autoBPM;
        this.bpmDetectionButton.setName(this.autoBPM ? 'Manual BPM' : 'Auto BPM');
        this.tapButton.setVisibility(!this.autoBPM);
        this.bpmSlider.setVisibility(!this.autoBPM);
        this.bpmDetectionFolder.setVisibility(this.autoBPM);
        if (this.autoBPM) {
            this.stopBPMinterval();
        }
        else if (this.tapIntervalID == null) {
            this.tapIntervalID = setInterval(() => this.onInterval(), this.getInterval());
        }
    }
    stopBPMinterval() {
        if (this.tapIntervalID != null) {
            clearInterval(this.tapIntervalID);
            this.tapIntervalID = null;
        }
    }
    onInterval() {
        if (this.pause) {
            return;
        }
        this.gifJockey.nextImage();
    }
    getInterval(bpm = this.averageBPM) {
        return 1 / (bpm / 60 / 1000);
    }
    setBPMinterval(bpm, newBPM = null, updateBpmSlider = true) {
        this.averageBPM = bpm;
        this.stopBPMinterval();
        let delay = this.getInterval(bpm);
        this.gifJockey.nextImage();
        this.tapIntervalID = setInterval(() => this.onInterval(), delay);
        if (updateBpmSlider) {
            this.tapButton.setName('Tapping' + (newBPM != null ? ' - Instant BPM: ' + newBPM.toFixed(2) : ''));
            this.bpmSlider.setValueNoCallback(bpm);
        }
    }
    stopTap() {
        if (this.isAutoBPM()) {
            return;
        }
        this.nTaps = 0;
        this.tapButton.setName('Tap');
    }
    tap() {
        if (this.isAutoBPM()) {
            return;
        }
        this.nTaps++;
        let now = Date.now();
        if (this.tapTimeoutID != null) {
            clearTimeout(this.tapTimeoutID);
        }
        this.tapTimeoutID = setTimeout(() => this.stopTap(), this.MaxTapTime);
        if (this.nTaps == 1) {
            this.lastTap = now;
            this.tapButton.setName('Tapping');
            return;
        }
        let newBPM = 60 / ((now - this.lastTap) / 1000);
        this.averageBPM = (this.averageBPM * (this.nTaps - 1) + newBPM) / this.nTaps;
        console.log(this.averageBPM + ', ' + newBPM);
        this.setBPMinterval(this.averageBPM, newBPM);
        this.lastTap = now;
    }
}
exports.BPM = BPM;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    constructor(controller) {
        this.controller = controller;
    }
    getDomElement() {
        return this.controller.domElement;
    }
    getParentDomElement() {
        return this.getDomElement().parentElement.parentElement;
    }
    hide() {
        $(this.getParentDomElement()).hide();
    }
    show() {
        $(this.getParentDomElement()).show();
    }
    setVisibility(visible) {
        if (visible) {
            this.show();
        }
        else {
            this.hide();
        }
    }
    remove() {
        this.controller.remove();
    }
    contains(element) {
        return $.contains(this.getParentDomElement(), element);
    }
    getProperty() {
        return this.controller.property;
    }
    getName() {
        return this.controller.property;
    }
    getValue() {
        return this.controller.object[this.controller.property];
    }
    onChange(callback) {
        this.controller.onChange(callback);
        return this;
    }
    onFinishChange(callback) {
        this.controller.onFinishChange(callback);
        return this;
    }
    setValue(value) {
        this.controller.setValue(value);
        return this;
    }
    setValueNoCallback(value) {
        this.controller.object[this.controller.property] = value;
        this.controller.updateDisplay();
        return this;
    }
    max(value) {
        this.controller.max(value);
        return this;
    }
    min(value) {
        this.controller.min(value);
        return this;
    }
    step(value) {
        this.controller.step(value);
        return this;
    }
    updateDisplay() {
        this.controller.updateDisplay();
        return this;
    }
    options(options) {
        return this.controller.options(options);
    }
    listen() {
        this.controller.listen();
        return this;
    }
    setName(name) {
        $(this.controller.domElement.parentElement).find('span.property-name').html(name);
        return this;
    }
    name(name) {
        this.controller.name(name);
        return this;
    }
}
exports.Controller = Controller;
class GUI {
    constructor(options = null, folder = null) {
        this.gui = folder != null ? folder : new dat.GUI(options);
    }
    getDomElement() {
        return this.gui.domElement;
    }
    hide() {
        $(this.getDomElement()).hide();
    }
    show() {
        $(this.getDomElement()).show();
    }
    setVisibility(visible) {
        if (visible) {
            this.show();
        }
        else {
            this.hide();
        }
    }
    add(object, propertyName, minOrArray = null, max = null) {
        return new Controller(this.gui.add(object, propertyName, minOrArray, max));
    }
    addColor(object, propertyName) {
        return new Controller(this.gui.addColor(object, propertyName));
    }
    addButton(name, callback, object = {}) {
        let nameNoSpaces = name.replace(/\s+/g, '');
        object[nameNoSpaces] = callback;
        let controller = new Controller(this.gui.add(object, nameNoSpaces));
        if (name != nameNoSpaces) {
            controller.setName(name);
        }
        return controller;
    }
    addToggleButton(name, toggledName, object = {}, propertyName = '_toggled', callback = null) {
        let defaultValue = object[propertyName];
        let controller = null;
        let newCallback = () => {
            object[propertyName] = !object[propertyName];
            controller.setName(object[propertyName] == defaultValue ? name : toggledName);
            if (callback != null) {
                callback.apply(object, [object[propertyName]]);
            }
        };
        controller = this.addButton(name, newCallback, object);
        return controller;
    }
    addFileSelectorButton(name, fileType, callback) {
        let divJ = $("<input data-name='file-selector' type='file' class='form-control' name='file[]'  accept='" + fileType + "'/>");
        let button = this.addButton(name, () => divJ.click());
        $(button.getDomElement()).append(divJ);
        divJ.hide();
        divJ.change(callback);
        return button;
    }
    addSlider(name, value, min, max, step = null) {
        let object = {};
        let nameNoSpaces = name.replace(/\s+/g, '');
        object[nameNoSpaces] = value;
        let slider = this.add(object, nameNoSpaces, min, max);
        if (name != nameNoSpaces) {
            slider.setName(name);
        }
        if (step != null) {
            slider.step(step);
        }
        return slider;
    }
    addSelect(name, choices, defaultChoice) {
        let object = {};
        let nameNoSpaces = name.replace(/\s+/g, '');
        object[nameNoSpaces] = defaultChoice;
        let controller = this.add(object, nameNoSpaces, choices);
        if (name != nameNoSpaces) {
            controller.setName(name);
        }
        return controller;
    }
    addFolder(name) {
        return new GUI(null, this.gui.addFolder(name));
    }
    getControllers() {
        return this.gui.__controllers;
    }
    open() {
        this.gui.open();
        return this;
    }
    close() {
        this.gui.close();
        return this;
    }
    isFocused() {
        return $('.dg.main').find(document.activeElement).length > 0;
    }
}
exports.GUI = GUI;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Gif {
    constructor(containerJ) {
        this.hasPreview = false;
        this.containerJ = containerJ;
        this.imageIndex = 0;
    }
    // setSize(imgJ: any) {
    // 	this.containerJ.width(imgJ[0].naturalWidth)
    // 	this.containerJ.height(imgJ[0].naturalHeight)
    // }
    getImageContainerJ(name) {
        return this.containerJ.find('div[data-name="' + name + '"]');
    }
    getImageJ(name) {
        return this.containerJ.find('img[data-name="' + name + '"]');
    }
    getFilteredImagesJ() {
        return this.containerJ.find('img.filtered');
    }
    getFirstImageJ() {
        return this.containerJ.find('img.original').first();
    }
    addImage(imgJ, filteredImageJ = null) {
        let divJ = $('<div class="gg-image-container">');
        divJ.attr('data-name', imgJ.attr('data-name'));
        divJ.append(imgJ.addClass('gg-hidden original'));
        if (filteredImageJ != null) {
            divJ.append(filteredImageJ);
        }
        this.containerJ.append(divJ);
    }
    setFilteredImage(imageName, resultJ) {
        let originalImageJ = this.getImageJ(imageName);
        originalImageJ.siblings('.filtered').remove();
        resultJ.insertBefore(originalImageJ);
        resultJ.css({ width: '100%' });
    }
    replaceImage(oldImageName, newImageJ) {
        newImageJ.css({ width: '100%' });
        this.getImageJ(oldImageName).replaceWith(newImageJ);
    }
    removeImage(imageName) {
        this.getImageContainerJ(imageName).remove();
    }
    nextImage() {
        let imagesJ = this.containerJ.children();
        this.imageIndex++;
        if (this.imageIndex >= imagesJ.length) {
            this.imageIndex = 0;
        }
        // avoid to use hide() / show() because it affects the size of dom element in chrome which is a problem with the thumbnail scrollbar
        // imagesJ.css({opacity: 0})
        // $(imagesJ[this.imageIndex]).css({opacity: 1})
        imagesJ.hide();
        $(imagesJ[this.imageIndex]).show();
    }
    sortImages(imageNames) {
        let imageContainersJ = this.containerJ.children();
        for (let imageName of imageNames) {
            let imageContainerJ = this.containerJ.children('div[data-name="' + imageName + '"]');
            this.containerJ.append(imageContainerJ);
        }
    }
    getImagePairsJ() {
        let imagePairsJ = [];
        for (let child of this.containerJ.children()) {
            imagePairsJ.push($(child).find('img').clone());
        }
        return imagePairsJ;
    }
    setGif(gif) {
        this.empty();
        let imagePairsJ = gif.getImagePairsJ();
        for (let imagePairJ of imagePairsJ) {
            this.addImage(imagePairJ.filter('.original'), imagePairJ.filter('.filtered'));
        }
    }
    empty() {
        this.containerJ.empty();
    }
    preview(save = false) {
        let imagesJ = this.getFilteredImagesJ().toArray();
        if (imagesJ.length == 0) {
            return;
        }
        let width = imagesJ[0].naturalWidth;
        let height = imagesJ[0].naturalHeight;
        let interval = Gif.gifManager.gifJockey.bpm.getInterval() / 1000;
        gifshot.createGIF({
            gifWidth: width,
            gifHeight: height,
            interval: interval,
            images: imagesJ,
            sampleInterval: Gif.gifManager.gifQuality
        }, (obj) => {
            if (!obj.error) {
                var image = obj.image, animatedImage = document.createElement('img');
                animatedImage.src = image;
                let aJ = $('<a download="gif.gif" href="' + image + '">');
                aJ.append(animatedImage);
                $('#gif-result').empty().append(aJ);
                this.hasPreview = true;
                if (save) {
                    aJ[0].click();
                }
            }
        });
    }
}
exports.Gif = Gif;
class GifManager {
    constructor(gifJockey) {
        this.gifID = 0;
        this.gifs = new Map();
        this.currentGif = null;
        this.gifQuality = 10;
        this.getGifContainer = () => {
            return this.currentGif.containerJ.parentUntil('li.gg-thumbnail');
        };
        this.sortGifsStop = () => {
        };
        this.gifJockey = gifJockey;
        Gif.gifManager = this;
        // this.toggleThumbnails(false)
    }
    createGUI(gui) {
        gui.addButton('Add gif', () => this.addGif());
        gui.addSlider('Gif degradation', this.gifQuality, 1, 5000, 1).onChange((value) => { this.gifQuality = value; });
        gui.addButton('Save gif', () => this.currentGif.preview(true));
        // gui.addButton('Save gif', ()=> {
        // 	if(!this.currentGif.hasPreview) {
        // 		this.currentGif.preview(true)
        // 	} else {
        // 		let linkJ = $('#result').find('a')
        // 		linkJ[0].click()
        // 	}
        // })
        this.gif = new Gif($('#result'));
    }
    removeImage(imageName) {
        this.gif.removeImage(imageName);
        this.currentGif.removeImage(imageName);
    }
    addImage(imgJ) {
        this.gif.addImage(imgJ.clone());
        this.currentGif.addImage(imgJ.clone());
    }
    setFilteredImage(imageName, resultJ) {
        this.gif.setFilteredImage(imageName, resultJ.clone());
        this.currentGif.setFilteredImage(imageName, resultJ.clone());
    }
    nextImage() {
        this.gif.nextImage();
        for (let [gifName, gif] of this.gifs) {
            gif.nextImage();
        }
    }
    sortImages(imageNames) {
        this.gif.sortImages(imageNames);
        this.currentGif.sortImages(imageNames);
    }
    addGif() {
        this.gifJockey.emptyThumbnails();
        this.gif.empty();
        let currentGifJ = $('<li class="gg-thumbnail" data-name="gif-' + this.gifID + '">');
        let closeButtonJ = $('<button type="button" class="gg-small-btn close-btn">');
        let closeSpanJ = $('<span class="ui-icon ui-icon-closethick">');
        let playButtonJ = $('<button type="button" class="gg-small-btn play-btn">');
        let playSpanJ = $('<span class="ui-icon ui-icon-play">');
        let divJ = $('<div class="gg-thumbnail-container">');
        closeButtonJ.append(closeSpanJ);
        playButtonJ.append(playSpanJ);
        currentGifJ.append(divJ);
        currentGifJ.append(closeButtonJ);
        currentGifJ.append(playButtonJ);
        let currentGifID = this.gifID;
        closeButtonJ.click(() => this.removeGif(currentGifID));
        playButtonJ.mousedown((event) => {
            $('#outputs').find('.gg-small-btn.play-btn').removeClass('playing');
            playButtonJ.addClass('playing');
            this.playGif(currentGifID);
            event.stopPropagation();
            return -1;
        });
        currentGifJ.mousedown((event) => {
            this.selectGif(currentGifID);
            event.stopPropagation();
            event.preventDefault();
            return -1;
        });
        $('#outputs').append(currentGifJ);
        this.currentGif = new Gif(divJ);
        this.gifs.set(this.gifID, this.currentGif);
        this.gifID++;
    }
    removeGif(gifID) {
        $('#outputs').find('[data-name="gif-' + gifID + '"]').remove();
    }
    toggleThumbnails(show) {
        let thumbnailsJ = $('#thumbnails');
        let thumbnailsVisible = thumbnailsJ.is(':visible');
        if (show && !thumbnailsVisible) {
            thumbnailsJ.show();
            document.dispatchEvent(new Event('cameraResized'));
        }
        else if (!show && thumbnailsVisible) {
            thumbnailsJ.hide();
            document.dispatchEvent(new Event('cameraResized'));
        }
        // let resultJ = $('#result')
        // let resultVisible = resultJ.is(':visible')
        // if(show && !resultVisible) {
        // 	resultJ.show()
        // } else if (!show && resultVisible) {
        // 	resultJ.hide()
        // }
    }
    selectGif(gifID) {
        let gifsToSelectJ = $('#outputs').children("[data-name='gif-" + gifID + "']");
        let gifsAlreadySelected = gifsToSelectJ.hasClass('gg-selected');
        $('#outputs').children().removeClass('gg-selected');
        if (gifsAlreadySelected || gifsToSelectJ.length == 0) {
            this.toggleThumbnails(false);
            return;
        }
        gifsToSelectJ.addClass('gg-selected');
        this.currentGif = this.gifs.get(gifID);
        this.gif.setGif(this.currentGif);
        this.gifJockey.setGif(this.currentGif);
        this.toggleThumbnails(true);
    }
    deselectGif() {
        $('#outputs').children().removeClass('gg-selected');
        this.toggleThumbnails(false);
    }
    playGif(gifID) {
        let gif = this.gifs.get(gifID);
        this.gifJockey.playGif(gif);
    }
}
exports.GifManager = GifManager;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Renderer {
    constructor(webcam, gui) {
        let cameraJ = $('#camera');
        this.setCameraSize();
        this.webcam = webcam;
        let width = webcam.width;
        let height = webcam.height;
        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        this.renderer.setSize(width, height);
        let size = this.computeRendererSize(webcam, cameraJ);
        this.setCanvasSize(size.width, size.height);
        let container = document.getElementById('camera');
        container.appendChild(this.renderer.domElement);
        this.setContent(webcam.video);
        this.camera.position.z = 5;
        window.addEventListener('resize', () => this.windowResize(), false);
        document.addEventListener('cameraResized', () => this.windowResize());
        requestAnimationFrame(() => this.render());
        this.centerOnRectangle(this.webcam.width, this.webcam.height);
        setTimeout(() => this.windowResize(), 0);
    }
    setCameraSize() {
        let cameraJ = $('#camera');
        cameraJ.css({ width: 0, height: 0 });
        let parentJ = cameraJ.parent();
        cameraJ.css({
            width: '' + parentJ.width() + 'px',
            height: '' + parentJ.height() + 'px',
            display: 'flex',
            'align-items': 'center',
            'justify-conten': 'center',
        });
    }
    setContent(content) {
        this.texture = new THREE.Texture(content);
        this.material = new THREE.MeshBasicMaterial({ map: this.texture });
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        let geometry = new THREE.PlaneGeometry(content.width, content.height);
        if (this.mesh != null) {
            this.scene.remove(this.mesh);
        }
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.scene.add(this.mesh);
    }
    setShaderManager(shaderManager) {
        this.shaderManager = shaderManager;
    }
    getDomElement() {
        return this.renderer.domElement;
    }
    getFilteredImage() {
        let canvas = this.getDomElement();
        let result = new Image();
        result.src = canvas.toDataURL();
        return { image: result, shaderParameters: this.shaderManager.getShaderParameters() };
    }
    computeRendererSize(webcam, cameraJ) {
        this.setCameraSize();
        let cameraWidth = cameraJ.width();
        let cameraHeight = cameraJ.height();
        let cameraRatio = cameraWidth / cameraHeight;
        let webcamRatio = webcam.width / webcam.height;
        let width = null;
        let height = null;
        if (cameraRatio < webcamRatio) {
            width = cameraWidth;
            height = cameraWidth / webcamRatio;
        }
        else {
            width = cameraHeight * webcamRatio;
            height = cameraHeight;
        }
        return { width: width, height: height };
    }
    setCanvasSize(width, height) {
        $(this.renderer.domElement).css({ width: '' + width + 'px', height: '' + height + 'px', margin: 'auto', display: 'block' });
    }
    centerOnRectangle(width, height) {
        let margin = 0;
        let ratio = Math.max((width + margin) / this.renderer.getSize().width, (height + margin) / this.renderer.getSize().height);
        this.camera.zoom = 1 / ratio;
        this.camera.updateProjectionMatrix();
    }
    windowResize() {
        let cameraJ = $('#camera');
        this.setCameraSize();
        let size = this.computeRendererSize(this.webcam, cameraJ);
        this.setCanvasSize(size.width, size.height);
    }
    render() {
        requestAnimationFrame(() => this.render());
        if (this.webcam.streaming) {
            this.texture.needsUpdate = true;
        }
        this.shaderManager.animate();
        // this.renderer.render( this.scene, this.camera )
    }
}
exports.Renderer = Renderer;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const BadTV_1 = __webpack_require__(9);
const Static_1 = __webpack_require__(12);
const Film_1 = __webpack_require__(11);
const DotMatrix_1 = __webpack_require__(10);
class ShaderManager {
    constructor(gui, camera, scene, renderer) {
        this.shaderParameters = {
            badTV: {
                name: 'Bad TV',
                shader: BadTV_1.BadTVShader,
                on: true,
                time: true,
                parameters: {
                    distortion: {
                        name: 'Thick distrotion',
                        value: 3.0,
                        min: 0.1,
                        max: 20,
                        randomMin: 0.1,
                        randomMax: 3,
                        step: 0.1
                    },
                    distortion2: {
                        name: 'Fine distrotion',
                        value: 1.0,
                        min: 0.1,
                        max: 20,
                        randomMin: 0.1,
                        randomMax: 7,
                        step: 0.1
                    },
                    speed: {
                        name: 'Distrotion speed',
                        value: 0.3,
                        min: 0,
                        max: 1,
                        randomMin: 0,
                        randomMax: 4,
                        step: 0.01
                    },
                    rollSpeed: {
                        name: 'Roll speed',
                        value: 0.1,
                        min: 0,
                        max: 1,
                        randomMin: 0,
                        randomMax: 0.2,
                        step: 0.01
                    }
                }
            },
            static: {
                name: 'Static',
                shader: Static_1.StaticShader,
                on: true,
                time: true,
                parameters: {
                    amount: {
                        name: 'Amount',
                        value: 0.5,
                        min: 0,
                        max: 1,
                        randomMin: 0,
                        randomMax: 0.2,
                        step: 0.01
                    },
                    size: {
                        name: 'Size',
                        value: 4,
                        min: 1,
                        max: 100,
                        randomMin: 1,
                        randomMax: 20,
                        step: 1
                    }
                }
            },
            rgbShift: {
                name: 'RGB Shift',
                shader: THREE.RGBShiftShader,
                on: true,
                parameters: {
                    amount: {
                        name: 'Amount',
                        value: 0.005,
                        min: 0,
                        max: 0.1,
                        randomMin: 0,
                        randomMax: 0.03,
                        step: 0.01
                    },
                    angle: {
                        name: 'Angle',
                        value: 180,
                        min: 0,
                        max: 360,
                        step: 1,
                        getValue: (value) => 2 * Math.PI * value / 360
                    }
                }
            },
            scanLine: {
                name: 'Scanlines',
                shader: Film_1.FilmShader,
                on: true,
                time: true,
                parameters: {
                    sCount: {
                        name: 'Count',
                        value: 800,
                        min: 50,
                        max: 10000,
                        step: 1
                    },
                    sIntensity: {
                        name: 'S intensity',
                        value: 0.9,
                        min: 0,
                        max: 2,
                        step: 0.1
                    },
                    nIntensity: {
                        name: 'N intensity',
                        value: 0.4,
                        min: 0,
                        max: 2,
                        step: 0.1
                    }
                }
            },
            bleach: {
                name: 'Bleach',
                shader: THREE.BleachBypassShader,
                on: false,
                parameters: {
                    opacity: {
                        name: 'Opacity',
                        value: 1,
                        min: 0,
                        max: 10,
                        randomMin: 0,
                        randomMax: 1.7,
                        step: 0.1
                    }
                }
            },
            brightnessContrast: {
                name: 'Brightness & Contrast',
                shader: THREE.BrightnessContrastShader,
                on: false,
                parameters: {
                    brightness: {
                        name: 'Brightness',
                        value: 0.25,
                        min: 0,
                        max: 1,
                        randomMin: 0,
                        randomMax: 0.2,
                        step: 0.01
                    },
                    contrast: {
                        name: 'Contrast',
                        value: 0.7,
                        min: 0,
                        max: 1,
                        step: 0.01
                    }
                }
            },
            colorify: {
                name: 'Colorify',
                shader: THREE.ColorifyShader,
                on: false,
                parameters: {
                    color: {
                        name: 'Color',
                        type: 'color',
                        value: '#FFEE44'
                    }
                }
            },
            dotScreen: {
                name: 'Dot Screen',
                shader: THREE.DotScreenShader,
                on: false,
                parameters: {
                    tSize: {
                        name: 'Size',
                        value: 256,
                        min: 2,
                        max: 1024,
                        randomMin: 256,
                        randomMax: 512,
                        step: 1,
                        getValue: (value) => new THREE.Vector2(value, value)
                    },
                    angle: {
                        name: 'Angle',
                        value: 180,
                        min: 0,
                        max: 360,
                        step: 1,
                        getValue: (value) => 2 * Math.PI * value / 360
                    },
                    scale: {
                        name: 'Scale',
                        value: 1,
                        min: 0.1,
                        max: 10,
                        randomMin: 1,
                        randomMax: 1,
                        step: 0.01
                    }
                }
            },
            dotMatrix: {
                name: 'Dot Matrix',
                shader: DotMatrix_1.DotMatrix,
                on: false,
                parameters: {
                    sharpness: {
                        name: 'Sharpness',
                        value: 0.7,
                        min: 0,
                        max: 1,
                        step: 0.01
                    },
                    gridSize: {
                        name: 'Grid Size',
                        value: 10,
                        min: 0,
                        max: 200,
                        randomMin: 50,
                        randomMax: 200,
                        step: 1
                    },
                    dotSize: {
                        name: 'Dot Size',
                        value: 0.1,
                        min: 0,
                        max: 1,
                        randomMin: 0,
                        randomMax: 0.5,
                        step: 0.1
                    }
                }
            },
            edgeShader: {
                name: 'Edge',
                shader: THREE.EdgeShader2,
                on: false,
                parameters: {
                    aspect: {
                        name: 'Aspect',
                        value: 512,
                        min: 2,
                        max: 1024,
                        randomMin: 300,
                        randomMax: 512,
                        step: 1,
                        getValue: (value) => new THREE.Vector2(value, value)
                    }
                }
            },
            // verticalTiltShift: {
            // 	name: 'Tilt Shift',
            // 	shader: (<any>THREE).VerticalTiltShiftShader,
            // 	on: false,
            // 	parameters: {
            // 		v: {
            // 			name: 'Amount',
            // 			value: 1 / 512,
            // 			min: 2,
            // 			max: 1024,
            // 			step: 1
            // 		},
            // 		r: {
            // 			name: 'position',
            // 			value: 0.5,
            // 			min: 0,
            // 			max: 1,
            // 			step: 0.01
            // 		}
            // 	}
            // },
            hueSaturation: {
                name: 'Hue & Saturation',
                shader: THREE.HueSaturationShader,
                on: false,
                parameters: {
                    hue: {
                        name: 'Hue',
                        value: 0,
                        min: -1,
                        max: 1,
                        step: 0.01
                    },
                    saturation: {
                        name: 'Saturation',
                        value: 0,
                        min: -1,
                        max: 1,
                        step: 0.01
                    }
                }
            },
            kaleido: {
                name: 'Kaleido',
                shader: THREE.KaleidoShader,
                on: false,
                parameters: {
                    sides: {
                        name: 'Sides',
                        value: 6,
                        min: 1,
                        max: 12,
                        step: 1
                    },
                    angle: {
                        name: 'Angle',
                        value: 180,
                        min: 0,
                        max: 360,
                        step: 1,
                        getValue: (value) => 2 * Math.PI * value / 360
                    }
                }
            },
            mirror: {
                name: 'Mirror',
                shader: THREE.MirrorShader,
                on: false,
                parameters: {
                    side: {
                        name: 'Side',
                        value: 1,
                        min: 0,
                        max: 3,
                        step: 1
                    }
                }
            },
            sepiaShader: {
                name: 'Sepia',
                shader: THREE.SepiaShader,
                on: false,
                parameters: {
                    amount: {
                        name: 'Amount',
                        value: 1,
                        min: 0,
                        max: 1,
                        step: 0.01
                    }
                }
            },
            vignetteShader: {
                name: 'Vignette',
                shader: THREE.VignetteShader,
                on: false,
                parameters: {
                    offset: {
                        name: 'Offset',
                        value: 1,
                        min: 0,
                        max: 1,
                        step: 0.01
                    },
                    darkness: {
                        name: 'Darkness',
                        value: 1,
                        min: 0,
                        max: 2,
                        step: 0.01
                    }
                }
            }
        };
        this.shaderChangedTimeout = null;
        this.shaders = new Array();
        this.shaderTime = 0;
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.renderPass = new THREE.RenderPass(scene, camera);
        let onParamsChange = () => this.onParamsChange();
        let onToggleShaders = () => this.onToggleShaders();
        for (let shaderName in this.shaderParameters) {
            let shaderObject = this.shaderParameters[shaderName];
            let folder = gui.addFolder(shaderObject.name);
            this.shaders.push({ pass: new THREE.ShaderPass(shaderObject.shader), object: shaderObject, folder: folder });
            folder.add(shaderObject, 'on').name('On').onChange(onToggleShaders);
            for (let propertyName in shaderObject.parameters) {
                let propertiesObject = shaderObject.parameters[propertyName];
                if (propertiesObject.type != null && propertiesObject.type == 'color') {
                    folder.addColor(propertiesObject, 'value').onChange(onParamsChange);
                }
                else {
                    folder.add(propertiesObject, 'value', propertiesObject.min, propertiesObject.max).step(propertiesObject.step).setName(propertiesObject.name).onChange(onParamsChange);
                }
            }
            folder.open();
        }
        this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
        this.onParamsChange(false);
        this.onToggleShaders();
    }
    onToggleShaders(dispatchEvent = true) {
        //Add Shader Passes to Composer
        //order is important 
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(this.renderPass);
        for (let shader of this.shaders) {
            if (shader.object.on) {
                this.composer.addPass(shader.pass);
            }
        }
        this.composer.addPass(this.copyPass);
        this.copyPass.renderToScreen = true;
        if (dispatchEvent) {
            this.dispatchChange();
        }
    }
    dispatchChange() {
        if (this.shaderChangedTimeout != null) {
            clearTimeout(this.shaderChangedTimeout);
        }
        this.shaderChangedTimeout = setTimeout(() => document.dispatchEvent(new Event('shaderChanged')), 500);
    }
    onParamsChange(dispatchEvent = true) {
        for (let shader of this.shaders) {
            for (let propertyName in shader.object.parameters) {
                let propertiesObject = shader.object.parameters[propertyName];
                shader.pass.uniforms[propertyName].value = propertiesObject.getValue != null ?
                    propertiesObject.getValue(propertiesObject.value) :
                    propertiesObject.type != null && propertiesObject.type == 'color' ?
                        new THREE.Color(propertiesObject.value) : propertiesObject.value;
            }
        }
        if (dispatchEvent) {
            this.dispatchChange();
        }
    }
    getRandomOnInterval(min, max) {
        return min + (max - min) * Math.random();
    }
    getRandomColor() {
        return '#' + Math.random().toString(16).substr(2, 6);
    }
    randomizeParams() {
        let shaderIndices = [];
        let nShadersToPick = 3;
        for (let i = 0; i < nShadersToPick; i++) {
            let shaderIndex = Math.floor(Math.random() * this.shaders.length);
            shaderIndices.push(shaderIndex);
        }
        let i = 0;
        for (let shader of this.shaders) {
            shader.object.on = shaderIndices.indexOf(i) >= 0;
            if (shader.object.on) {
                shader.folder.open();
            }
            else {
                shader.folder.close();
            }
            for (let propertyName in shader.object.parameters) {
                let propertiesObject = shader.object.parameters[propertyName];
                propertiesObject.value = propertiesObject.type == 'color' ?
                    this.getRandomColor() :
                    this.getRandomOnInterval(propertiesObject.randomMin != null ? Math.max(propertiesObject.randomMin, propertiesObject.min) : propertiesObject.min, propertiesObject.randomMax != null ? Math.min(propertiesObject.randomMax, propertiesObject.max) : propertiesObject.max);
            }
            for (let controller of shader.folder.getControllers()) {
                controller.updateDisplay();
            }
            i++;
        }
        this.onToggleShaders(false);
        this.onParamsChange();
    }
    getShaderParameters() {
        let json = {};
        for (let shader of this.shaders) {
            let parameters = {};
            for (let propertyName in shader.object.parameters) {
                let propertiesObject = shader.object.parameters[propertyName];
                parameters[propertyName] = propertiesObject.value;
            }
            json[shader.object.name] = { parameters: parameters, on: shader.object.on };
        }
        return json;
    }
    setShaderParameters(json) {
        for (let shader of this.shaders) {
            let parameters = json[shader.object.name].parameters;
            let on = json[shader.object.name].on;
            shader.object.on = on;
            if (on) {
                shader.folder.open();
            }
            else {
                shader.folder.close();
            }
            for (let propertyName in shader.object.parameters) {
                shader.object.parameters[propertyName].value = parameters[propertyName];
            }
            for (let controller of shader.folder.getControllers()) {
                controller.updateDisplay();
            }
        }
        this.onToggleShaders(false);
        this.onParamsChange(false);
    }
    animate() {
        this.shaderTime += 0.1;
        for (let shader of this.shaders) {
            if (shader.object.time) {
                shader.pass.uniforms['time'].value = this.shaderTime;
            }
        }
        this.composer.render(0.1);
    }
}
exports.ShaderManager = ShaderManager;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Felix Turner / www.airtight.cc / @felixturner
 *
 * Bad TV Shader
 * Simulates a bad TV via horizontal distortion and vertical roll
 * Uses Ashima WebGl Noise: https://github.com/ashima/webgl-noise
 *
 * Uniforms:
 * time: steadily increasing float passed in
 * distortion: amount of thick distortion
 * distortion2: amount of fine grain distortion
 * speed: distortion vertical travel speed
 * rollSpeed: vertical roll speed
 *
 * The MIT License
 *
 * Copyright (c) Felix Turner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
exports.BadTVShader = {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
        "time": { type: "f", value: 0.0 },
        "distortion": { type: "f", value: 3.0 },
        "distortion2": { type: "f", value: 5.0 },
        "speed": { type: "f", value: 0.2 },
        "rollSpeed": { type: "f", value: 0.1 },
    },
    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform float time;",
        "uniform float distortion;",
        "uniform float distortion2;",
        "uniform float speed;",
        "uniform float rollSpeed;",
        "varying vec2 vUv;",
        // Start Ashima 2D Simplex Noise
        "vec3 mod289(vec3 x) {",
        "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
        "}",
        "vec2 mod289(vec2 x) {",
        "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
        "}",
        "vec3 permute(vec3 x) {",
        "  return mod289(((x*34.0)+1.0)*x);",
        "}",
        "float snoise(vec2 v)",
        "  {",
        "  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0",
        "                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)",
        "                     -0.577350269189626,  // -1.0 + 2.0 * C.x",
        "                      0.024390243902439); // 1.0 / 41.0",
        "  vec2 i  = floor(v + dot(v, C.yy) );",
        "  vec2 x0 = v -   i + dot(i, C.xx);",
        "  vec2 i1;",
        "  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
        "  vec4 x12 = x0.xyxy + C.xxzz;",
        " x12.xy -= i1;",
        "  i = mod289(i); // Avoid truncation effects in permutation",
        "  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
        "		+ i.x + vec3(0.0, i1.x, 1.0 ));",
        "  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
        "  m = m*m ;",
        "  m = m*m ;",
        "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
        "  vec3 h = abs(x) - 0.5;",
        "  vec3 ox = floor(x + 0.5);",
        "  vec3 a0 = x - ox;",
        "  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",
        "  vec3 g;",
        "  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
        "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
        "  return 130.0 * dot(m, g);",
        "}",
        // End Ashima 2D Simplex Noise
        "void main() {",
        "vec2 p = vUv;",
        "float ty = time*speed;",
        "float yt = p.y - ty;",
        //smooth distortion
        "float offset = snoise(vec2(yt*3.0,0.0))*0.2;",
        // boost distortion
        "offset = offset*distortion * offset*distortion * offset;",
        //add fine grain distortion
        "offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;",
        //combine distortion on X with roll on Y
        "gl_FragColor = texture2D(tDiffuse,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));",
        "}"
    ].join("\n")
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Arthur Masson
 *
 * sharpness - sharpness of the dots (0 - 1)
 * size - size of noise grains (pixels)
 *
 * The MIT License
 *
 * Copyright (c) 2014 Felix Turner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
exports.DotMatrix = {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
        "sharpness": { type: "f", value: 0.7 },
        "gridSize": { type: "f", value: 10.0 },
        "dotSize": { type: "f", value: 1.0 }
    },
    vertexShader: `
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
		`,
    fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float dotSize;
		uniform float gridSize;
		uniform float sharpness;

		varying vec2 vUv;

		void main() {
			vec2 p = vUv;
			vec4 color = texture2D(tDiffuse, floor( p * gridSize ) / gridSize);

			float halfSharpness = sharpness / 2.;
			
			vec2 f = 2. * abs(fract( p * gridSize ) - 0.5);

			color *= smoothstep(1.-halfSharpness, 0.+halfSharpness, dotSize*length(f));

			gl_FragColor = color;
 		}
 		`,
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */
exports.FilmShader = {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
        "time": { type: "f", value: 0.0 },
        "nIntensity": { type: "f", value: 0.5 },
        "sIntensity": { type: "f", value: 0.05 },
        "sCount": { type: "f", value: 4096 },
        "grayscale": { type: "i", value: 0 }
    },
    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        // control parameter
        "uniform float time;",
        "uniform bool grayscale;",
        // noise effect intensity value (0 = no effect, 1 = full effect)
        "uniform float nIntensity;",
        // scanlines effect intensity value (0 = no effect, 1 = full effect)
        "uniform float sIntensity;",
        // scanlines effect count value (0 = no effect, 4096 = full effect)
        "uniform float sCount;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUv;",
        "void main() {",
        // sample the source
        "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",
        // make some noise
        "float x = vUv.x * vUv.y * time *  1000.0;",
        "x = mod( x, 13.0 ) * mod( x, 123.0 );",
        "float dx = mod( x, 0.01 );",
        // add noise
        "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",
        // get us a sine and cosine
        "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",
        // add scanlines
        "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",
        // interpolate between source and result by intensity
        "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",
        // convert to grayscale if desired
        "if( grayscale ) {",
        "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",
        "}",
        "gl_FragColor =  vec4( cResult, cTextureScreen.a );",
        "}"
    ].join("\n")
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Felix Turner / www.airtight.cc / @felixturner
 *
 * Static effect. Additively blended digital noise.
 *
 * amount - amount of noise to add (0 - 1)
 * size - size of noise grains (pixels)
 *
 * The MIT License
 *
 * Copyright (c) 2014 Felix Turner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
exports.StaticShader = {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
        "time": { type: "f", value: 0.0 },
        "amount": { type: "f", value: 0.5 },
        "size": { type: "f", value: 4.0 }
    },
    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform float time;",
        "uniform float amount;",
        "uniform float size;",
        "varying vec2 vUv;",
        "float rand(vec2 co){",
        "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
        "}",
        "void main() {",
        "vec2 p = vUv;",
        "vec4 color = texture2D(tDiffuse, p);",
        "float xs = floor(gl_FragCoord.x / size);",
        "float ys = floor(gl_FragCoord.y / size);",
        "vec4 snow = vec4(rand(vec2(xs * time,ys * time))*amount);",
        //"gl_FragColor = color + amount * ( snow - color );", //interpolate
        "gl_FragColor = color+ snow;",
        "}"
    ].join("\n")
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Webcam {
    constructor(callback) {
        this.width = 640;
        this.height = 0;
        this.streaming = false;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.photo = null;
        // this.photo = document.getElementById('photo')
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        let n = navigator;
        n.getMedia = (navigator.getUserMedia ||
            n.webkitGetUserMedia ||
            n.mozGetUserMedia ||
            n.msGetUserMedia);
        n.getMedia({ video: true, audio: false }, (stream) => {
            if (n.mozGetUserMedia) {
                let v = this.video;
                v.mozSrcObject = stream;
            }
            else {
                var vendorURL = window.URL || window.webkitURL;
                this.video.src = vendorURL.createObjectURL(stream);
            }
            this.video.play();
        }, function (err) {
            console.log("An error occured! " + err);
        });
        this.video.addEventListener('canplay', (ev) => {
            if (!this.streaming) {
                this.height = this.video.videoHeight / (this.video.videoWidth / this.width);
                // Firefox currently has a bug where the height can't be read from
                // the video, so we will make assumptions if this happens.
                if (isNaN(this.height)) {
                    this.height = this.width / (4 / 3);
                }
                this.video.setAttribute('width', this.width.toString());
                this.video.setAttribute('height', this.height.toString());
                this.canvas.width = this.width;
                this.canvas.height = this.height;
                this.streaming = true;
                callback();
            }
        }, false);
        // this.clearPhoto()
    }
    getImage() {
        if (this.width && this.height) {
            this.context.drawImage(this.video, 0, 0, this.width, this.height);
            return this.canvas.toDataURL();
        }
        return null;
    }
}
exports.Webcam = Webcam;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(0);


/***/ })
/******/ ]);