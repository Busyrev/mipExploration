///ts:ref=WebGLDescriber
/// <reference path="./WebGLDescriber.ts"/> ///ts:ref:generated
///ts:ref=murmurhash3_32_gc
/// <reference path="./murmurhash3_32_gc.ts"/> ///ts:ref:generated


let oldOnError = window.onerror;
window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    trace(errorMsg + ' ' + lineNumber);
    if (oldOnError) {
        return oldOnError(errorMsg, url, lineNumber);
    }

    return false;
}

trace('start');

let startEvent: Record<string, any> = getEvent('mipgl1stat_inited');
sendEvent(startEvent);
trace('start event sent');


let completeEvent = getEvent('mipgl1stat');

let triagSize = 1;

let canvas: HTMLCanvasElement = document.getElementById("main-canvas") as HTMLCanvasElement;
let opts = {
    preserveDrawingBuffer: true,
    stencil: true
}

trace('creating context');
let gl: WebGLRenderingContext = (canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts)) as WebGLRenderingContext;
trace('context created ' + !!gl);

if (gl) {
    let vertexSrc = `
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    varying vec2 vTextureCoord;


    void main(void) {
        gl_Position = vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;
    }`

    let fragmentSrc = `
    precision mediump float;

    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        gl_FragColor = texture2D(uSampler, vec2(pow((vTextureCoord.s-0.5)*(vTextureCoord.s-0.5) + (vTextureCoord.t-0.5)*(vTextureCoord.t-0.5), 0.1), vTextureCoord.t));
        //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s, vTextureCoord.t*vTextureCoord.t*vTextureCoord.t*vTextureCoord.t));
        //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    }`

    let vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSrc);
    gl.compileShader(vertex);

    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        trace(gl.getShaderInfoLog(vertex));
    }

    let fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSrc);
    gl.compileShader(fragment);

    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        trace(gl.getShaderInfoLog(fragment));
    }

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertex);
    gl.attachShader(shaderProgram, fragment);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        trace(gl.getProgramInfoLog(shaderProgram));
    }

    gl.useProgram(shaderProgram);

    let vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    let textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);

    let samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");


    let cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    let vertices = [
        // Front face
        -triagSize, triagSize, 1.0,
        triagSize, -triagSize, 1.0,
        triagSize, triagSize, 1.0,
        -triagSize, triagSize, 1.0,
        -triagSize, -triagSize, 1.0,
        triagSize, -triagSize, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


    let cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
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

    let texture = gl.createTexture();
    var image = new Image();

    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);


        function loadMip(level: number, size: number, color: number) {
            let bytes = new Array<number>();
            for (let i = 0; i < size * size * 4; i += 4) {
                bytes[i + 0] = (color & 0xFF000000) >> 24;
                bytes[i + 1] = (color & 0x00FF0000) >> 16;
                bytes[i + 2] = (color & 0x0000FF00) >> 8;
                bytes[i + 3] = (color & 0x000000FF);
            }
            let data = new Uint8Array(bytes.length); //Uint8Array.from(bytes);

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

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(samplerUniform, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.flush();
       
        putImageData(completeEvent, canvas);
        putGlDescribingInfo(completeEvent);
        sendEvent(completeEvent);
        trace('event sent');
    }
    image.src = "normal.png";
} else {
    let notSupportedPre = document.createElement('p');
    notSupportedPre.textContent = 'webGL is not supported';
    document.body.insertBefore(notSupportedPre, canvas);
    document.body.removeChild(canvas);
    
    completeEvent['supported/i'] = 0;
    
    sendEvent(completeEvent);
    trace('event sent');
}

let showAll: HTMLAnchorElement = document.getElementById('showAll') as HTMLAnchorElement;
showAll.onclick = () => {
    let pre = document.createElement('pre');
    pre.textContent = JSON.stringify(completeEvent, (key, value) => {
        if (key == 'imgData/s') {
            return undefined;
        } else {
            return value;
        }
    }, '\t');
    document.body.appendChild(pre);
    return false;
}

let send: HTMLButtonElement = document.getElementById('sendButon') as HTMLButtonElement;
send.onclick = () => {
    let modelElem = document.getElementById('device') as HTMLInputElement;
    let modelText = modelElem.value;

    completeEvent['deviceModel/s'] = modelText;
    sendEvent(completeEvent);
    
    let thanks = document.createElement('span');
    thanks.textContent = 'Thanks!';
    document.body.insertBefore(thanks, send);
    document.body.removeChild(send);

    return false;
}

function getEvent(type:string): any {
    let event: Record<string, any> = {};
    event['project/s'] = 'mipExploration';
    event['type/s'] = type;
    event['uid/s'] = getUID();

    event['userAgent/s'] = navigator.userAgent;
    event['officiallySupported/i'] = +!!(<any>window)['WebGLRenderingContext'];

    if (window.screen && typeof window.screen.width === 'number') {
        event['screenWidth/i'] = window.screen.height;
        event['screenHeight/i'] = window.screen.width;
    }

    return event;
}

let glDescriber: WebGLDescriber = null;
function getGlDecriber() {
    if (!glDescriber) {
        glDescriber = new WebGLDescriber(gl);
    }
    return glDescriber;
}

function putImageData(event: any, canvas: HTMLCanvasElement): void {
    let imgData = canvas.toDataURL();
    event['imgData/s'] = imgData;
    event['imgHash/i'] = murmurhash3_32_gc(imgData, 15); // 15 because I want
}

let canvas2:HTMLCanvasElement = null;
let gl2:any = null;
function getGl2Supported(): boolean {
    if (!gl2 && !canvas2) {
        canvas2 = document.createElement('canvas');
        gl2 = (canvas2.getContext("webgl2", opts) || canvas.getContext("experimental-webgl2", opts));
    }
    return !!gl2;
}

function putGlDescribingInfo(event: any): void {
    event['webGl2Supported/i'] = +getGl2Supported();
    
    let glDescriber = getGlDecriber();
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

    for (let extension of glDescriber.supportedExtensions) {
        event[extension + '/i'] = 1;
    }
    event['shaderPrecisionFormats/s'] = JSON.stringify(glDescriber.shaderPrecisionFormats);

}

let uidCache: string = null;
function getUID(): string {
    if (uidCache !== null) {
        return uidCache;
    }
    if (isLocalStorageAvailable()) {
        if (localStorage.getItem('uid') === null) {
            uidCache = genUID();
            localStorage.setItem('uid', uidCache);
            return uidCache;
        } else {
            return localStorage.getItem('uid');
        }
    } else {
        uidCache = genUID();
        return uidCache;
    }
}

function genUID(): string {
    return '' + Math.floor(Math.random() * Math.pow(2, 52));
}

// any js api is shit! https://stackoverflow.com/a/16427747/590326
function isLocalStorageAvailable(): boolean {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

function sendEvent(event: any): any {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        trace('state ' + xhr.readyState);
        if (xhr.readyState === 4) {
            trace(xhr.responseText + xhr.status);
        };
    }

    xhr.open('POST', 'http://cutiestat.cutiedie.com/event', true);
    xhr.setRequestHeader('Content-type', 'text/plain');
    xhr.send(JSON.stringify([event]));
}

function trace(str: string) {
    console.log(str);
    // let pre = document.createElement('pre');
    // pre.textContent = str;
    // document.body.appendChild(pre);
}