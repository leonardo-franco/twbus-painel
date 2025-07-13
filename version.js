// TwBus Panel Version Information
const VERSION = {
    number: '2.0.1',
    name: 'Control Buttons Fix',
    date: '2025-07-13',
    features: [
        'Fixed control buttons styling and positioning',
        'Improved mobile responsiveness',
        'Enhanced button visual feedback',
        'Cleaned up duplicate CSS rules'
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