/**
 * Simplex Noise - Fast 2D/3D for organic animations.
 * Based on Stefan Gustavson's implementation.
 */

const perm = new Uint8Array(512);
const gradP: number[][] = new Array(512);

const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
];

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const F3 = 1 / 3;
const G3 = 1 / 6;

export function seed(value: number): void {
  const random = (() => {
    let s = value;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  })();
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    gradP[i] = grad3[perm[i] % 12];
  }
}

export function noise3D(x: number, y: number, z: number): number {
  const s = (x + y + z) * F3;
  const i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
  const t = (i + j + k) * G3;
  const x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);

  let i1: number, j1: number, k1: number, i2: number, j2: number, k2: number;
  if (x0 >= y0) {
    if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
    else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
    else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
  } else {
    if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
    else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
    else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
  }

  const x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
  const x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
  const x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;
  const ii=i&255, jj=j&255, kk=k&255;

  let n0=0,n1=0,n2=0,n3=0;
  let t0=0.6-x0*x0-y0*y0-z0*z0;
  if(t0>=0){const g=gradP[ii+perm[jj+perm[kk]]];t0*=t0;n0=t0*t0*(g[0]*x0+g[1]*y0+g[2]*z0);}
  let t1=0.6-x1*x1-y1*y1-z1*z1;
  if(t1>=0){const g=gradP[ii+i1+perm[jj+j1+perm[kk+k1]]];t1*=t1;n1=t1*t1*(g[0]*x1+g[1]*y1+g[2]*z1);}
  let t2=0.6-x2*x2-y2*y2-z2*z2;
  if(t2>=0){const g=gradP[ii+i2+perm[jj+j2+perm[kk+k2]]];t2*=t2;n2=t2*t2*(g[0]*x2+g[1]*y2+g[2]*z2);}
  let t3=0.6-x3*x3-y3*y3-z3*z3;
  if(t3>=0){const g=gradP[ii+1+perm[jj+1+perm[kk+1]]];t3*=t3;n3=t3*t3*(g[0]*x3+g[1]*y3+g[2]*z3);}

  return 32*(n0+n1+n2+n3);
}

export function animatedNoise(x: number, y: number, time: number): number {
  return noise3D(x, y, time);
}

seed(Date.now());
