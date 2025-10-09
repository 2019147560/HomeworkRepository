// main.js - 계층적 회전 구조 (주석 제거 버전)

const PI = 3.14159265359;
let startTime = 0;

const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat3 uMatrix;

    varying vec4 vColor;

    void main() {
        vec3 position = uMatrix * vec3(aVertexPosition.xy, 1.0);
        gl_Position = vec4(position.xy, 0.0, 1.0);
        vColor = aVertexColor;
    }
`;

const fsSource = `
    precision mediump float;
    varying vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
`;

function initWebGL() {
    const canvas = document.getElementById('glcanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert("WebGL 컨텍스트를 초기화할 수 없습니다.");
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0); 

    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    
    if (!shaderProgram) return;

    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    const colorLocation = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    const matrixLocation = gl.getUniformLocation(shaderProgram, 'uMatrix');

    const { 
        positionBuffer, 
        colorBuffer, 
        numVertices, 
        rectData 
    } = setupBuffers(gl); 

    if (!positionBuffer || !colorBuffer) return;

    startTime = performance.now();
    drawScene(gl, shaderProgram, positionLocation, colorLocation, matrixLocation, 
              positionBuffer, colorBuffer, rectData); 
}

function setupBuffers(gl) {
    const vertices = [];
    const colors = [];
    
    const rectData = [];
    let vertexOffset = 0;

    const addRect = (centerX, centerY, width, height, r, g, b, a) => {
        const x1 = centerX - width / 2;
        const y1 = centerY - height / 2;
        const x2 = centerX + width / 2;
        const y2 = centerY + height / 2;

        const rectVertices = [
            x1, y1, x2, y1, x1, y2,
            x1, y2, x2, y1, x2, y2,
        ];
        vertices.push(...rectVertices);
        
        for (let i = 0; i < 6; i++) {
            colors.push(r, g, b, a);
        }
        
        const data = {
            offset: vertexOffset,
            count: 6,
            center: [centerX, centerY],
            width: width,
            height: height
        };
        rectData.push(data);
        vertexOffset += 6;
        return data;
    };

    const rect1Data = addRect(0.0, -0.5, 0.1, 1.0, 0.55, 0.27, 0.07, 1.0); 

    const rect2CenterY = rect1Data.center[1] + rect1Data.height / 2;
    const rect2Data = addRect(0.0, rect2CenterY, 0.6, 0.08, 1.0, 1.0, 1.0, 1.0); 
    
    const rect3Data = addRect(0.0, 0.0, 0.2, 0.05, 0.7, 0.7, 0.7, 1.0); 
    
    const rect4Data = addRect(0.0, 0.0, 0.2, 0.05, 0.7, 0.7, 0.7, 1.0); 
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return { 
        positionBuffer, 
        colorBuffer, 
        numVertices: vertexOffset, 
        rectData: rectData 
    };
}


function drawScene(gl, program, positionLoc, colorLoc, matrixLoc, 
                   positionBuffer, colorBuffer, rectData) {
    
    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / 1000.0; 

    gl.clear(gl.COLOR_BUFFER_BIT);

    const identityMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    
    const rect1 = rectData[0]; 
    const rect2 = rectData[1]; 
    const rect3 = rectData[2]; 
    const rect4 = rectData[3]; 
    
    gl.uniformMatrix3fv(matrixLoc, false, identityMatrix);
    drawObject(gl, positionLoc, colorLoc, rect1.offset, rect1.count, positionBuffer, colorBuffer);
    
    const rect2PivotX = rect2.center[0]; 
    const rect2PivotY = rect2.center[1]; 
    
    const whiteRotation = Math.sin(elapsedTime) * PI * 2.0; 

    let M_white = getTranslationMatrix(-rect2PivotX, -rect2PivotY);
    M_white = multiplyMatrices(getRotationMatrix(whiteRotation), M_white);
    M_white = multiplyMatrices(getTranslationMatrix(rect2PivotX, rect2PivotY), M_white);

    gl.uniformMatrix3fv(matrixLoc, false, M_white);
    drawObject(gl, positionLoc, colorLoc, rect2.offset, rect2.count, positionBuffer, colorBuffer);

    const whiteHalfW = rect2.width / 2;
    
    const grayRotation = Math.sin(elapsedTime) * PI * -5.0; 
    
    const M_local_rotation = getRotationMatrix(grayRotation); 

    let M_final3 = getTranslationMatrix(whiteHalfW, 0); 
    M_final3 = multiplyMatrices(M_local_rotation, M_final3);
    M_final3 = multiplyMatrices(M_final3, M_white);
    
    gl.uniformMatrix3fv(matrixLoc, false, M_final3);
    drawObject(gl, positionLoc, colorLoc, rect3.offset, rect3.count, positionBuffer, colorBuffer);

    let M_final4 = getTranslationMatrix(-whiteHalfW, 0); 
    M_final4 = multiplyMatrices(M_local_rotation, M_final4);
    M_final4 = multiplyMatrices(M_final4, M_white);

    gl.uniformMatrix3fv(matrixLoc, false, M_final4);
    drawObject(gl, positionLoc, colorLoc, rect4.offset, rect4.count, positionBuffer, colorBuffer);

    requestAnimationFrame(() => drawScene(gl, program, positionLoc, colorLoc, matrixLoc, 
                                          positionBuffer, colorBuffer, rectData));
}

function drawObject(gl, positionLoc, colorLoc, offset, count, positionBuffer, colorBuffer) { 
    const FSIZE = Float32Array.BYTES_PER_ELEMENT; 

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); 
    gl.vertexAttribPointer(
        positionLoc, 
        2, 
        gl.FLOAT, 
        false, 
        0, 
        offset * FSIZE * 2
    );
    gl.enableVertexAttribArray(positionLoc);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); 
    gl.vertexAttribPointer(
        colorLoc, 
        4, 
        gl.FLOAT, 
        false, 
        0, 
        offset * FSIZE * 4
    );
    gl.enableVertexAttribArray(colorLoc);

    gl.drawArrays(gl.TRIANGLES, 0, count); 
}

window.onload = initWebGL;