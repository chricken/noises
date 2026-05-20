'use strict';

// Voronoi/Worley-Noise
// Einsatzzweck: Zellstrukturen, Risse, metallische Oberflächen
const voronoi = {
    points: [],
    gridSize: 8,
    seed: 0,

    init(gridSize = 8, seed = Math.random() * 10000) {
        this.gridSize = gridSize;
        this.seed = seed;
        this.points = [];

        // Generiere Zufallspunkte in einem Gitter
        // Verwende ein erweitertes Gitter für nahtlose Übergänge an den Rändern
        for (let gy = -1; gy <= gridSize; gy++) {
            for (let gx = -1; gx <= gridSize; gx++) {
                // Zufälliger Punkt innerhalb der Gitterzelle
                const px = gx + this.random(gx, gy);
                const py = gy + this.random(gx + 1, gy + 1);
                this.points.push([px, py]);
            }
        }
    },

    draw({c, scale = 10.0, distanceMode = 'F1'}={}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Voronoi-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Voronoi-Wert
                const noiseValue = this.noise(nx, ny, scale, distanceMode);

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

    // Berechnet Voronoi/Worley-Noise
    noise(x, y, scale = 10.0, distanceMode = 'F1') {
        // Skalierung der Koordinaten
        const scaledX = x * scale;
        const scaledY = y * scale;

        // Finde die nächsten Punkte
        const distances = [];

        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const dx = (point[0] / this.gridSize) * scale - scaledX;
            const dy = (point[1] / this.gridSize) * scale - scaledY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            distances.push(distance);
        }

        // Sortiere die Distanzen
        distances.sort((a, b) => a - b);

        // Berechne den Wert basierend auf dem Distanzmodus
        let value = 0;

        if (distanceMode === 'F1') {
            // Nächster Punkt
            value = distances[0];
        } else if (distanceMode === 'F2') {
            // Zweitnächster Punkt
            value = distances[1];
        } else if (distanceMode === 'F2-F1') {
            // Differenz zwischen F2 und F1 (erzeugt Zellgrenzen)
            value = distances[1] - distances[0];
        } else if (distanceMode === 'F1+F2') {
            // Summe von F1 und F2
            value = (distances[0] + distances[1]) * 0.5;
        }

        // Normalisiere auf [0, 1]
        return Math.min(value / (scale * 0.5), 1.0);
    },

    // Pseudo-Zufallsgenerator für konsistente Punktgenerierung
    random(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }
};

export default voronoi;
