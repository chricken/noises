'use strict';

import perlin from './perlin.js';

// fBm (fractional Brownian motion) basierend auf Perlin-Noise
// Einsatzzweck: Natürliche Landschaften, Terrain, Wolken
const fbm = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },
    draw({c, scale = 10.0, octaves = 6, persistence = 0.5, lacunarity = 2.0} = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere fBm für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den fBm-Wert
                const noiseValue = this.noise(nx, ny, scale, octaves, persistence, lacunarity);

                // Konvertiere den Noise-Wert in einen Graustufenwert
                const grayValue = Math.floor((noiseValue + 1) * 127.5);

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

    // Berechnet fBm durch Summation mehrerer Perlin-Noise-Oktaven
    noise(x, y, scale = 10.0, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
        let total = 0.0;
        let amplitude = 1.0;
        let frequency = 1.0;
        let maxValue = 0.0;  // Für Normalisierung

        for (let i = 0; i < octaves; i++) {
            // Addiere die aktuelle Oktave mit skalierter Amplitude und Frequenz
            total += perlin.noise(x, y, scale * frequency) * amplitude;

            // Akkumuliere maxValue für die Normalisierung
            maxValue += amplitude;

            // Erhöhe Frequenz (mehr Details) und verringere Amplitude (weniger Einfluss)
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        // Normalisiere auf den Bereich [-1, 1]
        return total / maxValue;
    }
};

export default fbm;
