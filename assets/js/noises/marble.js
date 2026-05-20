'use strict';

import perlin from './perlin.js';

// Marble-Rauschen (Marble Noise)
// Einsatzzweck: Marmor-Oberflächen, Adern in Gestein
const marble = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },

    draw({
             c,
             scale = 2.0,
             frequency = 5.0,
             turbulence = 2.0
         } = {}) {
        scale *= .3;
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Marble-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Marble-Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, frequency, turbulence);

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

    // Hilfsfunktion zur Berechnung des Marble-Noise
    noise(x, y, scale = 10.0, frequency = 5.0, turbulence = 2.0) {
        // Füge Turbulenz durch mehrere Perlin-Noise-Oktaven hinzu
        let turbulentValue = 0;

        // Mehrere Oktaven für Turbulenz-Effekt
        for (let i = 0; i < 4; i++) {
            const freq = Math.pow(2, i);
            const amp = 1.0 / freq;
            turbulentValue += Math.abs(perlin.noise(x, y, scale * freq)) * amp * turbulence;
        }

        // Kombiniere mit sinusförmiger Welle für Marmor-Adern
        // Die Turbulenz verzerrt die Sinus-Welle
        const marbleValue = Math.sin((x * frequency + turbulentValue) * Math.PI * 2);

        // Normalisiere auf [0, 1]
        return (marbleValue + 1) * 0.5;
    }
};

export default marble;
