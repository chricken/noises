'use strict';

// Sparse Convolution Noise
// Einsatzzweck: Hochwertige prozedurale Texturen, Echtzeit-Anwendungen
const sparseconvolution = {
    kernelPoints: [],

    init(numKernels = 32, seed = Math.random() * 10000) {
        this.seed = seed;
        this.kernelPoints = [];

        // Generiere sparse (spärliche) Kernel-Punkte
        for (let i = 0; i < numKernels; i++) {
            const point = {
                x: this.random(i * 4),
                y: this.random(i * 4 + 1),
                weight: this.random(i * 4 + 2) * 2 - 1, // Gewicht zwischen -1 und 1
                radius: 0.1 + this.random(i * 4 + 3) * 0.15 // Radius zwischen 0.1 und 0.25
            };
            this.kernelPoints.push(point);
        }
    },

    draw({c, scale = 10.0, numKernels = 32, sharpness = 2.0}={}) {
        // Initialisiere mit Parametern
        this.init(numKernels, Math.random() * 10000);

        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Sparse Convolution Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Sparse Convolution Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, sharpness);

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

    // Hilfsfunktion zur Berechnung des Sparse Convolution Noise
    noise(x, y, scale = 10.0, sharpness = 2.0) {
        let value = 0.0;
        let totalWeight = 0.0;

        // Berechne Beiträge nur von nahen Kernel-Punkten (sparse = spärlich)
        for (let i = 0; i < this.kernelPoints.length; i++) {
            const point = this.kernelPoints[i];

            // Berechne Distanz zum Kernel-Punkt (mit Wrapping für nahtlose Textur)
            let dx = x - point.x;
            let dy = y - point.y;

            // Wrapping
            if (Math.abs(dx) > 0.5) dx = dx > 0 ? dx - 1 : dx + 1;
            if (Math.abs(dy) > 0.5) dy = dy > 0 ? dy - 1 : dy + 1;

            // Skaliere
            dx *= scale;
            dy *= scale;

            // Berechne Distanz
            const dist = Math.sqrt(dx * dx + dy * dy);
            const scaledRadius = point.radius * scale;

            // Nur Punkte innerhalb des Radius berücksichtigen (sparse)
            if (dist < scaledRadius) {
                // Kernel-Funktion mit variabler Schärfe
                // Je höher sharpness, desto schärfer die Kanten
                const t = dist / scaledRadius;

                // Smooth kernel mit einstellbarer Schärfe
                const kernelValue = Math.pow(1 - t * t, sharpness);

                // Akkumuliere gewichteten Beitrag
                value += kernelValue * point.weight;
                totalWeight += Math.abs(kernelValue);
            }
        }

        // Normalisiere
        if (totalWeight > 0.001) {
            value = value / totalWeight;
        }

        // Mehrere Oktaven für mehr Details (hochfrequente Details)
        const detail1 = this.detailLayer(x * 2, y * 2, scale * 2) * 0.3;
        const detail2 = this.detailLayer(x * 4, y * 4, scale * 4) * 0.15;

        value = value * 0.7 + detail1 + detail2;

        // Skaliere auf [0, 1]
        return Math.max(0, Math.min(1, (value + 1) * 0.5));
    },

    // Detail-Layer für hochfrequente Details
    detailLayer(x, y, scale) {
        let value = 0.0;

        // Weniger Kernel für Detail-Layer (effizienter)
        for (let i = 0; i < Math.min(16, this.kernelPoints.length); i++) {
            const point = this.kernelPoints[i];

            let dx = x - point.x;
            let dy = y - point.y;

            if (Math.abs(dx) > 0.5) dx = dx > 0 ? dx - 1 : dx + 1;
            if (Math.abs(dy) > 0.5) dy = dy > 0 ? dy - 1 : dy + 1;

            dx *= scale * 0.5;
            dy *= scale * 0.5;

            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = point.radius * scale * 0.5;

            if (dist < radius) {
                const t = dist / radius;
                const kernelValue = (1 - t * t);
                value += kernelValue * point.weight;
            }
        }

        return value;
    },

    // Pseudo-Zufallsgenerator
    random(n) {
        const x = Math.sin(n * 127.1 + this.seed) * 43758.5453;
        return x - Math.floor(x);
    }
};

export default sparseconvolution;
