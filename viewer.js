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
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ({

/***/ 2:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 4:
/***/ (function(module, exports) {

/// <reference path="../node_modules/@types/jquery/index.d.ts"/>
var Viewer;
(function (Viewer) {
    let imageIndex = 0;
    let nextImage = () => {
        let imagesJ = $('#results').children();
        imageIndex++;
        if (imageIndex >= imagesJ.length) {
            imageIndex = 0;
        }
        // avoid to use hide() / show() because it affects the size of dom element in chrome which is a problem with the thumbnail scrollbar
        // imagesJ.css({opacity: 0})
        // $(imagesJ[imageIndex]).css({opacity: 1})
        imagesJ.hide();
        $(imagesJ[imageIndex]).show();
    };
    let addImage = (imageJ) => {
        $("#results").append(imageJ);
        nextImage();
    };
    window.addImage = addImage;
    let removeImage = (imageAlt) => {
        $('#results').children("[alt='" + imageAlt + "']").remove();
        nextImage();
    };
    window.removeImage = removeImage;
    let setFilteredImage = (imageJ, resultJ) => {
        let imageName = imageJ.attr('data-name');
        let originalImage = $('#results').find('img[data-name="' + imageName + '"]');
        originalImage.replaceWith(resultJ.clone());
        nextImage();
    };
    window.setFilteredImage = setFilteredImage;
    let setGif = (gifJ) => {
        $('#results').empty().append(gifJ);
    };
    window.setGif = setGif;
    document.addEventListener("DOMContentLoaded", function (event) {
        setInterval(nextImage, 300);
        $("#results").append($(self.opener.document.body).find("#results").children().clone());
    });
})(Viewer || (Viewer = {}));


/***/ }),

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(4);
module.exports = __webpack_require__(2);


/***/ })

/******/ });