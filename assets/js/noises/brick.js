'use strict';

// Brick-Rauschen (Brick/Checkered Noise)
// Einsatzzweck: Ziegelsteinmauern, Schachbrettmuster
const brick = {
    init() {
        // Keine spezielle Initialisierung nötig
    },

    draw({
             c,
             scale = 10.0,
             brickWidth = 2.0,
             brickHeight = 1.0,
             mortarThickness = 0.02,
             distortion = 0.05
         } = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Generiere Brick-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Brick-Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, brickWidth, brickHeight, mortarThickness, distortion);

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

    // Hilfsfunktion zur Berechnung des Brick-Noise
    noise(x, y, scale = 10.0, brickWidth = 2.0, brickHeight = 1.0, mortarThickness = 0.1, distortion = 0.1) {
        // Skalierung der Koordinaten
        const scaledX = x * scale;
        const scaledY = y * scale;

        // Berechne die Reihe (Y-Position)
        const row = Math.floor(scaledY / brickHeight);

        // Füge horizontalen Offset für ungerade Reihen hinzu (running bond pattern)
        const xOffset = (row % 2) * brickWidth * 0.5;
        const adjustedX = scaledX + xOffset;

        // Berechne Brick-Position
        const brickX = adjustedX / brickWidth;
        const brickY = scaledY / brickHeight;

        // Ganzzahlige Brick-Koordinaten
        const bx = Math.floor(brickX);
        const by = Math.floor(brickY);

        // Position innerhalb des Bricks (0 bis 1)
        let fx = brickX - bx;
        let fy = brickY - by;

        // Füge zufällige Störungen hinzu für "handgemacht"-Effekt
        if (distortion > 0) {
            const distX = this.random(bx, by) * distortion;
            const distY = this.random(bx + 1, by + 1) * distortion;
            fx += distX;
            fy += distY;
        }

        // Bestimme Mörtel (mortar) zwischen den Steinen
        const isMortarX = fx < mortarThickness || fx > (1 - mortarThickness);
        const isMortarY = fy < mortarThickness || fy > (1 - mortarThickness);

        if (isMortarX || isMortarY) {
            // Mörtel (dunkler)
            return 0.3 + this.random(bx * 2, by * 2) * 0.1;
        } else {
            // Ziegelstein mit leichter Variation
            const brickBase = 0.7;
            const variation = this.random(bx, by) * 0.2;

            // Füge subtile interne Struktur hinzu
            const internalNoise = this.random(bx * 17 + fx * 10, by * 31 + fy * 10) * 0.05;

            return brickBase + variation + internalNoise;
        }
    },

    // Pseudo-Zufallsgenerator für konsistente Brick-Muster
    random(x, y) {
        const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }
};

export default brick;
