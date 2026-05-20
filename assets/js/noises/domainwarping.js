'use strict';

import perlin from './perlin.js';

// Domain Warping
// Einsatzzweck: Natürliche Verzerrungen, organische Strukturen
const domainwarping = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },

    draw({c, scale = 10.0, warpStrength = 2.0, octaves = 3} = {}) {
        scale *= .3;
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Domain Warping Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Domain Warping Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, warpStrength, octaves);

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

    // Hilfsfunktion zur Berechnung des Domain Warping Noise
    noise(x, y, scale = 10.0, warpStrength = 2.0, octaves = 3) {
        // Mehrere Stufen von Domain Warping für organischere Ergebnisse
        let warpedX = x;
        let warpedY = y;

        // Erste Warping-Stufe
        const offsetX1 = perlin.noise(x, y, scale * 0.5) * warpStrength;
        const offsetY1 = perlin.noise(x + 5.2, y + 1.3, scale * 0.5) * warpStrength;

        warpedX += offsetX1;
        warpedY += offsetY1;

        // Zweite Warping-Stufe für mehr Komplexität
        if (octaves >= 2) {
            const offsetX2 = perlin.noise(warpedX, warpedY, scale * 1.0) * warpStrength * 0.5;
            const offsetY2 = perlin.noise(warpedX + 7.8, warpedY + 2.7, scale * 1.0) * warpStrength * 0.5;

            warpedX += offsetX2;
            warpedY += offsetY2;
        }

        // Dritte Warping-Stufe für feinste Details
        if (octaves >= 3) {
            const offsetX3 = perlin.noise(warpedX, warpedY, scale * 2.0) * warpStrength * 0.25;
            const offsetY3 = perlin.noise(warpedX + 3.4, warpedY + 9.1, scale * 2.0) * warpStrength * 0.25;

            warpedX += offsetX3;
            warpedY += offsetY3;
        }

        // Finales Rauschen mit den verzerrten Koordinaten
        const finalNoise = perlin.noise(warpedX, warpedY, scale);

        // Normalisiere auf [0, 1]
        return (finalNoise + 1) * 0.5;
    }
};

export default domainwarping;
