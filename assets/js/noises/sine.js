'use strict';

// Sinus-Rauschen (Sine Wave Noise)
// Einsatzzweck: Beruhigende Wellenmuster, Wasseroberflächen, meditative Hintergrundtexturen
const sine = {
    waves: [],

    init(numWaves = 8, seed = Math.random() * 10000) {
        this.seed = seed;
        this.waves = [];

        // Generiere zufällige Sinus-Wellen
        for (let i = 0; i < numWaves; i++) {
            const wave = {
                frequencyX: 1.0 + this.random(i * 5) * 3.0, // Frequenz X zwischen 1 und 4
                frequencyY: 1.0 + this.random(i * 5 + 1) * 3.0, // Frequenz Y zwischen 1 und 4
                phaseX: this.random(i * 5 + 2) * Math.PI * 2, // Phase X
                phaseY: this.random(i * 5 + 3) * Math.PI * 2, // Phase Y
                amplitude: 0.3 + this.random(i * 5 + 4) * 0.7 // Amplitude zwischen 0.3 und 1.0
            };
            this.waves.push(wave);
        }
    },

    draw({c, scale = 10.0, numWaves = 8, complexity = 1.0} = {}) {
        // Initialisiere mit Parametern
        this.init(numWaves, Math.random() * 10000);

        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Sine Wave Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Sine Wave Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, complexity);

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

    // Hilfsfunktion zur Berechnung des Sine Wave Noise
    noise(x, y, scale = 10.0, complexity = 1.0) {
        let value = 0.0;
        let totalAmplitude = 0.0;

        // Skaliere die Koordinaten
        const sx = x * scale;
        const sy = y * scale;

        // Summiere alle Sinus-Wellen
        for (let i = 0; i < this.waves.length; i++) {
            const wave = this.waves[i];

            // Berechne die Sinus-Wellen in X und Y Richtung
            const waveX = Math.sin(sx * wave.frequencyX * complexity + wave.phaseX);
            const waveY = Math.sin(sy * wave.frequencyY * complexity + wave.phaseY);

            // Kombiniere die Wellen (verschiedene Kombinationsmodi für Variation)
            let combined;
            if (i % 3 === 0) {
                // Additive Kombination
                combined = (waveX + waveY) * 0.5;
            } else if (i % 3 === 1) {
                // Multiplikative Kombination
                combined = waveX * waveY;
            } else {
                // Diagonale Welle
                combined = Math.sin((sx * wave.frequencyX + sy * wave.frequencyY) * complexity + wave.phaseX);
            }

            // Akkumuliere gewichtete Welle
            value += combined * wave.amplitude;
            totalAmplitude += wave.amplitude;
        }

        // Normalisiere
        if (totalAmplitude > 0) {
            value = value / totalAmplitude;
        }

        // Skaliere auf [0, 1]
        return (value + 1) * 0.5;
    },

    // Pseudo-Zufallsgenerator
    random(n) {
        const x = Math.sin(n * 127.1 + this.seed) * 43758.5453;
        return x - Math.floor(x);
    }
};

export default sine;
