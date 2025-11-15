import { setupEditor } from './editor.js';
import { setupExporter } from './exporter.js';

document.addEventListener('DOMContentLoaded', () => {
    setupEditor();
    setupExporter();
    console.log('All modules initialized');
});
