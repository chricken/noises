'use strict';

import perlin from './perlin.js';

// Ridged Multifractal Noise (Grat-Textur)
// Einsatzzweck: Flussläufe, Gebirgskämme, Erosionsmuster
const ridgedmultifractal = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },

    draw({
             c,
             scale = 10.0,
             octaves = 6,
             lacunarity = 2.0,
             gain = 0.5,
             offset = 1.0
         } = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Ridged Multifractal Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Ridged Multifractal Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, octaves, lacunarity, gain, offset);

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

    // Hilfsfunktion zur Berechnung des Ridged Multifractal Noise
    noise(x, y, scale = 10.0, octaves = 6, lacunarity = 2.0, gain = 0.5, offset = 1.0) {
        let result = 0.0;
        let frequency = 1.0;
        let amplitude = 0.5;
        let weight = 1.0;

        for (let i = 0; i < octaves; i++) {
            // Hole Perlin-Noise-Wert
            let signal = perlin.noise(x, y, scale * frequency);

            // RIDGED: Nimm Absolutwert und invertiere für scharfe Grate
            signal = Math.abs(signal);
            signal = offset - signal;

            // Quadriere das Signal MEHRFACH für sehr scharfe, zackige Kanten
            signal = signal * signal;

            // Zusätzliche Verschärfung für zackigere Grate
            if (signal > 0.5) {
                signal = Math.pow(signal, 0.8); // Verstärke hohe Werte (Grate)
            } else {
                signal = Math.pow(signal, 2.0); // Dämpfe niedrige Werte (Täler) stark
            }

            // Gewichte mit vorherigem Wert (spektrale Kontrolle)
            signal *= weight;

            // Begrenze das Gewicht für die nächste Iteration
            weight = signal * gain;
            weight = Math.max(0.0, Math.min(1.0, weight));

            // Addiere zum Ergebnis
            result += signal * amplitude;

            // Erhöhe Frequenz (mehr Details)
            frequency *= lacunarity;

            // Verringere Amplitude
            amplitude *= gain;
        }

        // Extreme Kontrastverstärkung für sehr zackige Kanten
        result = Math.pow(Math.max(0, result), 2.0);

        // Normalisiere auf [0, 1]
        return Math.max(0, Math.min(1, result));
    }
};

export default ridgedmultifractal;
