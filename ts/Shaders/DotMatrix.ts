import * as THREE from 'THREE'

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

export let DotMatrix = {

	uniforms: {

		"tDiffuse": { type: "t", value: <THREE.Texture>null },
		"sharpness":   { type: "f", value: 0.7 },
		"gridSize":     { type: "f", value: 10.0 },
		"dotSize":     { type: "f", value: 1.0 }
	},

	vertexShader:
		`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
		`,

	fragmentShader:
		`
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
// ko:
// [	"void main() {",
// 		"vec2 p = vUv;",
// 		"vec4 color = texture2D(tDiffuse, p);",
// 		"float xs = floor(gl_FragCoord.x / size);",
// 		"float ys = floor(gl_FragCoord.y / size);",
// 		"vec4 snow = vec4(rand(vec2(xs * time,ys * time))*amount);",

// 		//"gl_FragColor = color + amount * ( snow - color );", //interpolate

// 		"gl_FragColor = color+ snow;", //additive

// 	"}"
// ]
}