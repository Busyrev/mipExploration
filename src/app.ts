console.log('hello world');

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

let triagSize = 1;

let canvas:any = document.getElementById("main-canvas");
let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;

let vertex = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertex, vertexSrc);
gl.compileShader(vertex);

if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertex));
}

let fragment = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragment, fragmentSrc);
gl.compileShader(fragment);

if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragment));
}


let shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertex);
gl.attachShader(shaderProgram, fragment);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(shaderProgram));
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
    -triagSize,  triagSize,  1.0,
    triagSize, -triagSize,  1.0,
    triagSize,  triagSize,  1.0,
    -triagSize,  triagSize,  1.0,
    -triagSize, -triagSize,  1.0,
    triagSize,  -triagSize,  1.0,
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
texture.image = new Image();

texture.image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    
    
    function loadMip(level:number, size:number, color:number) {
        let bytes = new Array<number>();
        for (let i = 0; i < size*size*4; i+=4) {
            bytes[i+0] = (color & 0xFF000000) >> 24;
            bytes[i+1] = (color & 0x00FF0000) >> 16;
            bytes[i+2] = (color & 0x0000FF00) >> 8;
            bytes[i+3] = (color & 0x000000FF);
        }
        let data = new Uint8Array(bytes.length); //Uint8Array.from(bytes);
        
        for(var i = 0; i < data.length; i++) {
            data[i] = bytes[i];
        }
        gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    
    //gl.generateMipmap(gl.TEXTURE_2D);
    loadMip(1, 256, 0xFF0000FF);
    loadMip(2, 128, 0x00FF00FF);
    loadMip(3, 64, 0x0000FFFF);
    loadMip(4, 32, 0xFF0000FF);
    loadMip(5, 16, 0x00FF00FF);
    loadMip(6, 8, 0x0000FFFF);
    loadMip(7, 4, 0xFF0000FF);
    loadMip(8, 2, 0x00FF00FF);
    loadMip(9, 1, 0x0000FFFF);
    
    
    
    
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 9);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(samplerUniform, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
texture.image.src = "normal.png";

