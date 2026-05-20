'use strict';

// Gradientenvektoren für Perlin-Noise
const gradients = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1]
];

const perlin = {
    permutation: [],
    init() {
        // Initialisiere die Permutations-Tabelle für Perlin-Noise
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
    },
    draw({c, scale = 10.0} = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Perlin-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Perlin-Noise-Wert mit dem übergebenen Scale
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

    // Hilfsfunktion zur Berechnung des Perlin-Noise
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

        // Berechne die Gradienten für die vier Eckpunkte
        const n0 = this.dotGridGradient(x0, y0, sx, sy);
        const n1 = this.dotGridGradient(x1, y0, sx - 1, sy);
        const ix0 = this.interpolate(n0, n1, sx);

        const n2 = this.dotGridGradient(x0, y1, sx, sy - 1);
        const n3 = this.dotGridGradient(x1, y1, sx - 1, sy - 1);
        const ix1 = this.interpolate(n2, n3, sx);

        // Interpoliere zwischen den beiden interpolierten Werten
        return this.interpolate(ix0, ix1, sy);
    },

    // Hilfsfunktion zur Berechnung des Skalarprodukts zwischen Gradient und Abstandsvektor
    dotGridGradient(x, y, px, py) {
        // Berechne den Gradienten für die Gitterzelle (x, y)
        const gradientIndex = this.permutation[x + this.permutation[y]] % 8;
        const gradientX = gradients[gradientIndex][0];
        const gradientY = gradients[gradientIndex][1];

        // Berechne das Skalarprodukt
        return px * gradientX + py * gradientY;
    },

    // Hilfsfunktion zur smoothen Interpolation mit Fade-Funktion
    interpolate(a, b, t) {
        // Fade-Funktion: 6t^5 - 15t^4 + 10t^3
        const fade = t * t * t * (t * (t * 6 - 15) + 10);
        return a + fade * (b - a);
    }
}

export default perlin;