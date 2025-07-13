// TwBus Panel Version Information
const VERSION = {
    number: '2.1.0',
    name: 'Project Structure Reorganization',
    date: '2025-07-13',
    features: [
        'Reorganized project structure with folders: assets/, config/, docs/',
        'Moved configuration files to config/ directory',
        'Organized icons and static assets in assets/',
        'Centralized documentation in docs/',
        'Updated build scripts and paths',
        'Removed unused PWA files (manifest.json, sw.js)',
        'Created project.config.js for centralized configuration'
    ]
};

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
    window.TWBUS_VERSION = VERSION;
}

// Suporte a módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VERSION;
}