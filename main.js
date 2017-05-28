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
/***/ (function(module, exports) {

/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
var imageID = 0;
var imageIndex = 0;
var viewer = null;
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
    var divJ = $('<div class="gg-thumbnail" data-name="' + imageAlt + '">');
    var buttonJ = $('<button type="button" class="btn btn-default btn-xs close-btn">');
    var spanJ = $('<span class="glyphicon glyphicon-remove" aria-hidden="true">');
    buttonJ.append(spanJ);
    divJ.append(imgJ);
    divJ.append(buttonJ);
    buttonJ.click(function () {
        removeImage(imageAlt);
    });
    $('#thumbnails').append(divJ);
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
var createViewer = function () {
    var windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    viewer = window.open("viewer.html", "Gif Grave Viewer", windowFeatures);
};
var song = null;
var previousIsOnBeat = false;
var animate = function () {
    requestAnimationFrame(animate);
    var isOnBeat = song.isOnBeat();
    if (song != null && isOnBeat && !previousIsOnBeat) {
        nextImage();
        console.log("IsOnBeat");
    }
    previousIsOnBeat = isOnBeat;
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
    });
    $("#takeSnapshot").click(takeSnapshot);
    $("#createViewer").click(createViewer);
    song = new stasilo.BeatDetector({ sens: 5.0,
        visualizerFFTSize: 256,
        analyserFFTSize: 256,
        passFreq: 600 });
    song.setVolume(0);
    animate();
});


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(0);


/***/ })
/******/ ]);