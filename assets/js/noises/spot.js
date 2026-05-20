'use strict';

// Spot-Rauschen (Spot Noise)
// Einsatzzweck: Tierfelle, Flecken auf Stoffen
const spot = {
    spots: [],

    init(numSpots = 100, seed = Math.random() * 10000, spotSize = 0.05, sizeVariation = 0.5) {
        this.seed = seed;
        this.spots = [];
        this.spotSize = spotSize;
        this.sizeVariation = sizeVariation;

        // Generiere zufällige Spots mit Position, Größe und Intensität
        for (let i = 0; i < numSpots; i++) {
            // Größe mit Variation
            const sizeRange = spotSize * sizeVariation;
            const minSize = spotSize - sizeRange;
            const maxSize = spotSize + sizeRange;

            const spot = {
                x: this.random(i * 3),
                y: this.random(i * 3 + 1),
                size: this.random(i * 3 + 2) * (maxSize - minSize) + minSize,
                intensity: this.random(i * 3 + 3) * 0.8 + 0.2 // Intensität zwischen 0.2 und 1.0
            };
            this.spots.push(spot);
        }
    },

    draw({
             c,
             scale = 10.0,
             numSpots = 100,
             spotSize = 0.05,
             softness = 5.0
         } = {}) {
        // Initialisiere mit den Parametern
        this.init(numSpots, Math.random() * 10000, spotSize, 0.5);

        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Spot-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Spot-Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, softness);

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

    // Hilfsfunktion zur Berechnung des Spot-Noise
    noise(x, y, scale = 10.0, softness = 5.0) {
        // Basiswert (heller Hintergrund)
        let value = 0.9;

        // Berechne den Einfluss aller Spots
        for (let i = 0; i < this.spots.length; i++) {
            const spot = this.spots[i];

            // Berechne die Distanz zum Spot (mit Wrapping für nahtlose Textur)
            const dx = Math.min(Math.abs(x - spot.x), 1 - Math.abs(x - spot.x));
            const dy = Math.min(Math.abs(y - spot.y), 1 - Math.abs(y - spot.y));
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Normalisierte Distanz basierend auf Spot-Größe
            const normalizedDist = distance / (spot.size * scale * 0.1);

            // Gaußsche Abfallfunktion für weiche Kanten (softness steuert die Härte)
            if (normalizedDist < 1.0) {
                const falloff = Math.exp(-normalizedDist * normalizedDist * softness);

                // Dunkle Spots (subtrahiere vom Hintergrund)
                value -= falloff * spot.intensity * 0.7;
            }
        }

        // Begrenze auf [0, 1]
        return Math.max(0, Math.min(1, value));
    },

    // Pseudo-Zufallsgenerator für konsistente Spot-Generierung
    random(n) {
        const x = Math.sin(n * 127.1 + this.seed) * 43758.5453;
        return x - Math.floor(x);
    }
};

export default spot;
