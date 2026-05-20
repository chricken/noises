'use strict';

// Gradient-Rauschen (Gradient Noise)
// Einsatzzweck: Fluid-Simulationen, weiche Übergänge
const gradient = {
    permutation: [],
    gradients: [],

    init() {
        // Initialisiere die Permutations-Tabelle
        this.permutation = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }

        // Mische die Permutations-Tabelle
        for (let i = 0; i < 256; i++) {
            const j = Math.floor(Math.random() * 256);
            const temp = this.permutation[i];
            this.permutation[i] = this.permutation[j];
            this.permutation[j] = temp;
        }

        // Verdopple die Permutations-Tabelle, um Überläufe zu vermeiden
        this.permutation = this.permutation.concat(this.permutation);

        // Generiere zufällige Gradienten für jeden Gitterpunkt
        this.gradients = new Array(512);
        for (let i = 0; i < 512; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.gradients[i] = [Math.cos(angle), Math.sin(angle)];
        }
    },

    draw({c, scale = 10.0} = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Gradient-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Gradient-Noise-Wert mit dem übergebenen Scale
                const noiseValue = this.noise(nx, ny, scale);

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

    // Hilfsfunktion zur Berechnung des Gradient-Noise
    noise(x, y, scale = 10.0) {
        // Skalierung der Koordinaten
        const scaledX = x * scale;
        const scaledY = y * scale;

        // Berechne die Gitterkoordinaten
        const x0 = Math.floor(scaledX) & 255;
        const y0 = Math.floor(scaledY) & 255;
        const x1 = (x0 + 1) & 255;
        const y1 = (y0 + 1) & 255;

        // Berechne die relativen Koordinaten innerhalb des Gitters
        const sx = scaledX - Math.floor(scaledX);
        const sy = scaledY - Math.floor(scaledY);

        // Berechne die Gradienten für die vier Eckpunkte mit linearer Interpolation
        const n0 = this.dotGridGradient(x0, y0, sx, sy);
        const n1 = this.dotGridGradient(x1, y0, sx - 1, sy);
        const ix0 = this.linearInterpolate(n0, n1, sx);

        const n2 = this.dotGridGradient(x0, y1, sx, sy - 1);
        const n3 = this.dotGridGradient(x1, y1, sx - 1, sy - 1);
        const ix1 = this.linearInterpolate(n2, n3, sx);

        // Interpoliere zwischen den beiden interpolierten Werten (linear für weiche Übergänge)
        return this.linearInterpolate(ix0, ix1, sy);
    },

    // Hilfsfunktion zur Berechnung des Skalarprodukts zwischen Gradient und Abstandsvektor
    dotGridGradient(x, y, px, py) {
        // Hole den Gradienten für die Gitterzelle (x, y)
        const gradientIndex = this.permutation[x + this.permutation[y]];
        const gradient = this.gradients[gradientIndex];

        // Berechne das Skalarprodukt
        return px * gradient[0] + py * gradient[1];
    },

    // Hilfsfunktion zur smoothen Interpolation (cubic für weiche, fließende Übergänge)
    linearInterpolate(a, b, t) {
        // Cubic interpolation (Smoothstep) für weichere Übergänge
        const fade = t * t * (3 - 2 * t);
        return a + fade * (b - a);
    }
};

export default gradient;
