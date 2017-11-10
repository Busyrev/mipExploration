var WebGLDescriber = (function () {
    function WebGLDescriber(context) {
        this.detectError = undefined;
        this.screenWidth = -1;
        this.screenHeight = -1;
        this.videoCard = 'unknown';
        this.videoVendor = 'unknown';
        this.supported = false;
        this.version = 'unknown';
        this.shadingVesion = 'unknown';
        this.maxVertexAttributes = 0;
        this.maxVertexUniformVectors = 0;
        this.maxVertexTextureImageUnits = 0;
        this.maxVaryingVectors = 0;
        this.maxFragmentUniformVectors = 0;
        this.maxTextureImageUnits = 0;
        this.redBits = 0;
        this.greenBits = 0;
        this.blueBits = 0;
        this.alphaBits = 0;
        this.depthBits = 0;
        this.stencilBits = 0;
        this.maxRenderbufferSize = 0;
        this.maxViewportDims0 = 0;
        this.maxViewportDims1 = 0;
        this.maxTextureSize = 0;
        this.maxCubeMapTextureSize = 0;
        this.maxCombinedTextureImageUnits = 0;
        this.attributesAlpha = false;
        this.attributesAntialias = false;
        this.attributesDepth = false;
        this.attributesPremultipliedAlpha = false;
        this.attributesPreserveDrawingBuffer = false;
        this.attributesStencil = false;
        this.majorPerformanceCaveat = 'unknown';
        this.supportedExtensions = [];
        this.shaderPrecisionFormats = new ShaderPrecisionFormats();
        try {
            this.detectVieoCard(context);
            this.version = context.getParameter(context.VERSION);
            this.shadingVesion = context.getParameter(context.SHADING_LANGUAGE_VERSION);
            this.maxVertexAttributes = context.getParameter(context.MAX_VERTEX_ATTRIBS);
            this.maxVertexUniformVectors = context.getParameter(context.MAX_VERTEX_UNIFORM_VECTORS);
            this.maxVertexTextureImageUnits = context.getParameter(context.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
            this.maxVaryingVectors = context.getParameter(context.MAX_VARYING_VECTORS);
            this.maxFragmentUniformVectors = context.getParameter(context.MAX_FRAGMENT_UNIFORM_VECTORS);
            this.maxTextureImageUnits = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);
            this.redBits = context.getParameter(context.RED_BITS);
            this.greenBits = context.getParameter(context.GREEN_BITS);
            this.blueBits = context.getParameter(context.BLUE_BITS);
            this.alphaBits = context.getParameter(context.ALPHA_BITS);
            this.depthBits = context.getParameter(context.DEPTH_BITS);
            this.stencilBits = context.getParameter(context.STENCIL_BITS);
            this.maxRenderbufferSize = context.getParameter(context.MAX_RENDERBUFFER_SIZE);
            var dims = context.getParameter(context.MAX_VIEWPORT_DIMS);
            this.maxViewportDims0 = dims['0'];
            this.maxViewportDims1 = dims['1'];
            this.maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
            this.maxCubeMapTextureSize = context.getParameter(context.MAX_CUBE_MAP_TEXTURE_SIZE);
            this.maxCombinedTextureImageUnits = context.getParameter(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            var attributes = context.getContextAttributes();
            this.attributesAlpha = attributes.alpha;
            this.attributesDepth = attributes.depth;
            this.attributesStencil = attributes.stencil;
            this.attributesAntialias = attributes.antialias;
            this.attributesPremultipliedAlpha = attributes.premultipliedAlpha;
            this.attributesPreserveDrawingBuffer = attributes.preserveDrawingBuffer;
            this.majorPerformanceCaveat = this.getMajorPerformanceCaveat();
            this.detectShaderPrecisionFormat(context);
            this.supportedExtensions = context.getSupportedExtensions();
            this.supported = true;
            this.detectError = false;
        }
        catch (e) {
            this.detectError = true;
        }
    }
    WebGLDescriber.prototype.getMajorPerformanceCaveat = function () {
        //let canvas = $('<canvas />', { width : '1', height : '1' }).appendTo('body');
        var canvas = document.createElement('canvas');
        var opts = { failIfMajorPerformanceCaveat: true };
        var context = (canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts));
        if (!context) {
            return 'yes';
        }
        if (context.getContextAttributes().failIfMajorPerformanceCaveat === undefined) {
            // If getContextAttributes() doesn't include the failIfMajorPerformanceCaveat
            // property, assume the browser doesn't implement it yet.
            return 'not_supported';
        }
        return 'no';
    };
    WebGLDescriber.prototype.detectVieoCard = function (context) {
        try {
            var extension = this.getExtension(context, 'WEBGL_debug_renderer_info');
            if (!extension) {
                this.videoCard = 'no WEBGL_debug_renderer_info extension found';
                return;
            }
            this.videoVendor = context.getParameter(extension.UNMASKED_VENDOR_WEBGL);
            this.videoCard = context.getParameter(extension.UNMASKED_RENDERER_WEBGL);
        }
        catch (e) {
            this.videoCard = 'detecting error';
        }
    };
    WebGLDescriber.prototype.getExtension = function (context, name) {
        if (!context) {
            return null;
        }
        try {
            var extension = context.getExtension(name);
            if (extension) {
                return extension;
            }
            else {
                for (var _i = 0, _a = ['MOZ_', 'WEBKIT_']; _i < _a.length; _i++) {
                    var prefix = _a[_i];
                    extension = context.getExtension(prefix + name);
                    if (extension) {
                        return extension;
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
        return null;
    };
    WebGLDescriber.prototype.detectShaderPrecisionFormat = function (context) {
        try {
            this.shaderPrecisionFormats.vlf = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.LOW_FLOAT);
            this.shaderPrecisionFormats.vmf = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.MEDIUM_FLOAT);
            this.shaderPrecisionFormats.vhf = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.HIGH_FLOAT);
            this.shaderPrecisionFormats.vli = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.LOW_INT);
            this.shaderPrecisionFormats.vmi = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.MEDIUM_INT);
            this.shaderPrecisionFormats.vhi = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.HIGH_INT);
            this.shaderPrecisionFormats.flf = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.LOW_FLOAT);
            this.shaderPrecisionFormats.fmf = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.MEDIUM_FLOAT);
            this.shaderPrecisionFormats.fhf = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.HIGH_FLOAT);
            this.shaderPrecisionFormats.fli = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.LOW_INT);
            this.shaderPrecisionFormats.fmi = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.MEDIUM_INT);
            this.shaderPrecisionFormats.fhi = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.HIGH_INT);
        }
        catch (e) { }
    };
    WebGLDescriber.prototype.getDescibedShaderPrecisionFormat = function (context, shaderType, precisionType) {
        var shpf = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.LOW_FLOAT);
        return { rangeMin: shpf.rangeMin, rangeMax: shpf.rangeMax, precision: shpf.precision };
    };
    WebGLDescriber.prototype.toString = function () {
        return JSON.stringify(this, null, 4);
    };
    return WebGLDescriber;
}());
var ShaderPrecisionFormats = (function () {
    function ShaderPrecisionFormats() {
    }
    return ShaderPrecisionFormats;
}());
/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
function murmurhash3_32_gc(key, seed) {
    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;
    while (i < bytes) {
        k1 =
            ((key.charCodeAt(i) & 0xff)) |
                ((key.charCodeAt(++i) & 0xff) << 8) |
                ((key.charCodeAt(++i) & 0xff) << 16) |
                ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;
        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }
    k1 = 0;
    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            k1 ^= (key.charCodeAt(i) & 0xff);
            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
    }
    h1 ^= key.length;
    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;
    return h1 >>> 0;
}
///ts:ref=WebGLDescriber
/// <reference path="./WebGLDescriber.ts"/> ///ts:ref:generated
///ts:ref=murmurhash3_32_gc
/// <reference path="./murmurhash3_32_gc.ts"/> ///ts:ref:generated
var oldOnError = window.onerror;
window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    trace(errorMsg + ' ' + lineNumber);
    if (oldOnError) {
        return oldOnError(errorMsg, url, lineNumber);
    }
    return false;
};
trace('start');
var startEvent = getEvent('mipgl1stat_inited');
sendEvent(startEvent);
trace('start event sent');
var completeEvent = getEvent('mipgl1stat');
var triagSize = 1;
var canvas = document.getElementById("main-canvas");
var opts = {
    preserveDrawingBuffer: true,
    stencil: true
};
trace('creating context');
var gl = (canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts));
trace('context created ' + !!gl);
if (gl) {
    var vertexSrc = "\n    attribute vec3 aVertexPosition;\n    attribute vec2 aTextureCoord;\n\n    varying vec2 vTextureCoord;\n\n\n    void main(void) {\n        gl_Position = vec4(aVertexPosition, 1.0);\n        vTextureCoord = aTextureCoord;\n    }";
    var fragmentSrc = "\n    precision mediump float;\n\n    varying vec2 vTextureCoord;\n\n    uniform sampler2D uSampler;\n\n    void main(void) {\n        gl_FragColor = texture2D(uSampler, vec2(pow((vTextureCoord.s-0.5)*(vTextureCoord.s-0.5) + (vTextureCoord.t-0.5)*(vTextureCoord.t-0.5), 0.1), vTextureCoord.t));\n        //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s, vTextureCoord.t*vTextureCoord.t*vTextureCoord.t*vTextureCoord.t));\n        //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n    }";
    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSrc);
    gl.compileShader(vertex);
    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        trace(gl.getShaderInfoLog(vertex));
    }
    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSrc);
    gl.compileShader(fragment);
    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        trace(gl.getShaderInfoLog(fragment));
    }
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertex);
    gl.attachShader(shaderProgram, fragment);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        trace(gl.getProgramInfoLog(shaderProgram));
    }
    gl.useProgram(shaderProgram);
    var vertexPositionAttribute_1 = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute_1);
    var textureCoordAttribute_1 = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute_1);
    var samplerUniform_1 = gl.getUniformLocation(shaderProgram, "uSampler");
    var cubeVertexPositionBuffer_1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer_1);
    var vertices = [
        // Front face
        -triagSize, triagSize, 1.0,
        triagSize, -triagSize, 1.0,
        triagSize, triagSize, 1.0,
        -triagSize, triagSize, 1.0,
        -triagSize, -triagSize, 1.0,
        triagSize, -triagSize, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    var cubeVertexTextureCoordBuffer_1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer_1);
    var textureCoords = [
        // Front face
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    var texture_1 = gl.createTexture();
    var image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture_1);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        function loadMip(level, size, color) {
            var bytes = new Array();
            for (var i_1 = 0; i_1 < size * size * 4; i_1 += 4) {
                bytes[i_1 + 0] = (color & 0xFF000000) >> 24;
                bytes[i_1 + 1] = (color & 0x00FF0000) >> 16;
                bytes[i_1 + 2] = (color & 0x0000FF00) >> 8;
                bytes[i_1 + 3] = (color & 0x000000FF);
            }
            var data = new Uint8Array(bytes.length); //Uint8Array.from(bytes);
            for (var i = 0; i < data.length; i++) {
                data[i] = bytes[i];
            }
            gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        }
        loadMip(1, 256, 0xFF0000FF);
        loadMip(2, 128, 0x00FF00FF);
        loadMip(3, 64, 0x0000FFFF);
        loadMip(4, 32, 0xFF0000FF);
        loadMip(5, 16, 0x00FF00FF);
        loadMip(6, 8, 0x0000FFFF);
        loadMip(7, 4, 0xFF0000FF);
        loadMip(8, 2, 0x00FF00FF);
        loadMip(9, 1, 0x0000FFFF);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer_1);
        gl.vertexAttribPointer(vertexPositionAttribute_1, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer_1);
        gl.vertexAttribPointer(textureCoordAttribute_1, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture_1);
        gl.uniform1i(samplerUniform_1, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.flush();
        putImageData(completeEvent, canvas);
        putGlDescribingInfo(completeEvent);
        sendEvent(completeEvent);
        trace('event sent');
    };
    image.src = "normal.png";
}
else {
    var notSupportedPre = document.createElement('p');
    notSupportedPre.textContent = 'webGL is not supported';
    document.body.insertBefore(notSupportedPre, canvas);
    document.body.removeChild(canvas);
    completeEvent['supported/i'] = 0;
    sendEvent(completeEvent);
    trace('event sent');
}
var showAll = document.getElementById('showAll');
showAll.onclick = function () {
    var pre = document.createElement('pre');
    pre.textContent = JSON.stringify(completeEvent, function (key, value) {
        if (key == 'imgData/s') {
            return undefined;
        }
        else {
            return value;
        }
    }, '\t');
    document.body.appendChild(pre);
    return false;
};
var send = document.getElementById('sendButon');
send.onclick = function () {
    var modelElem = document.getElementById('device');
    var modelText = modelElem.value;
    completeEvent['deviceModel/s'] = modelText;
    sendEvent(completeEvent);
    var thanks = document.createElement('span');
    thanks.textContent = 'Thanks!';
    document.body.insertBefore(thanks, send);
    document.body.removeChild(send);
    return false;
};
function getEvent(type) {
    var event = {};
    event['project/s'] = 'mipExploration';
    event['type/s'] = type;
    event['uid/s'] = getUID();
    event['userAgent/s'] = navigator.userAgent;
    event['officiallySupported/i'] = +!!window['WebGLRenderingContext'];
    if (window.screen && typeof window.screen.width === 'number') {
        event['screenWidth/i'] = window.screen.height;
        event['screenHeight/i'] = window.screen.width;
    }
    return event;
}
var glDescriber = null;
function getGlDecriber() {
    if (!glDescriber) {
        glDescriber = new WebGLDescriber(gl);
    }
    return glDescriber;
}
function putImageData(event, canvas) {
    var imgData = canvas.toDataURL();
    event['imgData/s'] = imgData;
    event['imgHash/i'] = murmurhash3_32_gc(imgData, 15); // 15 because I want
}
var canvas2 = null;
var gl2 = null;
function getGl2Supported() {
    if (!gl2 && !canvas2) {
        canvas2 = document.createElement('canvas');
        gl2 = (canvas2.getContext("webgl2", opts) || canvas.getContext("experimental-webgl2", opts));
    }
    return !!gl2;
}
function putGlDescribingInfo(event) {
    event['webGl2Supported/i'] = +getGl2Supported();
    var glDescriber = getGlDecriber();
    event['detectError/i'] = +glDescriber.detectError;
    event['videoCard/s'] = glDescriber.videoCard;
    event['videoVendor/s'] = glDescriber.videoVendor;
    event['supported/i'] = +glDescriber.supported;
    event['version/s'] = glDescriber.version;
    event['shadingVesion/s'] = glDescriber.shadingVesion;
    event['maxVertexAttributes/i'] = glDescriber.maxVertexAttributes;
    event['maxVertexUniformVectors/i'] = glDescriber.maxVertexUniformVectors;
    event['maxVertexTextureImageUnits/i'] = glDescriber.maxVertexTextureImageUnits;
    event['maxVaryingVectors/i'] = glDescriber.maxVaryingVectors;
    event['maxFragmentUniformVectors/i'] = glDescriber.maxFragmentUniformVectors;
    event['maxTextureImageUnits/i'] = glDescriber.maxTextureImageUnits;
    event['redBits/i'] = glDescriber.redBits;
    event['greenBits/i'] = glDescriber.greenBits;
    event['blueBits/i'] = glDescriber.blueBits;
    event['alphaBits/i'] = glDescriber.alphaBits;
    event['depthBits/i'] = glDescriber.depthBits;
    event['stencilBits/i'] = glDescriber.stencilBits;
    event['maxViewportDims0/i'] = glDescriber.maxViewportDims0;
    event['maxViewportDims1/i'] = glDescriber.maxViewportDims1;
    event['maxTextureSize/i'] = glDescriber.maxTextureSize;
    event['maxCubeMapTextureSize/i'] = glDescriber.maxCubeMapTextureSize;
    event['maxCombinedTextureImageUnits/i'] = glDescriber.maxCombinedTextureImageUnits;
    event['attributesAlpha/i'] = +glDescriber.attributesAlpha;
    event['attributesAntialias/i'] = +glDescriber.attributesAntialias;
    event['attributesDepth/i'] = +glDescriber.attributesDepth;
    event['attributesPremultipliedAlpha/i'] = +glDescriber.attributesPremultipliedAlpha;
    event['attributesPreserveDrawingBuffer/i'] = +glDescriber.attributesPreserveDrawingBuffer;
    event['attributesStencil/i'] = +glDescriber.attributesStencil;
    event['majorPerformanceCaveat/s'] = glDescriber.majorPerformanceCaveat;
    for (var _i = 0, _a = glDescriber.supportedExtensions; _i < _a.length; _i++) {
        var extension = _a[_i];
        event[extension + '/i'] = 1;
    }
    event['shaderPrecisionFormats/s'] = JSON.stringify(glDescriber.shaderPrecisionFormats);
}
var uidCache;
function getUID() {
    if (uidCache) {
        return uidCache;
    }
    if (isLocalStorageAvailable()) {
        if (localStorage.getItem('uid') === null) {
            uidCache = genUID();
            localStorage.setItem('uid', uidCache);
            return uidCache;
        }
        else {
            return localStorage.getItem('uid');
        }
    }
    else {
        uidCache = genUID();
        return uidCache;
    }
}
function genUID() {
    return '' + Math.floor(Math.random() * Math.pow(2, 52));
}
// any js api is shit! https://stackoverflow.com/a/16427747/590326
function isLocalStorageAvailable() {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    }
    catch (e) {
        return false;
    }
}
function sendEvent(event) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        trace('state ' + xhr.readyState);
        if (xhr.readyState === 4) {
            trace(xhr.responseText + xhr.status);
        }
        ;
    };
    xhr.open('POST', 'http://cutiestat.cutiedie.com/event', true);
    xhr.setRequestHeader('Content-type', 'text/plain');
    xhr.send(JSON.stringify([event]));
}
function trace(str) {
    console.log(str);
    // let pre = document.createElement('pre');
    // pre.textContent = str;
    // document.body.appendChild(pre);
}
//# sourceMappingURL=app.js.map