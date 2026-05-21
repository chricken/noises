'use strict';

import perlin from './perlin.js';
import simplex from './simplex.js';
import fbm from './fbm.js';
import voronoi from './voronoi.js';
import musgrave from './musgrave.js';
import gradient from './gradient.js';
import value from './value.js';
import spot from './spot.js';
import marble from './marble.js';
import cloud from './cloud.js';
import brick from './brick.js';
import gabor from './gabor.js';
import sparseconvolution from './sparseconvolution.js';
import domainwarping from './domainwarping.js';
import sine from './sine.js';
import wavelayer from './wavelayer.js';
import ridgedmultifractal from './ridgedmultifractal.js';
import flow from './flow.js';
import vascular from './vascular.js';

const noises = {
    perlin,
    simplex,
    fbm,
    voronoi,
    musgrave,
    gradient,
    value,
    spot,
    marble,
    cloud,
    brick,
    gabor,
    sparseconvolution,
    domainwarping,
    sine,
    wavelayer,
    ridgedmultifractal,
    flow,
    vascular,
    draw({
             type = 'perlin',
             canvas = document.createElement('canvas'),
             width = null,
             height = null,
             scale = 20.0,
             variant = null,
         }) {
        if (width) canvas.width = width;
        if (height) canvas.height = height;

        // Initialisiere das entsprechende Noise-Modul
        this[type].init();

        // Übergebe variant-Parameter wenn vorhanden (für Musgrave)

        this[type].draw({c: canvas, scale, variant});


        // Optimiere die Farben für besseren Kontrast
        this.optimizeColors(canvas);
    },

    // Optimiert die Farben eines Canvas für besseren Kontrast und Helligkeit
    optimizeColors(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Finde Min- und Max-Werte
        let min = 255, max = 0;
        for (let i = 0; i < data.length; i += 4) {
            const value = data[i]; // R-Kanal (bei Graustufen alle gleich)
            if (value < min) min = value;
            if (value > max) max = value;
        }

        // Vermeide Division durch Null
        const range = max - min;
        if (range === 0) return;

        // Normalisiere alle Pixel auf den vollen Bereich [0, 255]
        for (let i = 0; i < data.length; i += 4) {
            const normalized = ((data[i] - min) / range) * 255;
            data[i] = normalized;
            data[i + 1] = normalized;
            data[i + 2] = normalized;
        }

        ctx.putImageData(imageData, 0, 0);
    }

}

export default noises;