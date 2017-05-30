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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
    }
    setValueNoCallback(value) {
        this.controller.object[this.controller.property] = value;
        this.controller.updateDisplay();
    }
    max(value) {
        this.controller.max(value);
    }
    min(value) {
        this.controller.min(value);
    }
    step(value) {
        this.controller.step(value);
    }
    updateDisplay() {
        this.controller.updateDisplay();
    }
    options(options) {
        return this.controller.options(options);
    }
    setName(name) {
        $(this.controller.domElement.parentElement).find('span.property-name').html(name);
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
    addButton(name, callback) {
        let object = {};
        let nameNoSpaces = name.replace(/\s+/g, '');
        object[nameNoSpaces] = callback;
        let controller = new Controller(this.gui.add(object, nameNoSpaces));
        if (name != nameNoSpaces) {
            controller.setName(name);
        }
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
}
exports.GUI = GUI;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const GUI_1 = __webpack_require__(0);
const GifViewer_1 = __webpack_require__(8);
const Filters_1 = __webpack_require__(5);
let gui;
let filterManager;
let imageID = 0;
let gifID = 0;
let imageIndex = 0;
let viewer = null;
let thumbnailsJ = null;
let bpmDetectionFolder = null;
let gifViewer = null;
let setFilteredImage = (imageJ, resultJ) => {
    let imageName = imageJ.attr('data-name');
    resultJ.insertBefore(imageJ);
    gifViewer.replaceImage(imageName, resultJ.clone());
    currentGif.replaceImage(imageName, resultJ.clone());
    // if(viewer != null) {
    // 	(<any>viewer).setFilteredImage(imageJ, resultJ)
    // }
};
let removeImage = (imageAlt) => {
    gifViewer.removeImage(imageAlt);
    currentGif.removeImage(imageAlt);
    $('#thumbnails').children("[data-name='" + imageAlt + "']").remove();
    // if(viewer != null) {
    // 	(<any>viewer).removeImage(imageAlt)
    // }
    nextImage();
};
let selectImage = (imageName) => {
    $('#thumbnails').children().removeClass('gg-selected');
    $('#thumbnails').children("[data-name='" + imageName + "']").addClass('gg-selected');
    let imgJ = $('#thumbnails').children("[data-name='" + imageName + "']").find('img.original-image');
    filterManager.setImage(imgJ);
};
let addImage = (data_uri, canvas = null, context = null) => {
    // display results in page
    let imageName = 'img-' + imageID;
    let imgJ = $('<img src="' + data_uri + '" data-name="' + imageName + '" alt="img-' + imageID + '">');
    imageID++;
    gifViewer.addImage(imgJ.clone());
    currentGif.addImage(imgJ.clone());
    createThumbnail(imgJ.clone());
    selectImage(imageName);
    nextImage();
    // if(viewer != null) {
    // 	(<any>viewer).addImage(imgJ.clone())
    // }
};
let createThumbnail = (imgJ) => {
    let imageName = imgJ.attr('data-name');
    let liJ = $('<li class="ui-state-default gg-thumbnail" data-name="' + imageName + '">');
    let buttonJ = $('<button type="button" class="close-btn">');
    let spanJ = $('<span class="ui-icon ui-icon-closethick">');
    let divJ = $('<div class="gg-thumbnail-container">');
    buttonJ.append(spanJ);
    divJ.append(imgJ.addClass('gg-hidden original-image'));
    liJ.append(divJ);
    liJ.append(buttonJ);
    buttonJ.click(() => {
        removeImage(imageName);
    });
    liJ.mousedown(() => setTimeout(() => { selectImage(imageName); }, 0)); // add timeout to not to disturbe draggable
    $('#thumbnails').append(liJ);
};
let takeSnapshot = () => {
    // take snapshot and get image data
    Webcam.snap(addImage);
};
let nextImage = () => {
    gifViewer.nextImage();
    for (let [gifName, gif] of gifs) {
        gif.nextImage();
    }
};
// let sortImagesStart = (event: Event, ui: any)=> {
// 	let imageName = $(ui.item).attr('data-name')
// 	selectImage(imageName)
// }
let sortImagesStop = () => {
    let thumbnailsJ = $('#thumbnails').children();
    let imageNames = [];
    thumbnailsJ.each(function (index, element) {
        imageNames.push($(element).attr('data-name'));
    });
    gifViewer.sortImages(imageNames);
    currentGif.sortImages(imageNames);
};
let createViewer = () => {
    let windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures);
};
let song = null;
let previousIsOnBeat = false;
let animate = () => {
    requestAnimationFrame(animate);
    if (song == null || !autoBPM) {
        return;
    }
    let isOnBeat = song.isOnBeat();
    if (isOnBeat && !previousIsOnBeat) {
        nextImage();
    }
    previousIsOnBeat = isOnBeat;
};
let bpmDetectionButton = null;
let tapButton = null;
let autoBPM = true;
let toggleBPMdetection = () => {
    autoBPM = !autoBPM;
    bpmDetectionButton.setName(autoBPM ? 'Manual BPM' : 'Auto BPM');
    tapButton.setVisibility(!autoBPM);
    bpmDetectionFolder.setVisibility(autoBPM);
    if (autoBPM) {
        stopBPMinterval();
    }
};
let bpm = 0;
let lastTap = Date.now();
let nTaps = 0;
const MaxTapTime = 3000;
let averageBPM = 0;
let tapIntervalID = null;
let tapTimeoutID = null;
let stopBPMinterval = () => {
    if (tapIntervalID != null) {
        clearInterval(tapIntervalID);
        tapIntervalID = null;
    }
};
let setBPMinterval = (bpm, newBPM = null) => {
    stopBPMinterval();
    let delay = 1 / (bpm / 60 / 1000);
    tapIntervalID = setInterval(nextImage, delay);
    tapButton.setName('Tapping - BPM: ' + bpm.toFixed(2) + (newBPM != null ? ' | ' + newBPM.toFixed(2) : ''));
};
let stopTap = () => {
    nTaps = 0;
    tapButton.setName('Tap - BPM: ' + averageBPM.toFixed(2));
};
let tap = () => {
    nTaps++;
    let now = Date.now();
    if (nTaps == 1) {
        lastTap = now;
        tapButton.setName('Tapping');
        return;
    }
    let newBPM = 60 / ((now - lastTap) / 1000);
    averageBPM = (averageBPM * (nTaps - 1) + newBPM) / nTaps;
    setBPMinterval(averageBPM, newBPM);
    if (tapTimeoutID != null) {
        clearTimeout(tapTimeoutID);
    }
    tapTimeoutID = setTimeout(stopTap, MaxTapTime);
    lastTap = now;
};
let createGUI = () => {
    gui = new GUI_1.GUI({ autoPlace: false, width: '100%' });
    document.getElementById('gui').appendChild(gui.getDomElement());
    gui.addButton('Take snapshot', takeSnapshot);
    gui.addButton('Add gif', addGif);
    gui.addButton('Create viewer', createViewer);
    bpmDetectionButton = gui.addButton('Manual BPM', toggleBPMdetection);
    tapButton = gui.addButton('Tap', tap);
    tapButton.setVisibility(!autoBPM);
    bpmDetectionFolder = gui.addFolder('BPM detection settings');
    let sliders = { sensitivity: null, analyserFFTSize: null, passFreq: null, visualizerFFTSize: null };
    let onSliderChange = () => {
        let sens = sliders.sensitivity.getValue();
        let analyserFFTSize = Math.pow(2, sliders.analyserFFTSize.getValue());
        let visualizerFFTSize = Math.pow(2, sliders.visualizerFFTSize.getValue());
        let passFreq = sliders.passFreq.getValue();
        song = new stasilo.BeatDetector({ sens: sens,
            visualizerFFTSize: visualizerFFTSize,
            analyserFFTSize: analyserFFTSize,
            passFreq: passFreq });
    };
    sliders.sensitivity = bpmDetectionFolder.addSlider('Sensitivity', 5, 1, 16, 1).onChange(onSliderChange);
    sliders.analyserFFTSize = bpmDetectionFolder.addSlider('Analyser FFT Size', 7, 5, 15, 1);
    sliders.passFreq = bpmDetectionFolder.addSlider('Bandpass Filter Frequency', 600, 1, 10000, 1);
    sliders.visualizerFFTSize = bpmDetectionFolder.addSlider('Visualizer FFT Size', 7, 5, 15, 1);
    // onSliderChange()
    // $(gui.getDomElement()).css({ width: '100%' })
};
let emptyThumbnails = () => {
    $('#thumbnails').empty();
};
let gifs = new Map();
let currentGif = null;
let getGifContainer = () => {
    return currentGif.containerJ.parentUntil('li.gg-thumbnail');
};
let addGif = () => {
    emptyThumbnails();
    let currentGifJ = $('<li class="gg-thumbnail" data-name="' + gifID + '">');
    let buttonJ = $('<button type="button" class="close-btn">');
    let spanJ = $('<span class="ui-icon ui-icon-closethick">');
    let divJ = $('<div class="gg-thumbnail-container">');
    buttonJ.append(spanJ);
    currentGifJ.append(divJ);
    currentGifJ.append(buttonJ);
    buttonJ.click(() => {
        removeGif(gifID);
    });
    currentGifJ.mousedown(() => selectGif(gifID));
    gifID++;
    $('#outputs').append(currentGifJ);
    currentGif = new GifViewer_1.GifViewer(divJ);
    gifs.set(gifID, currentGif);
};
let removeGif = (gifID) => {
    $('#outputs').find('[data-name="' + gifID + '"]').remove();
};
let selectGif = (gifID) => {
    $('#outputs').children().removeClass('gg-selected');
    $('#outputs').children("[data-name='" + gifID + "']").addClass('gg-selected');
    currentGif = gifs.get(gifID);
    if (viewer != null) {
        viewer.setCurrentGif(currentGif.getChildren());
    }
};
document.addEventListener("DOMContentLoaded", function (event) {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90
    });
    Webcam.attach('#camera');
    // $('#camera').css({margin: 'auto'})
    $(document).keydown(function (event) {
        if (event.keyCode == 32) {
            takeSnapshot();
        }
        else if (event.keyCode == 13) {
            tap();
        }
        else if (event.keyCode == 27) {
            stopTap();
        }
    });
    $("#takeSnapshot").click(takeSnapshot);
    $("#createViewer").click(createViewer);
    gifViewer = new GifViewer_1.GifViewer($('#result'));
    addGif();
    animate();
    thumbnailsJ = $("#thumbnails");
    thumbnailsJ.sortable(({ stop: sortImagesStop }));
    thumbnailsJ.disableSelection();
    createGUI();
    filterManager = new Filters_1.FilterManager(setFilteredImage);
});


/***/ }),
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const GUI_1 = __webpack_require__(0);
class Nub {
    constructor(name, x, y, onChange) {
        let parent = $('#effect')[0];
        this.position = { x: 0, y: 0 };
        let divJ = $('<div class="nub">');
        divJ.css({ top: y, left: x, position: 'absolute' });
        divJ.draggable({
            containement: parent,
            drag: (event, ui) => {
                this.position.x = ui.position.x;
                this.position.y = ui.position.y;
                onChange();
            }
        });
        $(parent).append(divJ);
        this.divJ = divJ;
    }
    remove() {
        this.divJ.remove();
    }
}
class Filter {
    constructor(name, functionName, gui, code, fileName = null) {
        this.name = name;
        this.functionName = functionName;
        this.parameters = [];
        this.sliders = new Map();
        this.nubs = new Map();
        this.sliderControllers = new Map();
        this.nubControllers = new Map();
        gui.apply(this);
    }
    addSlider(name, label, min, max, value, step) {
        this.parameters.push({ name: name, type: 'slider' });
        this.sliders.set(name, {
            name: name,
            label: label,
            min: min,
            max: max,
            value: value,
            step: step
        });
    }
    addNub(name, x, y) {
        this.parameters.push({ name: name, type: 'nub' });
        this.nubs.set(name, {
            name: name,
            x: x,
            y: y
        });
    }
    setCode(code) {
    }
    apply(args = null) {
        let canvas = Filter.filterManager.canvas;
        let imageJ = Filter.filterManager.currentImageJ;
        if (imageJ == null) {
            return;
        }
        let texture = canvas.texture(imageJ[0]);
        if (args == null) {
            args = [];
            for (let parameter of this.parameters) {
                if (parameter.type == 'slider') {
                    args.push(this.sliderControllers.get(parameter.name).getValue());
                }
                else {
                    args.push(this.nubControllers.get(parameter.name).position.x);
                    args.push(this.nubControllers.get(parameter.name).position.y);
                }
            }
        }
        canvas.draw(texture);
        canvas[this.functionName].apply(canvas, args);
        canvas.update();
        let result = new Image();
        result.src = canvas.toDataURL();
        result.className = 'filtered';
        imageJ.siblings('.filtered').remove();
        let resultJ = $(result);
        let imageName = imageJ.attr('data-name');
        resultJ.attr('data-name', imageName);
        let filterJSON = { name: this.name, args: args };
        imageJ.attr('data-filter', JSON.stringify(filterJSON));
        Filter.filterManager.setFilteredImage(imageJ, resultJ);
    }
    activate(args = null) {
        Filter.filterManager.currentFilter = this;
        let argNameToValue = new Map();
        if (args != null) {
            let i = 0;
            for (let parameter of this.parameters) {
                if (parameter.type == 'slider') {
                    argNameToValue.set(parameter.name, args[i]);
                }
                else if (parameter.type == 'nub') {
                    argNameToValue.set(parameter.name, { x: args[i], y: args[i + 1] });
                    i++;
                }
                i++;
            }
        }
        for (let [sliderName, slider] of this.sliders) {
            let value = args != null ? argNameToValue.get(sliderName) : slider.value;
            this.sliderControllers.set(sliderName, Filter.filterManager.gui.addSlider(slider.name, value, slider.min, slider.max, slider.step).onChange(() => this.apply()));
        }
        for (let [nubName, nub] of this.nubs) {
            let position = args != null ? argNameToValue.get(nubName) : nub;
            this.nubControllers.set(nubName, new Nub(nub.name, position.x, position.y, () => this.apply()));
        }
    }
    deativate() {
        for (let [sliderName, slider] of this.sliderControllers) {
            slider.remove();
        }
        for (let [nubName, nub] of this.nubControllers) {
            nub.remove();
        }
    }
}
let perspectiveNubs = [175, 156, 496, 55, 161, 279, 504, 330];
let filters = {
    'Adjust': [
        new Filter('Brightness / Contrast', 'brightnessContrast', function () {
            this.addSlider('brightness', 'Brightness', -1, 1, 0, 0.01);
            this.addSlider('contrast', 'Contrast', -1, 1, 0, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).brightnessContrast(' + this.brightness + ', ' + this.contrast + ').update();');
        }),
        new Filter('Hue / Saturation', 'hueSaturation', function () {
            this.addSlider('hue', 'Hue', -1, 1, 0, 0.01);
            this.addSlider('saturation', 'Saturation', -1, 1, 0, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).hueSaturation(' + this.hue + ', ' + this.saturation + ').update();');
        }),
        new Filter('Vibrance', 'vibrance', function () {
            this.addSlider('amount', 'Amount', -1, 1, 0.5, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).vibrance(' + this.amount + ').update();');
        }),
        new Filter('Denoise', 'denoise', function () {
            this.addSlider('exponent', 'Exponent', 0, 50, 20, 1);
        }, function () {
            this.setCode('canvas.draw(texture).denoise(' + this.exponent + ').update();');
        }),
        new Filter('Unsharp Mask', 'unsharpMask', function () {
            this.addSlider('radius', 'Radius', 0, 200, 20, 1);
            this.addSlider('strength', 'Strength', 0, 5, 2, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).unsharpMask(' + this.radius + ', ' + this.strength + ').update();');
        }),
        new Filter('Noise', 'noise', function () {
            this.addSlider('amount', 'Amount', 0, 1, 0.5, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).noise(' + this.amount + ').update();');
        }),
        new Filter('Sepia', 'sepia', function () {
            this.addSlider('amount', 'Amount', 0, 1, 1, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).sepia(' + this.amount + ').update();');
        }),
        new Filter('Vignette', 'vignette', function () {
            this.addSlider('size', 'Size', 0, 1, 0.5, 0.01);
            this.addSlider('amount', 'Amount', 0, 1, 0.5, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).vignette(' + this.size + ', ' + this.amount + ').update();');
        })
    ],
    'Blur': [
        new Filter('Zoom Blur', 'zoomBlur', function () {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('strength', 'Strength', 0, 1, 0.3, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).zoomBlur(' + this.center.x + ', ' + this.center.y + ', ' + this.strength + ').update();');
        }),
        new Filter('Triangle Blur', 'triangleBlur', function () {
            this.addSlider('radius', 'Radius', 0, 200, 50, 1);
        }, function () {
            this.setCode('canvas.draw(texture).triangleBlur(' + this.radius + ').update();');
        }),
        new Filter('Tilt Shift', 'tiltShift', function () {
            this.addNub('start', 0.15, 0.75);
            this.addNub('end', 0.75, 0.6);
            this.addSlider('blurRadius', 'Blur Radius', 0, 50, 15, 1);
            this.addSlider('gradientRadius', 'Gradient Radius', 0, 400, 200, 1);
        }, function () {
            this.setCode('canvas.draw(texture).tiltShift(' + this.start.x + ', ' + this.start.y + ', ' + this.end.x + ', ' + this.end.y + ', ' + this.blurRadius + ', ' + this.gradientRadius + ').update();');
        }),
        new Filter('Lens Blur', 'lensBlur', function () {
            this.addSlider('radius', 'Radius', 0, 50, 10, 1);
            this.addSlider('brightness', 'Brightness', -1, 1, 0.75, 0.01);
            this.addSlider('angle', 'Angle', -Math.PI, Math.PI, 0, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).lensBlur(' + this.radius + ', ' + this.brightness + ', ' + this.angle + ').update();');
        }, 'lighthouse.jpg')
    ],
    'Warp': [
        new Filter('Swirl', 'swirl', function () {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', -25, 25, 3, 0.1);
            this.addSlider('radius', 'Radius', 0, 600, 200, 1);
        }, function () {
            this.setCode('canvas.draw(texture).swirl(' + this.center.x + ', ' + this.center.y + ', ' + this.radius + ', ' + this.angle + ').update();');
        }),
        new Filter('Bulge / Pinch', 'bulgePinch', function () {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('strength', 'Strength', -1, 1, 0.5, 0.01);
            this.addSlider('radius', 'Radius', 0, 600, 200, 1);
        }, function () {
            this.setCode('canvas.draw(texture).bulgePinch(' + this.center.x + ', ' + this.center.y + ', ' + this.radius + ', ' + this.strength + ').update();');
        }),
        new Filter('Perspective', 'perspective', function () {
            var w = 640, h = 425;
            this.addNub('a', perspectiveNubs[0] / w, perspectiveNubs[1] / h);
            this.addNub('b', perspectiveNubs[2] / w, perspectiveNubs[3] / h);
            this.addNub('c', perspectiveNubs[4] / w, perspectiveNubs[5] / h);
            this.addNub('d', perspectiveNubs[6] / w, perspectiveNubs[7] / h);
        }, function () {
            var before = perspectiveNubs;
            var after = [this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y, this.d.x, this.d.y];
            this.setCode('canvas.draw(texture).perspective([' + before + '], [' + after + ']).update();');
        }, 'perspective.jpg')
    ],
    'Fun': [
        new Filter('Ink', 'ink', function () {
            this.addSlider('strength', 'Strength', 0, 1, 0.25, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).ink(' + this.strength + ').update();');
        }),
        new Filter('Edge Work', 'edgeWork', function () {
            this.addSlider('radius', 'Radius', 0, 200, 10, 1);
        }, function () {
            this.setCode('canvas.draw(texture).edgeWork(' + this.radius + ').update();');
        }),
        new Filter('Hexagonal Pixelate', 'hexagonalPixelate', function () {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('scale', 'Scale', 10, 100, 20, 1);
        }, function () {
            this.setCode('canvas.draw(texture).hexagonalPixelate(' + this.center.x + ', ' + this.center.y + ', ' + this.scale + ').update();');
        }),
        new Filter('Dot Screen', 'dotScreen', function () {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', 0, Math.PI / 2, 1.1, 0.01);
            this.addSlider('size', 'Size', 3, 20, 3, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).dotScreen(' + this.center.x + ', ' + this.center.y + ', ' + this.angle + ', ' + this.size + ').update();');
        }),
        new Filter('Color Halftone', 'colorHalftone', function () {
            this.addNub('center', 0.5, 0.5);
            this.addSlider('angle', 'Angle', 0, Math.PI / 2, 0.25, 0.01);
            this.addSlider('size', 'Size', 3, 20, 4, 0.01);
        }, function () {
            this.setCode('canvas.draw(texture).colorHalftone(' + this.center.x + ', ' + this.center.y + ', ' + this.angle + ', ' + this.size + ').update();');
        })
    ]
};
class FilterManager {
    constructor(setFilteredImage) {
        Filter.filterManager = this;
        this.nameToFilter = new Map();
        this.initialize();
        this.setFilteredImage = setFilteredImage;
    }
    activateFilter(name, updateSelect = true, args = null) {
        if (updateSelect) {
            this.filterSelect.setValueNoCallback(name);
        }
        if (this.currentFilter != null) {
            this.currentFilter.deativate();
        }
        this.currentFilter = this.nameToFilter.get(name);
        this.currentFilter.activate(args);
    }
    initialize() {
        try {
            this.canvas = fx.canvas();
        }
        catch (e) {
            alert(e);
            return;
        }
        $('#effect').append(this.canvas);
        this.gui = new GUI_1.GUI({ autoPlace: false, width: '100%' });
        document.getElementById('gui').appendChild(this.gui.getDomElement());
        let filterNames = [];
        for (let filterCategory in filters) {
            for (let filter of filters[filterCategory]) {
                this.nameToFilter.set(filter.name, filter);
                filterNames.push(filter.name);
            }
        }
        let defaultFilter = 'Hue / Saturation';
        this.filterSelect = this.gui.addSelect('Filter', filterNames, defaultFilter).onChange((value) => {
            this.activateFilter(value);
            this.currentFilter.apply();
        });
        this.activateFilter(defaultFilter);
    }
    filterImage(fromImageData = false) {
        let args = null;
        if (fromImageData) {
            let imageFilterData = this.currentImageJ.attr('data-filter');
            if (imageFilterData != null && imageFilterData.length > 0) {
                let filter = JSON.parse(imageFilterData);
                args = filter.args;
                this.activateFilter(filter.name, true, args);
            }
        }
        let texture = this.canvas.texture(this.currentImageJ[0]);
        this.canvas.draw(texture);
        if (this.currentFilter != null) {
            this.currentFilter.apply(args);
        }
    }
    setImage(imgJ) {
        this.currentImageJ = imgJ;
        if (!imgJ.attr('gg-loaded')) {
            imgJ.on('load', () => {
                imgJ.attr('gg-loaded', 'true');
                this.filterImage();
            });
        }
        else {
            this.filterImage(true);
        }
    }
}
exports.FilterManager = FilterManager;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
module.exports = __webpack_require__(1);


/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class GifViewer {
    constructor(containerJ) {
        this.containerJ = containerJ;
        this.imageIndex = 0;
    }
    // setSize(imgJ: any) {
    // 	this.containerJ.width(imgJ[0].naturalWidth)
    // 	this.containerJ.height(imgJ[0].naturalHeight)
    // }
    getImageJ(name) {
        return this.containerJ.find('img[data-name="' + name + '"]');
    }
    addImage(imgJ) {
        // if(!imgJ.attr('gg-loaded')) {
        // 	imgJ.on('load', ()=> { 
        // 		imgJ.attr('gg-loaded', 'true')
        // 		this.setSize(imgJ)
        // 	})
        // } else {
        // 	this.setSize(imgJ)
        // }
        this.containerJ.append(imgJ);
    }
    replaceImage(oldImageName, newImageJ) {
        this.getImageJ(oldImageName).replaceWith(newImageJ);
    }
    removeImage(imageName) {
        this.getImageJ(imageName).remove();
    }
    nextImage() {
        let imagesJ = this.containerJ.children();
        this.imageIndex++;
        if (this.imageIndex >= imagesJ.length) {
            this.imageIndex = 0;
        }
        // avoid to use hide() / show() because it affects the size of dom element in chrome which is a problem with the thumbnail scrollbar
        imagesJ.css({ opacity: 0 });
        $(imagesJ[this.imageIndex]).css({ opacity: 1 });
    }
    sortImages(imageNames) {
        let imagesJ = this.containerJ.children();
        for (let imageName of imageNames) {
            this.containerJ.append(this.getImageJ(imageName));
        }
    }
    setChildren(imgJs) {
        for (let img of imgJs) {
            this.addImage($(img));
        }
    }
    getChildren() {
        return this.containerJ.children().clone();
    }
}
exports.GifViewer = GifViewer;


/***/ })
/******/ ]);