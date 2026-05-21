'use strict';

import perlin from './perlin.js';

// Flow Noise (Fluss-Simulation)
// Einsatzzweck: Flusssysteme, Windströmungen, organische Pfade
const flow = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },

    draw({c, scale = 10.0, flowStrength = 2.0, steps = 10} = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Flow Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Flow Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, flowStrength, steps);

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

    // Hilfsfunktion zur Berechnung des Flow Noise
    noise(x, y, scale = 10.0, flowStrength = 2.0, steps = 20) {
        // Startposition
        let flowX = x;
        let flowY = y;

        let totalValue = 0.0;
        let totalWeight = 0.0;

        // Folge dem Fluss über mehrere Schritte
        for (let i = 0; i < steps; i++) {
            // Berechne Richtungsfeld aus Perlin-Noise (langsam variierend)
            const angle = perlin.noise(flowX, flowY, scale * 0.2) * Math.PI * 2;

            // Richtungsvektor
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);

            // Bewege die Position entlang des Flusses
            const stepSize = flowStrength / (scale * steps);
            flowX += dirX * stepSize;
            flowY += dirY * stepSize;

            // Wrapping für nahtlose Texturen
            if (flowX < 0) flowX += 1;
            if (flowX > 1) flowX -= 1;
            if (flowY < 0) flowY += 1;
            if (flowY > 1) flowY -= 1;

            // Sample Noise an der neuen Position (gröbere Skala für glattere Linien)
            const sample = perlin.noise(flowX, flowY, scale * 0.5);

            // Gewichte die späteren Samples weniger (sanftere Dämpfung)
            const weight = 1.0 - (i / steps) * 0.5;
            totalValue += sample * weight;
            totalWeight += weight;
        }

        // Normalisiere mit Gesamtgewicht
        let value = totalValue / totalWeight;

        // Verstärke den Kontrast für klare Linien
        value = (value + 1) * 0.5; // Auf [0,1]
        value = Math.pow(value, 0.7); // Verstärke helle Bereiche

        // Skaliere auf [0, 1]
        return Math.max(0, Math.min(1, value));
    }
};

export default flow;
