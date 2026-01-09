/**
 * Overlay Chat - Configuration
 * 
 * ═══════════════════════════════════════════════════════════════════
 * IMPORTANT: Change the SERVER_URL below to your deployed server!
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Examples:
 * - Render:    'wss://your-app-name.onrender.com'
 * - Railway:   'wss://your-app.up.railway.app'
 * - Fly.io:    'wss://your-app.fly.dev'
 * - Local:     'ws://localhost:8080'
 * - Self-host: 'ws://your-server-ip:8080'
 * 
 * Note: Use 'wss://' for HTTPS hosted servers, 'ws://' for local/HTTP
 */

module.exports = {
    // ⬇️ CHANGE THIS TO YOUR SERVER URL ⬇️
    SERVER_URL: 'ws://localhost:8080',
    
    // App settings (you can leave these as-is)
    APP_NAME: 'Overlay Chat',
    VERSION: '2.0.0',
    MAX_MESSAGE_LENGTH: 500,
    MAX_NAME_LENGTH: 20
};
