'use strict';

// Value-Rauschen (Value Noise)
// Einsatzzweck: Einfache zufällige Muster, Basis für komplexere Texturen
const value = {
    permutation: [],

    init() {
        // Initialisiere die Permutations-Tabelle mit zufälligen Werten
        this.permutation = new Array(256);
        for (let i = 0; i < 256; i++) {
            // Zufällige Werte zwischen 0 und 1
            this.permutation[i] = Math.random();
        }

        // Verdopple die Permutations-Tabelle, um Überläufe zu vermeiden
        this.permutation = this.permutation.concat(this.permutation);
    },

    draw({c, scale = 10.0} = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Value-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Value-Noise-Wert mit dem übergebenen Scale
                const noiseValue = this.noise(nx, ny, scale);

                // Konvertiere den Noise-Wert in einen Graustufenwert (bereits in [0,1])
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

    // Hilfsfunktion zur Berechnung des Value-Noise
    noise(x, y, scale = 10.0) {
        // Skalierung der Koordinaten
        const scaledX = x * scale;
        const scaledY = y * scale;

        // Berechne die Gitterkoordinaten
        const x0 = Math.floor(scaledX);
        const y0 = Math.floor(scaledY);
        const x1 = x0 + 1;
        const y1 = y0 + 1;

        // Berechne die relativen Koordinaten innerhalb des Gitters
        const sx = scaledX - x0;
        const sy = scaledY - y0;

        // Hole die Werte an den vier Eckpunkten
        const v00 = this.getValue(x0, y0);
        const v10 = this.getValue(x1, y0);
        const v01 = this.getValue(x0, y1);
        const v11 = this.getValue(x1, y1);

        // Lineare Interpolation (keine Glättung für "digitales" Aussehen)
        const ix0 = this.linearInterpolate(v00, v10, sx);
        const ix1 = this.linearInterpolate(v01, v11, sx);

        // Interpoliere zwischen den beiden interpolierten Werten
        return this.linearInterpolate(ix0, ix1, sy);
    },

    // Hilfsfunktion zum Abrufen eines Wertes an einem Gitterpunkt
    getValue(x, y) {
        // Berechne den Index in der Permutations-Tabelle
        // Verwende Bitwise AND für positive Werte
        const ix = Math.abs(x) & 255;
        const iy = Math.abs(y) & 255;

        // Einfache Hash-Funktion
        const index = (ix * 73 + iy * 179) & 255;
        return this.permutation[index];
    },

    // Hilfsfunktion zur linearen Interpolation (bewusst linear ohne Glättung)
    linearInterpolate(a, b, t) {
        return a + t * (b - a);
    }
};

export default value;
