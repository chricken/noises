'use strict';

import noises from "./noises";

const saveCanvas = () => {
    let c = document.querySelector('canvas');
    
    // Erstelle einen Download-Link für das PNG-Bild
    const link = document.createElement('a');
    link.download = 'noise.png';
    link.href = c.toDataURL('image/png');
    link.click();
}

const init = () => {

    document.querySelector('#btnSave').addEventListener('click', saveCanvas);

    [...document.querySelectorAll('#noiseButtons button')].forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('value');
            const variant = btn.getAttribute('data-variant') || null;

            noises.draw({
                type,
                variant,
                canvas: document.querySelector('canvas'),
                width: 1200,
                height: 900,
                scale: 10,
                octaves: 4
            })
        })
    })


}

init();