console.log('hello world');
var vertexSrc = "\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nvarying vec2 vTextureCoord;\n\n\nvoid main(void) {\n    gl_Position = vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n}";
var fragmentSrc = "\nprecision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void) {\n    gl_FragColor = texture2D(uSampler, vec2(pow((vTextureCoord.s-0.5)*(vTextureCoord.s-0.5) + (vTextureCoord.t-0.5)*(vTextureCoord.t-0.5), 0.1), vTextureCoord.t));\n    //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s*vTextureCoord.s, vTextureCoord.t*vTextureCoord.t*vTextureCoord.t*vTextureCoord.t));\n    //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n}";
var triagSize = 1;
var canvas = document.getElementById("main-canvas");
var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
gl.viewportWidth = canvas.width;
gl.viewportHeight = canvas.height;
var vertex = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertex, vertexSrc);
gl.compileShader(vertex);
if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertex));
}
var fragment = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragment, fragmentSrc);
gl.compileShader(fragment);
if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(fragment));
}
var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertex);
gl.attachShader(shaderProgram, fragment);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(shaderProgram));
}
gl.useProgram(shaderProgram);
var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
gl.enableVertexAttribArray(vertexPositionAttribute);
var textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
gl.enableVertexAttribArray(textureCoordAttribute);
var samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
var cubeVertexPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
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
var cubeVertexTextureCoordBuffer = gl.createBuffer();
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
var texture = gl.createTexture();
texture.image = new Image();
texture.image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
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
};
texture.image.src = "normal.png";
//# sourceMappingURL=app.js.map