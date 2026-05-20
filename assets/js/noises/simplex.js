'use strict';

const simplex = {
    grad3: [],
    p: [],
    init() {
        // Initialisiere die Gradienten für Simplex-Noise
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        
        // Initialisiere die Permutations-Tabelle für Simplex-Noise
        this.p = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        
        // Verdopple die Permutations-Tabelle, um Überläufe zu vermeiden
        this.p = this.p.concat(this.p);
    },
    draw({c, scale = 10.0}={}) {
        const ctx = c.getContext('2d');
        const width = c.width;
        const height = c.height;
        
        // Erstelle ein ImageData-Objekt für das Canvas
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        // Generiere Simplex-Noise für jedes Pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalisiere die Koordinaten auf den Bereich [0, 1]
                const nx = x / width;
                const ny = y / height;
                
                // Generiere den Simplex-Noise-Wert mit dem übergebenen Scale
                const noiseValue = this.noise(nx, ny, scale);
                
                // Konvertiere den Noise-Wert in einen Graustufenwert
                const grayValue = Math.floor((noiseValue + 1) * 127.5);
                
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
    
    // Hilfsfunktion zur Berechnung des Simplex-Noise
    noise(x, y, scale = 10.0) {
        // Skalierung der Koordinaten
        const scaledX = x * scale;
        const scaledY = y * scale;
        
        // Berechne die Skew-Faktoren
        const s = (scaledX + scaledY) * 0.3660254037844386; // (sqrt(3)-1)/2
        const i = Math.floor(scaledX + s);
        const j = Math.floor(scaledY + s);
        
        // Berechne die Unskew-Faktoren
        const t = (i + j) * 0.21132486540518713; // (3-sqrt(3))/6
        const x0 = scaledX - (i - t);
        const y0 = scaledY - (j - t);
        
        // Bestimme das Simplex
        let i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }
        
        // Berechne die Abstände zu den Eckpunkten
        const x1 = x0 - i1 + 0.21132486540518713;
        const y1 = y0 - j1 + 0.21132486540518713;
        const x2 = x0 - 0.5773502691896257; // 1-2*0.21132486540518713
        const y2 = y0 - 0.5773502691896257;
        
        // Berechne die Noise-Beiträge für die drei Eckpunkte mit radialer Abfallfunktion
        let n0 = 0.0, n1 = 0.0, n2 = 0.0;

        const t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            const t0_sq = t0 * t0;
            n0 = t0_sq * t0_sq * this.dotGrad(i, j, x0, y0);
        }

        const t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            const t1_sq = t1 * t1;
            n1 = t1_sq * t1_sq * this.dotGrad(i + i1, j + j1, x1, y1);
        }

        const t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            const t2_sq = t2 * t2;
            n2 = t2_sq * t2_sq * this.dotGrad(i + 1, j + 1, x2, y2);
        }

        // Skaliere und gib den finalen Noise-Wert zurück
        return 70.0 * (n0 + n1 + n2);
    },
    
    // Hilfsfunktion zur smoothen Interpolation mit Fade-Funktion
    interpolate(a, b, t) {
        // Fade-Funktion: 6t^5 - 15t^4 + 10t^3
        const fade = t * t * t * (t * (t * 6 - 15) + 10);
        return a + fade * (b - a);
    },
    
    // Hilfsfunktion zur Berechnung des Skalarprodukts zwischen Gradient und Abstandsvektor
    dotGrad(ix, iy, x, y) {
        // Berechne den Gradienten für die Gitterzelle (ix, iy)
        const perm = (this.p[(ix & 255)] + iy) & 255;
        const grad = this.grad3[perm % 12];

        // Berechne das Skalarprodukt
        return grad[0] * x + grad[1] * y;
    }
}

export default simplex;