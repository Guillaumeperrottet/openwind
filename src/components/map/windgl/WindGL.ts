import {
  QUAD_VERT,
  SCREEN_FRAG,
  DRAW_VERT,
  DRAW_FRAG,
  UPDATE_FRAG,
} from "./shaders";
import {
  createProgram,
  createTexture,
  bindTexture,
  bindFramebuffer,
  createBuffer,
  bindAttribute,
} from "./util";

// ── Types ────────────────────────────────────────────────────────────────────

export interface WindData {
  width: number; // nLngs
  height: number; // nLats
  image: Uint8Array; // RGBA, width × height
  uMin: number;
  uMax: number;
  vMin: number;
  vMax: number;
}

type Bounds4 = [number, number, number, number];

// ── WindGL ───────────────────────────────────────────────────────────────────

export class WindGL {
  gl: WebGL2RenderingContext;

  fadeOpacity = 0.97;
  speedFactor = 0.15;
  dropRate = 0.003;
  dropRateBump = 0.01;
  pointSize = 2.0;

  private _drawProgram: WebGLProgram;
  private _screenProgram: WebGLProgram;
  private _updateProgram: WebGLProgram;

  private _quadBuffer: WebGLBuffer;
  private _framebuffer: WebGLFramebuffer;
  private _colorRampTexture: WebGLTexture;

  private _backgroundTexture!: WebGLTexture;
  private _screenTexture!: WebGLTexture;

  private _particleStateTexture0!: WebGLTexture;
  private _particleStateTexture1!: WebGLTexture;
  private _particleIndexBuffer!: WebGLBuffer;
  private _particleStateResolution = 0;
  private _numParticles = 0;

  private _windTexture: WebGLTexture | null = null;
  private _windData: WindData | null = null;
  private _windBounds: Bounds4 = [0, 0, 0, 0]; // lng0, lat0, lng1, lat1

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this._drawProgram = createProgram(gl, DRAW_VERT, DRAW_FRAG);
    this._screenProgram = createProgram(gl, QUAD_VERT, SCREEN_FRAG);
    this._updateProgram = createProgram(gl, QUAD_VERT, UPDATE_FRAG);

    // Full-screen quad: two triangles covering [0,1]²
    this._quadBuffer = createBuffer(
      gl,
      new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
    );
    this._framebuffer = gl.createFramebuffer()!;
    this._colorRampTexture = this._createColorRamp();

    this.resize();
    this.numParticles = 16384;
  }

  // ── Public API ───────────────────────────────────────────────────────────

  resize() {
    const gl = this.gl;
    const w = gl.canvas.width;
    const h = gl.canvas.height;
    const empty = new Uint8Array(w * h * 4);
    this._backgroundTexture = createTexture(gl, gl.NEAREST, empty, w, h);
    this._screenTexture = createTexture(gl, gl.NEAREST, empty, w, h);
  }

  set numParticles(n: number) {
    const gl = this.gl;
    const res = Math.ceil(Math.sqrt(n));
    this._particleStateResolution = res;
    this._numParticles = res * res;

    const state = new Uint8Array(this._numParticles * 4);
    for (let i = 0; i < state.length; i++) {
      state[i] = Math.floor(Math.random() * 256);
    }
    this._particleStateTexture0 = createTexture(
      gl,
      gl.NEAREST,
      state,
      res,
      res,
    );
    this._particleStateTexture1 = createTexture(
      gl,
      gl.NEAREST,
      state,
      res,
      res,
    );

    const indices = new Float32Array(this._numParticles);
    for (let i = 0; i < this._numParticles; i++) indices[i] = i;
    this._particleIndexBuffer = createBuffer(gl, indices);
  }

  get numParticles() {
    return this._numParticles;
  }

  setWind(data: WindData, bounds: Bounds4) {
    const gl = this.gl;
    if (this._windTexture) gl.deleteTexture(this._windTexture);
    this._windTexture = createTexture(
      gl,
      gl.LINEAR,
      data.image,
      data.width,
      data.height,
    );
    this._windData = data;
    this._windBounds = bounds;
  }

  draw(screenBounds: Bounds4, canvasSize: [number, number]) {
    if (!this._windData || !this._windTexture) return;
    const gl = this.gl;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);

    // Step 1: Render trails + new particles into screen FBO
    bindFramebuffer(gl, this._framebuffer, this._screenTexture);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this._drawScreen(this._backgroundTexture, this.fadeOpacity);
    this._drawParticles(screenBounds, canvasSize);

    // Step 2: Blit screen texture to canvas (with alpha blending)
    bindFramebuffer(gl, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this._drawScreen(this._screenTexture, 1.0);
    gl.disable(gl.BLEND);

    // Step 3: Swap screen ↔ background
    const temp = this._backgroundTexture;
    this._backgroundTexture = this._screenTexture;
    this._screenTexture = temp;

    // Step 4: Update particle positions
    this._updateParticles();
  }

  destroy() {
    const gl = this.gl;
    gl.deleteProgram(this._drawProgram);
    gl.deleteProgram(this._screenProgram);
    gl.deleteProgram(this._updateProgram);
    gl.deleteBuffer(this._quadBuffer);
    gl.deleteBuffer(this._particleIndexBuffer);
    gl.deleteFramebuffer(this._framebuffer);
    gl.deleteTexture(this._colorRampTexture);
    gl.deleteTexture(this._backgroundTexture);
    gl.deleteTexture(this._screenTexture);
    gl.deleteTexture(this._particleStateTexture0);
    gl.deleteTexture(this._particleStateTexture1);
    if (this._windTexture) gl.deleteTexture(this._windTexture);
  }

  // ── Internal draw steps ──────────────────────────────────────────────────

  private _drawScreen(texture: WebGLTexture, opacity: number) {
    const gl = this.gl;
    const p = this._screenProgram;
    gl.useProgram(p);

    bindAttribute(gl, this._quadBuffer, gl.getAttribLocation(p, "a_pos"), 2);
    bindTexture(gl, texture, 0);
    gl.uniform1i(gl.getUniformLocation(p, "u_screen"), 0);
    gl.uniform1f(gl.getUniformLocation(p, "u_opacity"), opacity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private _drawParticles(screenBounds: Bounds4, canvasSize: [number, number]) {
    const gl = this.gl;
    const p = this._drawProgram;
    gl.useProgram(p);

    bindAttribute(
      gl,
      this._particleIndexBuffer,
      gl.getAttribLocation(p, "a_index"),
      1,
    );

    bindTexture(gl, this._particleStateTexture0, 0);
    gl.uniform1i(gl.getUniformLocation(p, "u_particles"), 0);
    gl.uniform1f(
      gl.getUniformLocation(p, "u_particles_res"),
      this._particleStateResolution,
    );

    bindTexture(gl, this._windTexture!, 1);
    gl.uniform1i(gl.getUniformLocation(p, "u_wind"), 1);
    gl.uniform2f(
      gl.getUniformLocation(p, "u_wind_min"),
      this._windData!.uMin,
      this._windData!.vMin,
    );
    gl.uniform2f(
      gl.getUniformLocation(p, "u_wind_max"),
      this._windData!.uMax,
      this._windData!.vMax,
    );

    bindTexture(gl, this._colorRampTexture, 2);
    gl.uniform1i(gl.getUniformLocation(p, "u_color_ramp"), 2);

    gl.uniform4f(
      gl.getUniformLocation(p, "u_screen_bounds"),
      screenBounds[0],
      screenBounds[1],
      screenBounds[2],
      screenBounds[3],
    );
    gl.uniform2f(
      gl.getUniformLocation(p, "u_canvas_size"),
      canvasSize[0],
      canvasSize[1],
    );
    gl.uniform1f(
      gl.getUniformLocation(p, "u_point_size"),
      this.pointSize * (window.devicePixelRatio || 1),
    );

    gl.drawArrays(gl.POINTS, 0, this._numParticles);
  }

  private _updateParticles() {
    const gl = this.gl;
    const p = this._updateProgram;

    bindFramebuffer(gl, this._framebuffer, this._particleStateTexture1);
    gl.viewport(
      0,
      0,
      this._particleStateResolution,
      this._particleStateResolution,
    );

    gl.useProgram(p);

    bindAttribute(gl, this._quadBuffer, gl.getAttribLocation(p, "a_pos"), 2);

    bindTexture(gl, this._particleStateTexture0, 0);
    gl.uniform1i(gl.getUniformLocation(p, "u_particles"), 0);

    bindTexture(gl, this._windTexture!, 1);
    gl.uniform1i(gl.getUniformLocation(p, "u_wind"), 1);
    gl.uniform2f(
      gl.getUniformLocation(p, "u_wind_min"),
      this._windData!.uMin,
      this._windData!.vMin,
    );
    gl.uniform2f(
      gl.getUniformLocation(p, "u_wind_max"),
      this._windData!.uMax,
      this._windData!.vMax,
    );

    gl.uniform1f(gl.getUniformLocation(p, "u_speed_factor"), this.speedFactor);
    gl.uniform1f(gl.getUniformLocation(p, "u_drop_rate"), this.dropRate);
    gl.uniform1f(
      gl.getUniformLocation(p, "u_drop_rate_bump"),
      this.dropRateBump,
    );
    gl.uniform1f(gl.getUniformLocation(p, "u_rand_seed"), Math.random());
    gl.uniform4f(
      gl.getUniformLocation(p, "u_wind_bounds"),
      this._windBounds[0],
      this._windBounds[1],
      this._windBounds[2],
      this._windBounds[3],
    );

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Swap particle state textures
    const temp = this._particleStateTexture0;
    this._particleStateTexture0 = this._particleStateTexture1;
    this._particleStateTexture1 = temp;
  }

  // ── Colour ramp ──────────────────────────────────────────────────────────

  private _createColorRamp(): WebGLTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 256, 0);

    // Windguru-style palette (absolute km/h mapped to 0–80 range)
    g.addColorStop(0, "#d0d0d0"); //  0 km/h – calme
    g.addColorStop(0.05, "#d5f0d5"); //  4 km/h – très léger
    g.addColorStop(0.115, "#8edb8e"); //  9 km/h – léger
    g.addColorStop(0.19, "#3dbc3d"); // 15 km/h – modéré
    g.addColorStop(0.28, "#e8e540"); // 22 km/h – kitable
    g.addColorStop(0.375, "#e8b830"); // 30 km/h – bon
    g.addColorStop(0.465, "#e07020"); // 37 km/h – fort
    g.addColorStop(0.575, "#d42020"); // 46 km/h – très fort
    g.addColorStop(0.7, "#b00058"); // 56 km/h – extrême
    g.addColorStop(0.82, "#800080"); // 65 km/h – danger
    g.addColorStop(1.0, "#800080"); // 80+ km/h

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 1);

    const data = new Uint8Array(ctx.getImageData(0, 0, 256, 1).data);
    return createTexture(this.gl, this.gl.LINEAR, data, 256, 1);
  }
}
