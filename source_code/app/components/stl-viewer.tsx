"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

type StlViewerProps = {
  src: string;
  alt: string;
};

type MeshData = {
  positions: Float32Array;
  normals: Float32Array;
};

const identity = () => new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[row] * b[column * 4] +
        a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] +
        a[12 + row] * b[column * 4 + 3];
    }
  }
  return out;
}

function rotationX(angle: number) {
  const out = identity();
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  out[5] = cosine;
  out[6] = sine;
  out[9] = -sine;
  out[10] = cosine;
  return out;
}

function rotationY(angle: number) {
  const out = identity();
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  out[0] = cosine;
  out[2] = -sine;
  out[8] = sine;
  out[10] = cosine;
  return out;
}

function translation(z: number) {
  const out = identity();
  out[14] = z;
  return out;
}

function perspective(aspect: number) {
  const near = 0.1;
  const far = 100;
  const focal = 1 / Math.tan((42 * Math.PI) / 360);
  const out = new Float32Array(16);
  out[0] = focal / aspect;
  out[5] = focal;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

function normalizeMesh(positions: Float32Array) {
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  for (let index = 0; index < positions.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      minimum[axis] = Math.min(minimum[axis], positions[index + axis]);
      maximum[axis] = Math.max(maximum[axis], positions[index + axis]);
    }
  }
  const center = minimum.map((value, axis) => (value + maximum[axis]) / 2);
  const longestSide = Math.max(...maximum.map((value, axis) => value - minimum[axis])) || 1;
  const scale = 2 / longestSide;
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = (positions[index] - center[0]) * scale;
    positions[index + 1] = (positions[index + 1] - center[1]) * scale;
    positions[index + 2] = (positions[index + 2] - center[2]) * scale;
  }
}

function triangleNormal(vertices: number[]) {
  const edgeA = [vertices[3] - vertices[0], vertices[4] - vertices[1], vertices[5] - vertices[2]];
  const edgeB = [vertices[6] - vertices[0], vertices[7] - vertices[1], vertices[8] - vertices[2]];
  const normal = [
    edgeA[1] * edgeB[2] - edgeA[2] * edgeB[1],
    edgeA[2] * edgeB[0] - edgeA[0] * edgeB[2],
    edgeA[0] * edgeB[1] - edgeA[1] * edgeB[0],
  ];
  const length = Math.hypot(...normal) || 1;
  return normal.map((value) => value / length);
}

function parseBinaryStl(buffer: ArrayBuffer, triangleCount: number): MeshData {
  const view = new DataView(buffer);
  const positions = new Float32Array(triangleCount * 9);
  const normals = new Float32Array(triangleCount * 9);
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const source = 84 + triangle * 50;
    let normal = [
      view.getFloat32(source, true),
      view.getFloat32(source + 4, true),
      view.getFloat32(source + 8, true),
    ];
    const vertices: number[] = [];
    for (let vertex = 0; vertex < 3; vertex += 1) {
      const vertexOffset = source + 12 + vertex * 12;
      vertices.push(
        view.getFloat32(vertexOffset, true),
        view.getFloat32(vertexOffset + 4, true),
        view.getFloat32(vertexOffset + 8, true),
      );
    }
    if (Math.hypot(...normal) < 0.00001) normal = triangleNormal(vertices);
    const normalLength = Math.hypot(...normal) || 1;
    normal = normal.map((value) => value / normalLength);
    positions.set(vertices, triangle * 9);
    for (let vertex = 0; vertex < 3; vertex += 1) normals.set(normal, triangle * 9 + vertex * 3);
  }
  normalizeMesh(positions);
  return { positions, normals };
}

function parseAsciiStl(buffer: ArrayBuffer): MeshData {
  const source = new TextDecoder().decode(buffer);
  const vertexMatches = [...source.matchAll(/vertex\s+(-?[\d.e+]+)\s+(-?[\d.e+]+)\s+(-?[\d.e+]+)/gi)];
  if (vertexMatches.length < 3) throw new Error("The STL does not contain readable triangles.");
  const positions = new Float32Array(vertexMatches.length * 3);
  const normals = new Float32Array(vertexMatches.length * 3);
  vertexMatches.forEach((match, index) => {
    positions.set([Number(match[1]), Number(match[2]), Number(match[3])], index * 3);
  });
  for (let index = 0; index + 8 < positions.length; index += 9) {
    const normal = triangleNormal(Array.from(positions.slice(index, index + 9)));
    for (let vertex = 0; vertex < 3; vertex += 1) normals.set(normal, index + vertex * 3);
  }
  normalizeMesh(positions);
  return { positions, normals };
}

function parseStl(buffer: ArrayBuffer) {
  if (buffer.byteLength >= 84) {
    const triangleCount = new DataView(buffer).getUint32(80, true);
    if (triangleCount > 0 && 84 + triangleCount * 50 <= buffer.byteLength) {
      return parseBinaryStl(buffer, triangleCount);
    }
  }
  return parseAsciiStl(buffer);
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create the 3D shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unable to compile the 3D shader.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

export function StlViewer({ src, alt }: StlViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<() => void>(() => undefined);
  const rotationRef = useRef({ x: -0.72, y: 0.58 });
  const zoomRef = useRef(1);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const instructionsId = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = new AbortController();
    let resizeObserver: ResizeObserver | undefined;
    let cleanupGl = () => undefined;

    async function initialize() {
      try {
        setStatus("loading");
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load the STL file.");
        const mesh = parseStl(await response.arrayBuffer());
        const gl = canvas!.getContext("webgl", { antialias: true, alpha: true });
        if (!gl) throw new Error("WebGL is not available in this browser.");

        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, `
          attribute vec3 aPosition;
          attribute vec3 aNormal;
          uniform mat4 uMvp;
          uniform mat4 uModel;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec4 worldPosition = uModel * vec4(aPosition, 1.0);
            vPosition = worldPosition.xyz;
            vNormal = normalize(mat3(uModel) * aNormal);
            gl_Position = uMvp * vec4(aPosition, 1.0);
          }
        `);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, `
          precision mediump float;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 light = normalize(vec3(0.45, 0.8, 0.65));
            float diffuse = max(dot(normal, light), 0.0);
            float rim = pow(1.0 - max(abs(normal.z), 0.0), 2.0);
            vec3 base = vec3(0.50, 0.32, 0.72);
            vec3 color = base * (0.38 + diffuse * 0.72) + vec3(0.18, 0.12, 0.25) * rim;
            gl_FragColor = vec4(color, 1.0);
          }
        `);
        const program = gl.createProgram();
        if (!program) throw new Error("Unable to create the 3D program.");
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(program) ?? "Unable to link the 3D program.");
        }
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        const normalBuffer = gl.createBuffer();
        if (!positionBuffer || !normalBuffer) throw new Error("Unable to allocate the 3D model.");
        const positionLocation = gl.getAttribLocation(program, "aPosition");
        const normalLocation = gl.getAttribLocation(program, "aNormal");
        const mvpLocation = gl.getUniformLocation(program, "uMvp");
        const modelLocation = gl.getUniformLocation(program, "uModel");

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        const draw = () => {
          const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
          const width = Math.max(1, Math.round(canvas!.clientWidth * pixelRatio));
          const height = Math.max(1, Math.round(canvas!.clientHeight * pixelRatio));
          if (canvas!.width !== width || canvas!.height !== height) {
            canvas!.width = width;
            canvas!.height = height;
          }
          gl.viewport(0, 0, width, height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          const rotation = multiply(rotationY(rotationRef.current.y), rotationX(rotationRef.current.x));
          const camera = translation(-4.5 / zoomRef.current);
          const viewModel = multiply(camera, rotation);
          const mvp = multiply(perspective(width / height), viewModel);
          gl.uniformMatrix4fv(mvpLocation, false, mvp);
          gl.uniformMatrix4fv(modelLocation, false, rotation);
          gl.drawArrays(gl.TRIANGLES, 0, mesh.positions.length / 3);
        };

        renderRef.current = draw;
        resizeObserver = new ResizeObserver(draw);
        resizeObserver.observe(canvas!);
        draw();
        cleanupGl = () => {
          resizeObserver?.disconnect();
          gl.deleteBuffer(positionBuffer);
          gl.deleteBuffer(normalBuffer);
          gl.deleteProgram(program);
          gl.deleteShader(vertexShader);
          gl.deleteShader(fragmentShader);
        };
        setStatus("ready");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }

    initialize();
    return () => {
      controller.abort();
      cleanupGl();
      renderRef.current = () => undefined;
    };
  }, [src]);

  const resetView = () => {
    rotationRef.current = { x: -0.72, y: 0.58 };
    zoomRef.current = 1;
    renderRef.current();
  };

  return (
    <div className="stl-viewer">
      <div className="stl-canvas-wrap">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={alt}
          aria-describedby={instructionsId}
          tabIndex={0}
          onPointerDown={(event) => {
            dragRef.current = { active: true, x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.focus();
          }}
          onPointerMove={(event) => {
            if (!dragRef.current.active) return;
            const deltaX = event.clientX - dragRef.current.x;
            const deltaY = event.clientY - dragRef.current.y;
            dragRef.current = { active: true, x: event.clientX, y: event.clientY };
            rotationRef.current.y += deltaX * 0.008;
            rotationRef.current.x += deltaY * 0.008;
            renderRef.current();
          }}
          onPointerUp={(event) => {
            dragRef.current.active = false;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { dragRef.current.active = false; }}
          onWheel={(event) => {
            event.preventDefault();
            zoomRef.current = Math.min(2.4, Math.max(0.62, zoomRef.current * Math.exp(-event.deltaY * 0.001)));
            renderRef.current();
          }}
          onKeyDown={(event) => {
            const step = 0.12;
            if (event.key === "ArrowLeft") rotationRef.current.y -= step;
            else if (event.key === "ArrowRight") rotationRef.current.y += step;
            else if (event.key === "ArrowUp") rotationRef.current.x -= step;
            else if (event.key === "ArrowDown") rotationRef.current.x += step;
            else if (event.key === "+" || event.key === "=") zoomRef.current = Math.min(2.4, zoomRef.current * 1.12);
            else if (event.key === "-" || event.key === "_") zoomRef.current = Math.max(0.62, zoomRef.current / 1.12);
            else return;
            event.preventDefault();
            renderRef.current();
          }}
        />
        {status !== "ready" && (
          <div className="stl-status" aria-live="polite">
            {status === "loading" ? "Loading 3D model…" : "3D preview unavailable. The STL can still be downloaded below."}
          </div>
        )}
        <div className="stl-axis" aria-hidden="true"><span>X</span><span>Y</span><span>Z</span></div>
      </div>
      <div className="stl-controls">
        <p id={instructionsId}>Drag to rotate · Scroll to zoom · Arrow keys also rotate</p>
        <button type="button" onClick={resetView} disabled={status !== "ready"}>
          <RotateCcw size={14} /> Reset view
        </button>
      </div>
    </div>
  );
}
