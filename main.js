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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
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
var GUI_1 = __webpack_require__(6);
var gui;
var imageID = 0;
var imageIndex = 0;
var viewer = null;
var thumbnailsJ = null;
var bpmDetectionFolder = null;
var removeImage = function (imageAlt) {
    $('#results').children("[data-name='" + imageAlt + "']").remove();
    $('#thumbnails').children("[data-name='" + imageAlt + "']").remove();
    if (viewer != null) {
        viewer.removeImage(imageAlt);
    }
    nextImage();
};
var addImage = function (data_uri) {
    // display results in page
    var imgJ = $('<img src="' + data_uri + '" data-name="img-' + imageID + '" alt="img-' + imageID + '">');
    imageID++;
    $('#results').append(imgJ);
    createThumbnail(imgJ.clone());
    nextImage();
    if (viewer != null) {
        viewer.addImage(imgJ.clone());
    }
};
var createThumbnail = function (imgJ) {
    var imageAlt = imgJ.attr('data-name');
    var liJ = $('<li class="ui-state-default gg-thumbnail" data-name="' + imageAlt + '">');
    var buttonJ = $('<button type="button" class="btn btn-default btn-xs close-btn">');
    var spanJ = $('<span class="glyphicon glyphicon-remove" aria-hidden="true">');
    buttonJ.append(spanJ);
    liJ.append(imgJ);
    liJ.append(buttonJ);
    buttonJ.click(function () {
        removeImage(imageAlt);
    });
    $('#thumbnails').append(liJ);
};
var takeSnapshot = function () {
    // take snapshot and get image data
    Webcam.snap(addImage);
};
var nextImage = function () {
    var imagesJ = $('#results').children();
    imageIndex++;
    if (imageIndex >= imagesJ.length) {
        imageIndex = 0;
    }
    // avoid to use hide() / show() because it affects the size of dom element in chrome which is a problem with the thumbnail scrollbar
    imagesJ.css({ opacity: 0 });
    $(imagesJ[imageIndex]).css({ opacity: 1 });
};
var sortImages = function () {
    var thumbnailsJ = $('#thumbnails').children();
    var imageNames = [];
    thumbnailsJ.each(function (index, element) {
        imageNames.push($(element).attr('data-name'));
    });
    var resultsJ = $('#results');
    var imagesJ = resultsJ.children();
    for (var _i = 0, imageNames_1 = imageNames; _i < imageNames_1.length; _i++) {
        var imageName = imageNames_1[_i];
        resultsJ.append(resultsJ.find("[data-name='" + imageName + "']"));
    }
};
var createViewer = function () {
    var windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures);
};
var song = null;
var previousIsOnBeat = false;
var animate = function () {
    requestAnimationFrame(animate);
    if (song == null || !autoBPM) {
        return;
    }
    var isOnBeat = song.isOnBeat();
    if (isOnBeat && !previousIsOnBeat) {
        nextImage();
    }
    previousIsOnBeat = isOnBeat;
};
var bpmDetectionButton = null;
var tapButton = null;
var autoBPM = true;
var toggleBPMdetection = function () {
    autoBPM = !autoBPM;
    bpmDetectionButton.setName(autoBPM ? 'Manual BPM' : 'Auto BPM');
    tapButton.setVisibility(!autoBPM);
    bpmDetectionFolder.setVisibility(autoBPM);
    if (autoBPM) {
        stopBPMinterval();
    }
};
var bpm = 0;
var lastTap = Date.now();
var nTaps = 0;
var MaxTapTime = 3000;
var averageBPM = 0;
var tapIntervalID = null;
var tapTimeoutID = null;
var stopBPMinterval = function () {
    if (tapIntervalID != null) {
        clearInterval(tapIntervalID);
        tapIntervalID = null;
    }
};
var setBPMinterval = function (bpm, newBPM) {
    if (newBPM === void 0) { newBPM = null; }
    stopBPMinterval();
    var delay = 1 / (bpm / 60 / 1000);
    tapIntervalID = setInterval(nextImage, delay);
    tapButton.setName('Tapping - BPM: ' + bpm.toFixed(2) + (newBPM != null ? ' | ' + newBPM.toFixed(2) : ''));
};
var stopTap = function () {
    nTaps = 0;
    tapButton.setName('Tap - BPM: ' + averageBPM.toFixed(2));
};
var tap = function () {
    nTaps++;
    var now = Date.now();
    if (nTaps == 1) {
        lastTap = now;
        tapButton.setName('Tapping');
        return;
    }
    var newBPM = 60 / ((now - lastTap) / 1000);
    averageBPM = (averageBPM * (nTaps - 1) + newBPM) / nTaps;
    setBPMinterval(averageBPM, newBPM);
    if (tapTimeoutID != null) {
        clearTimeout(tapTimeoutID);
    }
    tapTimeoutID = setTimeout(stopTap, MaxTapTime);
    lastTap = now;
};
var createGUI = function () {
    gui = new GUI_1.GUI(null, { autoPlace: false, width: '100%' });
    document.getElementById('gui').appendChild(gui.getDomElement());
    gui.addButton('Take snapshot', takeSnapshot);
    gui.addButton('Create viewer', createViewer);
    bpmDetectionButton = gui.addButton('Manual BPM', toggleBPMdetection);
    tapButton = gui.addButton('Tap', tap);
    tapButton.setVisibility(!autoBPM);
    bpmDetectionFolder = gui.addFolder('BPM detection settings');
    var sliders = { sensitivity: null, analyserFFTSize: null, passFreq: null, visualizerFFTSize: null };
    var onSliderChange = function () {
        var sens = sliders.sensitivity.getValue();
        var analyserFFTSize = Math.pow(2, sliders.analyserFFTSize.getValue());
        var visualizerFFTSize = Math.pow(2, sliders.visualizerFFTSize.getValue());
        var passFreq = sliders.passFreq.getValue();
        song = new stasilo.BeatDetector({ sens: sens,
            visualizerFFTSize: visualizerFFTSize,
            analyserFFTSize: analyserFFTSize,
            passFreq: passFreq });
    };
    sliders.sensitivity = bpmDetectionFolder.addSlider('Sensitivity', 5, 1, 16, 1).onChange(onSliderChange);
    sliders.analyserFFTSize = bpmDetectionFolder.addSlider('Analyser FFT Size', 7, 5, 15, 1);
    sliders.passFreq = bpmDetectionFolder.addSlider('Bandpass Filter Frequency', 600, 1, 10000, 1);
    sliders.visualizerFFTSize = bpmDetectionFolder.addSlider('Visualizer FFT Size', 7, 5, 15, 1);
    onSliderChange();
    // $(gui.getDomElement()).css({ width: '100%' })
};
document.addEventListener("DOMContentLoaded", function (event) {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90
    });
    Webcam.attach('#camera');
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
    animate();
    thumbnailsJ = $("#thumbnails");
    thumbnailsJ.sortable(({ stop: sortImages }));
    thumbnailsJ.disableSelection();
    createGUI();
});


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(0);


/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Controller = (function () {
    function Controller(controller) {
        this.controller = controller;
    }
    Controller.prototype.getDomElement = function () {
        return this.controller.domElement;
    };
    Controller.prototype.getParentDomElement = function () {
        return this.getDomElement().parentElement.parentElement;
    };
    Controller.prototype.hide = function () {
        $(this.getParentDomElement()).hide();
    };
    Controller.prototype.show = function () {
        $(this.getParentDomElement()).show();
    };
    Controller.prototype.setVisibility = function (visible) {
        if (visible) {
            this.show();
        }
        else {
            this.hide();
        }
    };
    Controller.prototype.contains = function (element) {
        return $.contains(this.getParentDomElement(), element);
    };
    Controller.prototype.getProperty = function () {
        return this.controller.property;
    };
    Controller.prototype.getName = function () {
        return this.controller.property;
    };
    Controller.prototype.getValue = function () {
        return this.controller.object[this.controller.property];
    };
    Controller.prototype.onChange = function (callback) {
        this.controller.onChange(callback);
        return this;
    };
    Controller.prototype.onFinishChange = function (callback) {
        this.controller.onFinishChange(callback);
        return this;
    };
    Controller.prototype.setValue = function (value) {
        this.controller.setValue(value);
    };
    Controller.prototype.setValueNoCallback = function (value) {
        this.controller.object[this.controller.property] = value;
        this.controller.updateDisplay();
    };
    Controller.prototype.max = function (value) {
        this.controller.max(value);
    };
    Controller.prototype.min = function (value) {
        this.controller.min(value);
    };
    Controller.prototype.step = function (value) {
        this.controller.step(value);
    };
    Controller.prototype.updateDisplay = function () {
        this.controller.updateDisplay();
    };
    Controller.prototype.options = function (options) {
        return this.controller.options(options);
    };
    Controller.prototype.setName = function (name) {
        $(this.controller.domElement.parentElement).find('span.property-name').html(name);
    };
    return Controller;
}());
exports.Controller = Controller;
var GUI = (function () {
    function GUI(folder, options) {
        if (folder === void 0) { folder = null; }
        if (options === void 0) { options = null; }
        this.gui = folder != null ? folder : new dat.GUI(options);
    }
    GUI.prototype.getDomElement = function () {
        return this.gui.domElement;
    };
    GUI.prototype.hide = function () {
        $(this.getDomElement()).hide();
    };
    GUI.prototype.show = function () {
        $(this.getDomElement()).show();
    };
    GUI.prototype.setVisibility = function (visible) {
        if (visible) {
            this.show();
        }
        else {
            this.hide();
        }
    };
    GUI.prototype.add = function (object, propertyName, min, max) {
        if (min === void 0) { min = null; }
        if (max === void 0) { max = null; }
        return new Controller(this.gui.add(object, propertyName, min, max));
    };
    GUI.prototype.addButton = function (name, callback) {
        var object = {};
        var nameNoSpaces = name.replace(/\s+/g, '');
        object[nameNoSpaces] = callback;
        var controller = new Controller(this.gui.add(object, nameNoSpaces));
        if (name != nameNoSpaces) {
            controller.setName(name);
        }
        return controller;
    };
    GUI.prototype.addFileSelectorButton = function (name, fileType, callback) {
        var divJ = $("<input data-name='file-selector' type='file' class='form-control' name='file[]'  accept='" + fileType + "'/>");
        var button = this.addButton(name, function () { return divJ.click(); });
        $(button.getDomElement()).append(divJ);
        divJ.hide();
        divJ.change(callback);
        return button;
    };
    GUI.prototype.addSlider = function (name, value, min, max, step) {
        if (step === void 0) { step = null; }
        var object = {};
        var nameNoSpaces = name.replace(/\s+/g, '');
        object[nameNoSpaces] = value;
        var slider = this.add(object, nameNoSpaces, min, max);
        if (name != nameNoSpaces) {
            slider.setName(name);
        }
        if (step != null) {
            slider.step(step);
        }
        return slider;
    };
    GUI.prototype.addFolder = function (name) {
        return new GUI(this.gui.addFolder(name));
    };
    GUI.prototype.getControllers = function () {
        return this.gui.__controllers;
    };
    return GUI;
}());
exports.GUI = GUI;


/***/ })
/******/ ]);