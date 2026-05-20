'use strict';

import perlin from './perlin.js';

// Wave-Rauschen (Sine Wave Layer Noise)
// Einsatzzweck: Dünen, Stoffmuster, fließende Landschaften
const wavelayer = {
    init() {
        // Initialisiere Perlin für optionales Rauschen
        perlin.init();
    },

    draw({
             c,
             scale = 10.0,
             layers = 5,
             amplitude = 1.0,
             noiseAmount = 0.2
         } = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Wave Layer Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Wave Layer Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, layers, amplitude, noiseAmount);

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

    // Hilfsfunktion zur Berechnung des Wave Layer Noise
    noise(x, y, scale = 10.0, layers = 5, amplitude = 1.0, noiseAmount = 0.2) {
        let value = 0.0;
        let totalAmplitude = 0.0;

        // Skaliere die Koordinaten
        const sx = x * scale;
        const sy = y * scale;

        // Füge optionales Perlin-Rauschen für Variation hinzu
        let noiseOffset = 0;
        if (noiseAmount > 0) {
            noiseOffset = perlin.noise(x, y, scale * 0.5) * noiseAmount;
        }

        // Schichte mehrere Sinus-Wellen übereinander
        for (let i = 0; i < layers; i++) {
            // Frequenz und Amplitude nehmen mit jeder Schicht zu/ab
            const frequency = Math.pow(2, i); // Verdoppelt sich: 1, 2, 4, 8, ...
            const layerAmplitude = amplitude / (i + 1); // Nimmt ab: 1, 0.5, 0.33, 0.25, ...

            // Berechne Wellenrichtung (variiert pro Layer)
            const angle = (i * Math.PI) / layers; // Verschiedene Richtungen
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);

            // Projektiere Koordinaten auf Wellenrichtung
            const projection = sx * dirX + sy * dirY;

            // Sinus-Welle mit Noise-Offset für organischere Formen
            const wave = Math.sin((projection + noiseOffset * 10) * frequency);

            // Füge zweite orthogonale Welle für Dünen-Effekt hinzu
            const orthogonalProjection = -sx * dirY + sy * dirX;
            const crossWave = Math.sin((orthogonalProjection + noiseOffset * 5) * frequency * 0.5) * 0.3;

            // Kombiniere die Wellen
            const combined = wave + crossWave;

            // Akkumuliere gewichtete Welle
            value += combined * layerAmplitude;
            totalAmplitude += layerAmplitude;
        }

        // Normalisiere
        if (totalAmplitude > 0) {
            value = value / totalAmplitude;
        }

        // Füge subtile Schattierung für 3D-Effekt hinzu
        // Simuliere Licht und Schatten basierend auf dem Gradienten
        const gradientX = this.gradient(x + 0.01, y, scale, layers, amplitude, noiseAmount) - value;
        const gradientY = this.gradient(x, y + 0.01, scale, layers, amplitude, noiseAmount) - value;
        const shading = (gradientX + gradientY) * 0.2;

        value += shading;

        // Skaliere auf [0, 1]
        return Math.max(0, Math.min(1, (value + 1) * 0.5));
    },

    // Hilfsfunktion für Gradienten-Berechnung (vereinfacht, ohne Shading)
    gradient(x, y, scale, layers, amplitude, noiseAmount) {
        let value = 0.0;
        let totalAmplitude = 0.0;

        const sx = x * scale;
        const sy = y * scale;

        let noiseOffset = 0;
        if (noiseAmount > 0) {
            noiseOffset = perlin.noise(x, y, scale * 0.5) * noiseAmount;
        }

        for (let i = 0; i < layers; i++) {
            const frequency = Math.pow(2, i);
            const layerAmplitude = amplitude / (i + 1);
            const angle = (i * Math.PI) / layers;
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);
            const projection = sx * dirX + sy * dirY;
            const wave = Math.sin((projection + noiseOffset * 10) * frequency);
            const orthogonalProjection = -sx * dirY + sy * dirX;
            const crossWave = Math.sin((orthogonalProjection + noiseOffset * 5) * frequency * 0.5) * 0.3;
            value += (wave + crossWave) * layerAmplitude;
            totalAmplitude += layerAmplitude;
        }

        return totalAmplitude > 0 ? value / totalAmplitude : 0;
    }
};

export default wavelayer;
