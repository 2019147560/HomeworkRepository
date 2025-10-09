// util/gl-utils.js

/**
 * 셰이더 소스를 컴파일하고 셰이더 객체를 반환합니다.
 */
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/**
 * 셰이더 두 개를 링크하여 WebGL 프로그램 객체를 생성합니다.
 */
function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

/**
 * 2D 변환 행렬을 생성하는 헬퍼 함수들을 여기에 포함합니다. (매트릭스 라이브러리 가정)
 * 이 예시에서는 직접 구현합니다.
 */

// 2D 이동(Translation) 행렬
function getTranslationMatrix(tx, ty) {
    return [
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1
    ];
}

// 2D 회전(Rotation) 행렬 (라디안)
function getRotationMatrix(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    return [
        c, -s, 0,
        s, c, 0,
        0, 0, 1
    ];
}

// 2D 스케일(Scaling) 행렬
function getScalingMatrix(sx, sy) {
    return [
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1
    ];
}

// 행렬 곱셈 (3x3 * 3x3)
function multiplyMatrices(a, b) {
    const c = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            c[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[j + 3] + a[i * 3 + 2] * b[j + 6];
        }
    }
    return c;
}