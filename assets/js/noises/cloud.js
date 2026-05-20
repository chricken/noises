'use strict';

import perlin from './perlin.js';

// Cloud-Rauschen (Cloud Noise)
// Einsatzzweck: Nebel, Wolken, atmosphärische Effekte
const cloud = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },

    draw({
             c,
             scale = 10.0,
             octaves = 6,
             turbulence = 3.5,
             coverage = 0.3
         } = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Cloud-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Cloud-Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, octaves, turbulence, coverage);

                // Konvertiere den Noise-Wert in einen Graustufenwert
                const grayValue = Math.floor(noiseValue * 255);

                // Setze die Pixel-Farbe
                const index = (y * width + x) * 4;
                data[index] = grayValue;
                data[index + 1] = grayValue;
                data[index + 2] = grayValue;
                data[index + 3] = 255; // Alpha-Kanal
            }
        }

        // Zeichne das ImageData-Objekt auf das Canvas
        ctx.putImageData(imageData, 0, 0);
    },

    // Hilfsfunktion zur Berechnung des Cloud-Noise
    noise(x, y, scale = 10.0, octaves = 6, turbulence = 1.5, coverage = 0.5) {
        let value = 0.0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let maxValue = 0.0;

        // Erste Turbulenz-Layer (fBm)
        for (let i = 0; i < octaves; i++) {
            // Perlin-Noise mit verschiedenen Frequenzen
            const noiseVal = perlin.noise(x, y, scale * frequency);

            // Turbulenz: nimm Absolutwert für mehr Variation
            const turbulent = Math.abs(noiseVal);

            value += turbulent * amplitude * turbulence;
            maxValue += amplitude * turbulence;

            amplitude *= 0.5; // Persistence
            frequency *= 2.0; // Lacunarity
        }

        // Normalisiere
        value = value / maxValue;

        // Zweiter Layer für zusätzliche Weichheit
        const softLayer = (perlin.noise(x * 0.5, y * 0.5, scale * 0.3) + 1) * 0.5;
        value = value * 0.7 + softLayer * 0.3;

        // Coverage-Anpassung: Dunkle Bereiche werden zum Himmel (hell)
        // Helle Bereiche werden zu Wolken (bleiben)
        value = Math.pow(value, 1.0 - coverage);

        // Soft threshold für weiche Wolkenkanten
        value = this.smoothStep(0.3, 0.7, value);

        return value;
    },

    // Smooth step function für weiche Übergänge
    smoothStep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }
};

export default cloud;
