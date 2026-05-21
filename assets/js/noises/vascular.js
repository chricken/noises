'use strict';

import perlin from './perlin.js';

// Vascular Noise (Gefäß-ähnliche Strukturen)
// Einsatzzweck: Blutgefäße, Wurzelsysteme, Flussdeltas
const vascular = {
    init() {
        // Initialisiere das zugrundeliegende Perlin-Noise-Modul
        perlin.init();
    },

    draw({
             c,
             scale = 10.0,
             branches = 4,
             thickness = 0.5
         } = {}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;

        console.log('Vascular: Starting draw with', {width, height, scale, branches, thickness});

        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Test: Generiere einen einzelnen Wert zur Überprüfung
        const testValue = this.noise(0.5, 0.5, scale, branches, thickness);
        console.log('Vascular: Test noise value at (0.5, 0.5):', testValue);

        // Generiere Vascular Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;

                // Generiere den Vascular Noise-Wert
                const noiseValue = this.noise(nx, ny, scale, branches, thickness);

                // Konvertiere den Noise-Wert in einen Graustufenwert
                const grayValue = Math.floor(noiseValue * 255);

                // Setze die Pixel-Farbe
                const index = (y * width + x) * 4;
                data[index] = grayValue;
                data[index + 1] = grayValue;
                data[index + 2] = grayValue;
                data[index + 3] = 255; // Alpha-Kanal
            }

            // Fortschrittslog alle 100 Zeilen
            if (y % 100 === 0) {
                console.log(`Vascular: Processing row ${y}/${height}`);
            }
        }

        console.log('Vascular: Draw complete');
        // Zeichne das ImageData-Objekt auf das Canvas
        ctx.putImageData(imageData, 0, 0);
    },

    // Hilfsfunktion zur Berechnung des Vascular Noise
    noise(x, y, scale = 10.0, branches = 4, thickness = 0.5) {
        // Berechne Distanz zu allen Gefäßstrukturen
        let minDist = this.vascularDistance(x, y, scale, branches);

        // Füge fraktales Rauschen hinzu für organische Variation
        const fbm = this.fbm(x * scale, y * scale, 3);
        minDist += fbm * 0.01;

        // Konvertiere Distanz zu Intensität mit exponentieller Abnahme
        let value = Math.exp(-minDist * scale * thickness * 3.0);

        // Verstärke den Kontrast
        value = Math.pow(value, 0.8);

        return Math.max(0, Math.min(1, value));
    },

    // Berechnet Distanz zu gefäßartigen Strukturen
    vascularDistance(x, y, scale, branches) {
        let minDist = 100.0;

        const cellX = Math.floor(x * scale);
        const cellY = Math.floor(y * scale);

        // Prüfe benachbarte Zellen (3x3 Gitter)
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const cx = cellX + dx;
                const cy = cellY + dy;

                // Zufälliger Knotenpunkt in der Zelle
                const nodeX = (cx + this.hash2D(cx, cy)) / scale;
                const nodeY = (cy + this.hash2D(cy, cx)) / scale;

                // Erstelle Äste vom Knoten aus
                for (let b = 0; b < branches; b++) {
                    const seed = cx * 73 + cy * 137 + b * 31;
                    const angle = this.hash2D(seed, seed + 1) * Math.PI * 2;
                    const branchLength = 0.4 + this.hash2D(seed + 7, seed + 13) * 0.4;

                    // Distanz zu diesem Ast (als Liniensegment)
                    const dist = this.distanceToSegment(
                        x, y,
                        nodeX, nodeY,
                        nodeX + Math.cos(angle) * branchLength / scale,
                        nodeY + Math.sin(angle) * branchLength / scale
                    );

                    minDist = Math.min(minDist, dist);
                }

                // Distanz zum Knoten selbst
                const dx2 = x - nodeX;
                const dy2 = y - nodeY;
                const nodeDist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                minDist = Math.min(minDist, nodeDist);
            }
        }

        return minDist;
    },

    // Berechnet die Distanz von Punkt (px, py) zu einem Liniensegment von (ax, ay) nach (bx, by)
    distanceToSegment(px, py, ax, ay, bx, by) {
        const dx = bx - ax;
        const dy = by - ay;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) {
            // Punkt zu Punkt
            const dpx = px - ax;
            const dpy = py - ay;
            return Math.sqrt(dpx * dpx + dpy * dpy);
        }

        // Projektion auf das Liniensegment (t wird auf [0, 1] begrenzt)
        let t = ((px - ax) * dx + (py - ay) * dy) / lengthSq;
        t = Math.max(0, Math.min(1, t));

        // Nächster Punkt auf dem Segment
        const closestX = ax + t * dx;
        const closestY = ay + t * dy;

        // Distanz zum nächsten Punkt
        const distX = px - closestX;
        const distY = py - closestY;
        return Math.sqrt(distX * distX + distY * distY);
    },

    // Fractional Brownian Motion für organische Variation
    fbm(x, y, octaves) {
        let value = 0.0;
        let amplitude = 0.5;
        let frequency = 1.0;

        for (let i = 0; i < octaves; i++) {
            value += amplitude * perlin.noise(x * frequency, y * frequency, 0);
            frequency *= 2.0;
            amplitude *= 0.5;
        }

        return value;
    },

    // Smooth-Step-Funktion für weiche Übergänge
    smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3.0 - 2.0 * t);
    },

    // Hash-Funktion für konsistente Zufallswerte
    hash2D(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }
};

export default vascular;
