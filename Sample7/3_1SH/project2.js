var gl;
var points = [];
var normals = [];
var texCoords = [];

var program0, program1, program2;     // [program1] Phong shading, [program2] Texture Mapping
var modelViewMatrixLoc0, modelViewMatrixLoc1, modelViewMatrixLoc2;

var eye = vec3(10, 10, 10);
var at = vec3(0, 1, 0);
const up = vec3(0, 1, 0);
var cameraVec = vec3(-3, -3, -3); // 1.0/Math.sqrt(2.0)

var theta = 0;
var trballMatrix = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
var vertCubeStart, vertCubeEnd, vertHexaStart, vertHexaEnd, vertGroundStart, vertGroundEnd;

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if( !gl ) {
        alert("WebGL isn't available!");
    }

    generateTexCube();
    generateHexaPyramid();
    generateTexGround(50);

    // virtual trackball
    var trball = trackball(canvas.width, canvas.height);
    var mouseDown = false;

    canvas.addEventListener("mousedown", function (event) {
        trball.start(event.clientX, event.clientY);

        mouseDown = true;
    });

    canvas.addEventListener("mouseup", function (event) {
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", function (event) {
        if (mouseDown) {
            trball.end(event.clientX, event.clientY);

            trballMatrix = mat4(trball.rotationMatrix);
        }
    });

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    program0 = initShaders(gl, "colorVS", "colorFS");
    gl.useProgram(program0);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program0, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var viewMatrix = lookAt(eye, at, up);
    modelViewMatrixLoc0 = gl.getUniformLocation(program0, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc0, false, flatten(viewMatrix));

    /*
    // 3D orthographic viewing
    var viewLength = 2.0;
    if (canvas.width > canvas.height) {
        var aspect = viewLength * canvas.width / canvas.height;
        projectionMatrix = ortho(-aspect, aspect, -viewLength, viewLength, -viewLength, 1000);
    }
    else {
        var aspect = viewLength * canvas.height / canvas.width;
        projectionMatrix = ortho(-viewLength, viewLength, -aspect, aspect, -viewLength, 1000);
    }
    */
    // 3D perspective viewing
    var aspect = canvas.width / canvas.height;
    projectionMatrix = perspective(90, aspect, 0.1, 1000); 
    var projectionMatrixLoc = gl.getUniformLocation(program0, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
/*
    ///////////////////////////////////////////////////////////////////////////
    // program1 : Phong Shading

    program1 = initShaders(gl, "phongVS", "phongFS");
    gl.useProgram(program1);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    vPosition = gl.getAttribLocation(program1, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create a buffer object, initialize it, and associate it with 
    // the associated attribute variable in our vertex shader
    var nBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program1, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    modelViewMatrixLoc1 = gl.getUniformLocation(program1, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc1, false, flatten(viewMatrix));
    
    // 3D perspective viewing
    projectionMatrixLoc = gl.getUniformLocation(program1, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    setLighting(program1);
*/
    ///////////////////////////////////////////////////////////////////////////
    // program2 : Texture Mapping

    program2 = initShaders(gl, "texMapVS", "texMapFS");
    gl.useProgram(program2);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    vPosition = gl.getAttribLocation(program2, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create a buffer object, initialize it, and associate it with 
    // the associated attribute variable in our vertex shader
    nBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    vNormal = gl.getAttribLocation(program2, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var tBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program2, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    modelViewMatrixLoc2 = gl.getUniformLocation(program2, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(viewMatrix));

    // 3D perspective viewing
    projectionMatrixLoc = gl.getUniformLocation(program2, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    setLighting(program2);


    
    // Event listeners for buttons
    var sinTheta = Math.sin(0.1);
    var cosTheta = Math.cos(0.1);
    document.getElementById("left").onclick = function () {
        var newVecX = cosTheta*cameraVec[0] + sinTheta*cameraVec[2];
        var newVecZ = -sinTheta*cameraVec[0] + cosTheta*cameraVec[2];
        cameraVec[0] = newVecX;
        cameraVec[2] = newVecZ;
    };
    document.getElementById("right").onclick = function () {
        var newVecX = cosTheta*cameraVec[0] - sinTheta*cameraVec[2];
        var newVecZ = sinTheta*cameraVec[0] + cosTheta*cameraVec[2];
        cameraVec[0] = newVecX;
        cameraVec[2] = newVecZ;
    };
    document.getElementById("up").onclick = function () {
        var newPosX = eye[0] + 0.5 * cameraVec[0];
        var newPosZ = eye[2] + 0.5 * cameraVec[2];
        if (newPosX > -30 && newPosX < 30 && newPosZ > -30 && newPosZ < 30 ) {
            eye[0] = newPosX;
            eye[2] = newPosZ;
        }
    };
    document.getElementById("down").onclick = function () {
        var newPosX = eye[0] - 0.5 * cameraVec[0];
        var newPosZ = eye[2] - 0.5 * cameraVec[2];
        if (newPosX > -30 && newPosX < 30 && newPosZ > -30 && newPosZ < 30 ) {
            eye[0] = newPosX;
            eye[2] = newPosZ;
        }
    };


    setTexture();

    render();
};

function setLighting(program) {
    var lightPos = [0.0, 3.0, 0.0, 0.0];
    var lightAmbient = [1.0, 1.0, 1.0, 1.0];
    var lightDiffuse = [1.0, 1.0, 1.0, 1.0];
    var lightSpecular = [0.0, 0.0, 0.0, 1.0];

    var matAmbient = [1.0, 1.0, 1.0, 1.0];
    var matDiffuse = [1.0, 1.0, 1.0, 1.0];
    var matSpecular = [1.0, 1.0, 1.0, 1.0];
    
    var ambientProduct = mult(lightAmbient, matAmbient);
    var diffuseProduct = mult(lightDiffuse, matDiffuse);
    var specularProduct = mult(lightSpecular, matSpecular);

    var lightPosLoc = gl.getUniformLocation(program, "lightPos");
    gl.uniform4fv(lightPosLoc, lightPos);
    var ambientProductLoc = gl.getUniformLocation(program, "ambientProduct")
    gl.uniform4fv(ambientProductLoc, ambientProduct);
    var diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, diffuseProduct);
    var specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    gl.uniform4fv(specularProductLoc, specularProduct);
    
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), 50.0);
}

function setTexture() {
    var image = new Image();
    image.src = "images/s11.bmp";
    
    var texture0 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    var image1 = new Image();
    image1.src = "images/g11.bmp"
    
    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//---------------------------render-------------------------------
//-------------------------------------------------------------------
//-----------------------------------------------------------------

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    at[0] = eye[0] + cameraVec[0];
    at[1] = eye[1] + cameraVec[1];
    at[2] = eye[2] + cameraVec[2];
    var viewMatrix = lookAt(eye, at, up);

    var colorLoc = gl.getUniformLocation(program0, "uColor");
    
    // draw the ground
    gl.useProgram(program2);
    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 1);

    modelViewMatrix = mult(viewMatrix, trballMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, vertGroundStart, vertGroundEnd);

    // draw a outer cube bottom1
    for (var z=0; z<30; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 24.0;
        var theta30 = 2 * Math.PI / 30.0 * z;
        
        var rMatrix = mult(rotateY(12 * z), scalem(1, 8, 3));

        var modelMatrix = mult(translate(r*Math.cos(theta30), 0.5, r*Math.sin(theta30)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }

    // draw outer cube top
    for (var z=0; z<30; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 24.0;
        var theta30 = 2 * Math.PI / 30.0 * z;
        
        var rMatrix = mult(rotateY(12 * z), scalem(1, 2, 6));

        var modelMatrix = mult(translate(r*Math.cos(theta30), 5, r*Math.sin(theta30)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }

    // draw inner slim stone
    for (var z=0; z<30; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 18.0;
        var theta30 = 2 * Math.PI / 30.0 * z;
        
        var rMatrix = mult(rotateY(12 * z), scalem(1, 5, 1));

        var modelMatrix = mult(translate(r*Math.cos(theta30), 0, r*Math.sin(theta30)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }

    //draw in bigger up stone1-1
    for(var z = 0; z<2; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 10.0;
        var theta30 = Math.PI / 2.5 * z;

        var rMatrix = mult(rotateY(60 * z), scalem(2, 12, 3));

        var modelMatrix = mult(translate(r * Math.cos(theta30+Math.PI/90.0), 0, r * Math.sin(theta30+Math.PI/90.0)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);

        rMatrix = mult(rotateY(-60 * z), scalem(2, 12, 3));
        modelMatrix = mult(translate(-r * Math.cos(theta30+Math.PI/90.0), 0, r * Math.sin(theta30+Math.PI/90.0)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);

    }

    //draw in bigger up stone 1-2

    for(var z = 1; z<2; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 10.0;

        var rMatrix = mult(rotateY(Math.PI/7.0 * z), scalem(2, 12, 3));

        var modelMatrix = mult(translate(r * Math.cos(Math.PI/7.0), 0, r * Math.sin(Math.PI/7.0)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);

        rMatrix = mult(rotateY(-Math.PI/7.0 * z), scalem(2, 12, 3));
        modelMatrix = mult(translate(-r * Math.cos(Math.PI/7.0), 0, r * Math.sin(Math.PI/7.0)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }

    // draw in bigger up top stone
    for(var z = 0; z<3; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 9.5;
        var theta30 =  Math.PI/2.4 * z;
        

        var rMatrix = mult(rotateY(87.5 * z), scalem(2, 2, 7));

        var modelMatrix = mult(translate(r * Math.cos(theta30+Math.PI/11), 7, r * Math.sin(theta30+Math.PI/11)), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }
    
    // draw in bigger down stone
    for(var z = 0; z<2; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 10.0;
        var theta1 = Math.PI * z;

        var rMatrix = mult(rotateY(Math.PI * z), scalem(2, 12, 3));

        var modelMatrix = mult(translate(r * Math.cos(theta1), 0, r * Math.sin(theta1)-11), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);

        modelMatrix = mult(translate(r * Math.cos(theta1), 0, r * Math.sin(theta1)-6), rMatrix)
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }
        

    // draw in bigger down top stone
    for(var z=0; z<2; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

        var r = 10.0;
        var theta1 = Math.PI*z;
        
        var rMatrix = mult(rotateY(Math.PI * z), scalem(2, 2, 7));

        var modelMatrix = mult(translate(r * Math.cos(theta1), 7, r * Math.sin(theta1)-8.5), rMatrix);
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }

    //draw in slim down stone

    for(var i = 0; i<3; i++) {
        for(var z=0; z<2; z++) {
            
            gl.useProgram(program2);
            gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);
    
            var r = 7.0;
            var theta1 = Math.PI*z;
    
            var rMatrix = mult(rotateY(Math.PI*z), scalem(1, 5, 1));
            var modelMatrix = mult(translate(r*Math.cos(theta1), 0, r*Math.sin(theta1)-9 + i*1.5), rMatrix);
    
            modelMatrix = mult(trballMatrix, modelMatrix);
            modelViewMatrix = mult(viewMatrix, modelMatrix);
            gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
            gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
        }
    }

    //draw in slim up stone1
    for(var i = 0; i<3; i++) {
        for(var z = 0; z<2; z++) {
            
            gl.useProgram(program2);
            gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);
    
            var r = 7.0;
            var theta1 = Math.PI*z;
    
            var rMatrix = mult(rotateY(Math.PI*z), scalem(1, 5, 1));
            var modelMatrix = mult(translate(r*Math.cos(theta1), 0, r*Math.sin(theta1) + 1 + i*1.5), rMatrix);
    
            modelMatrix = mult(trballMatrix, modelMatrix);
            modelViewMatrix = mult(viewMatrix, modelMatrix);
            gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
            gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
        }
    }

    //draw in slim center stone
    for(var z = 0; z<3; z++) {
        
        gl.useProgram(program2);
        gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);
    
        var theta1 = Math.PI*z;
    
        var rMatrix = scalem(1, 5, 1);
        var modelMatrix = mult(translate((2-2*z), 0, 7), rMatrix);
    
        modelMatrix = mult(trballMatrix, modelMatrix);
        modelViewMatrix = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);
    }

    //draw table
    
    gl.useProgram(program2);
    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

    var rMatrix = scalem(5, 2, 3);
    var modelMatrix = mult(translate(0, 0, 4), rMatrix);
    modelMatrix = mult(trballMatrix, modelMatrix);
    modelViewMatrix = mult(viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, vertCubeStart, vertCubeEnd);

    requestAnimationFrame(render);
}

function generateTexCube() {
    vertCubeStart = points.length;
    vertCubeEnd = 0;
    texQuad(1, 0, 3, 2);
    texQuad(2, 3, 7, 6);
    texQuad(3, 0, 4, 7);
    texQuad(4, 5, 6, 7);
    texQuad(5, 4, 0, 1);
    texQuad(6, 5, 1, 2);
}

function texQuad(a, b, c, d) {

    const vertexPos = [
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4( 0.5, -0.5, -0.5, 1.0),
        vec4( 0.5,  0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4( 0.5, -0.5,  0.5, 1.0),
        vec4( 0.5,  0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0)
    ];

    const vertexNormals = [
        vec4(-0.57735, -0.57735, -0.57735, 0.0),
        vec4( 0.57735, -0.57735, -0.57735, 0.0),
        vec4( 0.57735,  0.57735, -0.57735, 0.0),
        vec4(-0.57735,  0.57735, -0.57735, 0.0),
        vec4(-0.57735, -0.57735,  0.57735, 0.0),
        vec4( 0.57735, -0.57735,  0.57735, 0.0),
        vec4( 0.57735,  0.57735,  0.57735, 0.0),
        vec4(-0.57735,  0.57735,  0.57735, 0.0)
    ];

    const texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    // two triangles: (a, b, c) and (a, c, d)
    // solid colored faces
    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    texCoords.push(texCoord[0]);
    vertCubeEnd++;

    points.push(vertexPos[b]);
    normals.push(vertexNormals[b]);
    texCoords.push(texCoord[1]);
    vertCubeEnd++;

    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    texCoords.push(texCoord[2]);
    vertCubeEnd++;

    points.push(vertexPos[a]);
    normals.push(vertexNormals[a]);
    texCoords.push(texCoord[0]);
    vertCubeEnd++;

    points.push(vertexPos[c]);
    normals.push(vertexNormals[c]);
    texCoords.push(texCoord[2]);
    vertCubeEnd++;

    points.push(vertexPos[d]);
    normals.push(vertexNormals[d]);
    texCoords.push(texCoord[3]);
    vertCubeEnd++;
}

function generateTexGround(scale) {
    vertGroundStart = points.length;
    vertGroundEnd = 0;
    for(var x=-scale; x<scale; x++) {
        for(var z=-scale; z<scale; z++) {
            // two triangles
            points.push(vec4(x, -1.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(0, 0));
            vertGroundEnd++;
            
            points.push(vec4(x, -1.0, z+1, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(0, 1));
            vertGroundEnd++;

            points.push(vec4(x+1, -1.0, z+1, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(1, 1)); 
            vertGroundEnd++;

            points.push(vec4(x, -1.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(0, 0));
            vertGroundEnd++;

            points.push(vec4(x+1, -1.0, z+1, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(1, 1));
            vertGroundEnd++;

            points.push(vec4(x+1, -1.0, z, 1.0));
            normals.push(vec4(0.0, 1.0, 0.0, 0.0));
            texCoords.push(vec2(1, 0));
            vertGroundEnd++;
        }
    }
}

function generateHexaPyramid() {
    const vertexPos = [
        vec4(0.0, 0.5, 0.0, 1.0),
        vec4(1.0, 0.5, 0.0, 1.0),
        vec4(0.5, 0.5, -0.866, 1.0),
        vec4(-0.5, 0.5, -0.866, 1.0),
        vec4(-1.0, 0.5, 0.0, 1.0),
        vec4(-0.5, 0.5, 0.866, 1.0),
        vec4(0.5, 0.5, 0.866, 1.0),
        vec4(0.0, -1.0, 0.0, 1.0)
    ];

    const vertexNormal = [
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.5, 0.0, -0.866, 0.0),
        vec4(-0.5, 0.0, -0.866, 0.0),
        vec4(-1.0, 0.0, 0.0, 0.0),
        vec4(-0.5, 0.0, 0.866, 0.0),
        vec4(0.5, 0.0, 0.866, 0.0),
        vec4(0.0, -1.0, 0.0, 0.0)
    ];

    vertHexaStart = points.length;
    vertHexaEnd = 0;
    for (var i=1; i<6; i++) {
        points.push(vertexPos[0]);
        normals.push(vertexNormal[0]);
        vertHexaEnd++;

        points.push(vertexPos[i]);
        normals.push(vertexNormal[0]);
        vertHexaEnd++;

        points.push(vertexPos[i+1]);
        normals.push(vertexNormal[0]);
        vertHexaEnd++;

        points.push(vertexPos[7]);
        normals.push(vertexNormal[7]);
        vertHexaEnd++;

        points.push(vertexPos[i+1]);
        normals.push(vertexNormal[i+1]);
        vertHexaEnd++;

        points.push(vertexPos[i]);
        normals.push(vertexNormal[i]);
        vertHexaEnd++;
    }
    points.push(vertexPos[0]);
    normals.push(vertexNormal[0]);
    vertHexaEnd++;

    points.push(vertexPos[6]);
    normals.push(vertexNormal[0]);
    vertHexaEnd++;

    points.push(vertexPos[1]);
    normals.push(vertexNormal[0]);
    vertHexaEnd++;

    points.push(vertexPos[7]);
    normals.push(vertexNormal[7]);
    vertHexaEnd++;

    points.push(vertexPos[1]);
    normals.push(vertexNormal[1]);
    vertHexaEnd++;

    points.push(vertexPos[6]);
    normals.push(vertexNormal[6]);
    vertHexaEnd++;
}
