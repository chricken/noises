'use strict';

import perlin from './perlin.js';

// Gabor-Rauschen (Gabor Noise)
// Einsatzzweck: Metallische Oberflächen, Fingerabdrücke, Holzmaserung
const gabor = {
    init() {
        // Initialisiere Perlin für Orientierungsfeld
        perlin.init();
    },

    draw({c, scale = 10.0, frequency =12.0, orientation = 0.8} = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Gabor-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Gabor-Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, frequency, orientation);

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

    // Hilfsfunktion zur Berechnung des Gabor-Noise
    noise(x, y, scale = 10.0, frequency = 8.0, orientation = 0.3) {
        // Verwende Perlin-Noise um Orientierungsfeld zu erzeugen
        const orientationNoise = perlin.noise(x, y, scale * orientation);
        const angle = orientationNoise * Math.PI;

        // Skaliere Koordinaten
        const sx = x * scale;
        const sy = y * scale;

        // Rotiere Koordinaten entsprechend der lokalen Orientierung
        const cos_a = Math.cos(angle);
        const sin_a = Math.sin(angle);
        const rx = sx * cos_a + sy * sin_a;
        const ry = -sx * sin_a + sy * cos_a;

        // Gabor-Funktion: Sinuswelle mit Gaußscher Hüllkurve
        const wave = Math.sin(2 * Math.PI * frequency * rx / scale);

        // Gaußsche Hüllkurve (steuert die Breite der Linien)
        const bandwidth = 0.3;
        const envelope = Math.exp(-Math.PI * bandwidth * bandwidth * ry * ry / (scale * scale));

        // Gabor-Wert
        const gaborValue = wave * envelope;

        // Füge mehrere Oktaven für Variation hinzu
        let value = gaborValue;

        // Zweite Oktave mit anderer Frequenz
        const rx2 = sx * Math.cos(angle + 0.5) + sy * Math.sin(angle + 0.5);
        const ry2 = -sx * Math.sin(angle + 0.5) + sy * Math.cos(angle + 0.5);
        const wave2 = Math.sin(2 * Math.PI * frequency * 0.5 * rx2 / scale);
        const envelope2 = Math.exp(-Math.PI * bandwidth * bandwidth * ry2 * ry2 / (scale * scale));
        value += wave2 * envelope2 * 0.5;

        // Normalisiere auf [0, 1]
        return (value + 1) * 0.5;
    }
};

export default gabor;
