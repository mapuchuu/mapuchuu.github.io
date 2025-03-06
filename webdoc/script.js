"use strict";
/*
  Inspired by Sophia (fractal kitty)'s pen Spark Studio Coding night:
  https://codepen.io/fractalkitty/pen/ZYEWNmL
*/

const LWIDTH = 1; // better if integer
const FRQ = 5

let canv, ctx; // canvas and context
let maxx, maxy; // canvas dimensions

// shortcuts for Math.
const mrandom = Math.random;
const mfloor = Math.floor;
const mceil = Math.ceil;
const msqrt = Math.sqrt;

function alea(mini, maxi) {
  if (typeof maxi == "undefined") return mini * mrandom();
  return mini + mrandom() * (maxi - mini);
}

function intAlea(mini, maxi) {
  if (typeof maxi == "undefined") return mfloor(mini * mrandom());
  return mini + mfloor(mrandom() * (maxi - mini));
}

function Noise1DOneShot(period, min = 0, max = 1, random) {
  random = random || Math.random;
  let currx = random();
  let y0 = min + (max - min) * random();
  let y1 = min + (max - min) * random();
  let dx = 1 / period;
  const dx0 = 0.667 * dx;
  const dx1 = 1.333 * dx;
  dx = dx0 + (dx1 - dx0) * random();
  return function () {
    currx += dx;
    if (currx > 1) {
      currx -= 1;
      y0 = y1;
      y1 = min + (max - min) * random();
      dx = dx0 + (dx1 - dx0) * random();
    }
    let z = (3 - 2 * currx) * currx * currx;
    return z * y1 + (1 - z) * y0;
  };
}

function Noise1DOneShotHarm(period, min = 0, max = 1, ampl, random) {
  random = random || Math.random;
  let ampx = 1 / (1 + ampl);
  let rnd1 = Noise1DOneShot(period, ampx * min, ampx * max, random);
  ampx = ampl / (1 + ampl);
  let rnd2 = Noise1DOneShot(period / 2, ampx * min, ampx * max, random);
  return function () {
    return rnd1() + rnd2();
  };
}

function startOver() {
  maxx = window.innerWidth;
  maxy = window.innerHeight;

  canv.width = maxx;
  canv.height = maxy;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  let rndColor =
    mrandom() < 2
      ? () => {
          return `hsl(${intAlea(360)} ${intAlea(60, 100)}% ${intAlea(30, 70)}%)`;
        }
      : () => {
          return `hsl(0 0% ${intAlea(0, 100)}%)`;
        };

  let width = maxx / alea(12, 25);
  let nbcol = mceil(maxx / width) + 6;
  let offsx = (maxx - nbcol * width) / 2;

  const groups = new Array(3).fill(3).map((v, kg) => ({ kg, sections: [] }));
  let frqy = maxy / FRQ / LWIDTH / 3;

  for (let col = 0; col < nbcol; ++col) {
    const grp = col % 3;
    const x0 = offsx + col * width;
    const x1 = offsx + (col + 3) * width;
    groups[grp].sections.push({
      f0: Noise1DOneShotHarm(frqy, x0, x1, 0.25),
      color: rndColor()
    });
  }

  ctx.lineWidth = LWIDTH;
  for (let ky = 0; LWIDTH * ky < maxy; ++ky) {
    const y = ky * LWIDTH;
    const grp = ky % 3;
    let xpre = -10;
    groups[grp].sections.forEach((sect) => {
      ctx.strokeStyle = sect.color;
      ctx.beginPath();
      ctx.moveTo(xpre, y);
      xpre = sect.f0();
      ctx.lineTo(xpre, y);
      ctx.stroke();
    });
  }
  return true;
}

// --- Initialization ---
// Create the canvas and set it as a background element
canv = document.createElement("canvas");
canv.style.position = "absolute";
canv.style.top = "0";
canv.style.left = "0";
canv.style.zIndex = "-1"; 
document.body.appendChild(canv);
ctx = canv.getContext("2d");

canv.addEventListener("click", startOver);
startOver();
