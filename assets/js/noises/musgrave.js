'use strict';

import perlin from './perlin.js';

// Musgrave-Rauschen basierend auf Perlin-Noise
// Einsatzzweck: Gebirge, Erosion, natürliche Texturen
const musgrave = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },
    draw({
             c,
             scale = 10.0,
             variant = 'ridged',
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

        // Generiere Musgrave-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Musgrave-Wert
                let noiseValue;
                if (variant === 'ridged') {
                    noiseValue = this.ridgedMultifractal(nx, ny, scale, octaves, lacunarity, gain, offset);
                } else if (variant === 'hybrid') {
                    noiseValue = this.hybridMultifractal(nx, ny, scale, octaves, lacunarity, gain, offset);
                }

                // Konvertiere den Noise-Wert in einen Graustufenwert
                const grayValue = Math.floor(Math.min(Math.max(noiseValue * 255, 0), 255));

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

    // Ridged Multifractal - erzeugt scharfe Grate wie Bergkämme
    ridgedMultifractal(x, y, scale = 10.0, octaves = 6, lacunarity = 2.0, gain = 0.5, offset = 1.0) {
        let result = 0.0;
        let frequency = 1.0;
        let amplitude = 1.0;
        let weight = 1.0;

        for (let i = 0; i < octaves; i++) {
            // Hole Perlin-Noise-Wert
            let signal = perlin.noise(x, y, scale * frequency);

            // Invertiere und nimm Absolutwert für scharfe Grate
            signal = Math.abs(signal);
            signal = offset - signal;

            // Quadriere das Signal für schärfere Kanten
            signal *= signal;

            // Gewichte mit vorherigem Wert für spektrale Kontrolle
            signal *= weight;

            // Begrenze das Gewicht
            weight = signal * gain;
            weight = Math.max(0.0, Math.min(1.0, weight));

            // Addiere zum Ergebnis
            result += signal * amplitude;

            // Erhöhe Frequenz und verringere Amplitude
            frequency *= lacunarity;
            amplitude *= gain;
        }

        return result;
    },

    // Hybrid Multifractal - erzeugt organische Übergänge
    hybridMultifractal(x, y, scale = 10.0, octaves = 6, lacunarity = 2.0, gain = 0.5, offset = 0.7) {
        let result = 0.0;
        let frequency = 1.0;
        let amplitude = 1.0;
        let weight = 1.0;

        // Erste Oktave bestimmt die Grundstruktur
        let signal = (perlin.noise(x, y, scale * frequency) + offset) * amplitude;
        result = signal;
        weight = signal;

        frequency *= lacunarity;
        amplitude *= gain;

        // Weitere Oktaven werden mit dem Gewicht der vorherigen multipliziert
        for (let i = 1; i < octaves; i++) {
            // Begrenze das Gewicht
            weight = Math.max(0.0, Math.min(1.0, weight));

            // Hole Perlin-Noise-Wert
            signal = (perlin.noise(x, y, scale * frequency) + offset) * amplitude;

            // Gewichte mit vorherigem Wert
            signal *= weight;

            // Addiere zum Ergebnis
            result += signal;

            // Aktualisiere Gewicht für nächste Oktave
            weight *= signal;

            // Erhöhe Frequenz und verringere Amplitude
            frequency *= lacunarity;
            amplitude *= gain;
        }

        return result;
    }
};

export default musgrave;
