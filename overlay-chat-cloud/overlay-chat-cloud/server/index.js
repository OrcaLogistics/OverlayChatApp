/**
 * Overlay Chat Server - Cloud Edition
 * 
 * Features:
 * - Room codes for private chat groups
 * - Up to 5 users per room
 * - Unlimited rooms
 * - Auto-cleanup of empty rooms
 * - Ready for cloud deployment (Render, Railway, Fly.io, etc.)
 */

const WebSocket = require('ws');

// Configuration
const PORT = process.env.PORT || 8080;
const MAX_USERS_PER_ROOM = 5;

// Room storage: Map<roomCode, Map<WebSocket, UserData>>
const rooms = new Map();

// Create the WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log('╔══════════════════════════════════════════════════╗');
console.log('║     OVERLAY CHAT SERVER - CLOUD EDITION          ║');
console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  Port: ${PORT}                                       ║`);
console.log(`║  Max Users Per Room: ${MAX_USERS_PER_ROOM}                          ║`);
console.log('║  Status: Ready for connections                   ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

// Generate a random room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Get or create a room
function getRoom(roomCode) {
    if (!rooms.has(roomCode)) {
        rooms.set(roomCode, new Map());
        console.log(`[+] Room created: ${roomCode}`);
    }
    return rooms.get(roomCode);
}

// Clean up empty rooms
function cleanupRoom(roomCode) {
    const room = rooms.get(roomCode);
    if (room && room.size === 0) {
        rooms.delete(roomCode);
        console.log(`[-] Room deleted (empty): ${roomCode}`);
    }
}

// Broadcast to all users in a specific room
function broadcastToRoom(roomCode, message, excludeWs = null) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    room.forEach((userData, ws) => {
        if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
}

// Send user list to all clients in a room
function broadcastUserList(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    
    const userList = Array.from(room.values()).map(u => ({
        name: u.name,
        color: u.color
    }));
    
    broadcastToRoom(roomCode, {
        type: 'userList',
        users: userList,
        roomCode: roomCode
    });
}

// Handle new connections
wss.on('connection', (ws) => {
    let currentRoom = null;
    let userData = {
        name: 'Anonymous',
        color: '#00ff88'
    };
    
    console.log(`[*] New connection established`);
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'createRoom': {
                    // Create a new room with unique code
                    let roomCode = generateRoomCode();
                    while (rooms.has(roomCode)) {
                        roomCode = generateRoomCode();
                    }
                    
                    currentRoom = roomCode;
                    const room = getRoom(roomCode);
                    room.set(ws, userData);
                    
                    ws.send(JSON.stringify({
                        type: 'roomCreated',
                        roomCode: roomCode,
                        message: `Room ${roomCode} created! Share this code with friends.`
                    }));
                    
                    console.log(`[+] User created room: ${roomCode}`);
                    broadcastUserList(roomCode);
                    break;
                }
                
                case 'joinRoom': {
                    const roomCode = message.roomCode.toUpperCase().trim();
                    
                    // Validate room code format
                    if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Invalid room code format. Must be 6 characters.'
                        }));
                        return;
                    }
                    
                    // Check if room exists
                    if (!rooms.has(roomCode)) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Room not found. Check the code or create a new room.'
                        }));
                        return;
                    }
                    
                    const room = rooms.get(roomCode);
                    
                    // Check if room is full
                    if (room.size >= MAX_USERS_PER_ROOM) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Room is full! Maximum 5 users per room.'
                        }));
                        return;
                    }
                    
                    // Leave previous room if any
                    if (currentRoom && rooms.has(currentRoom)) {
                        rooms.get(currentRoom).delete(ws);
                        broadcastToRoom(currentRoom, {
                            type: 'system',
                            message: `${userData.name} left the room.`
                        });
                        broadcastUserList(currentRoom);
                        cleanupRoom(currentRoom);
                    }
                    
                    // Join new room
                    currentRoom = roomCode;
                    room.set(ws, userData);
                    
                    ws.send(JSON.stringify({
                        type: 'roomJoined',
                        roomCode: roomCode,
                        message: `Joined room ${roomCode}!`
                    }));
                    
                    broadcastToRoom(roomCode, {
                        type: 'system',
                        message: `${userData.name} joined the room!`
                    }, ws);
                    
                    console.log(`[+] User joined room: ${roomCode} (${room.size}/${MAX_USERS_PER_ROOM})`);
                    broadcastUserList(roomCode);
                    break;
                }
                
                case 'setName': {
                    const oldName = userData.name;
                    userData.name = message.name.substring(0, 20).trim() || 'Anonymous';
                    
                    if (currentRoom) {
                        const room = rooms.get(currentRoom);
                        if (room) room.set(ws, userData);
                        
                        broadcastToRoom(currentRoom, {
                            type: 'system',
                            message: oldName === 'Anonymous' 
                                ? `${userData.name} joined the chat!`
                                : `${oldName} is now known as ${userData.name}`
                        });
                        broadcastUserList(currentRoom);
                    }
                    
                    console.log(`[*] Name change: "${oldName}" → "${userData.name}"`);
                    break;
                }
                
                case 'setColor': {
                    userData.color = message.color;
                    
                    if (currentRoom) {
                        const room = rooms.get(currentRoom);
                        if (room) room.set(ws, userData);
                        broadcastUserList(currentRoom);
                    }
                    break;
                }
                
                case 'chat': {
                    if (!currentRoom) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'You must join a room first!'
                        }));
                        return;
                    }
                    
                    const text = message.text.substring(0, 500).trim();
                    if (!text) return;
                    
                    const chatMessage = {
                        type: 'chat',
                        name: userData.name,
                        color: userData.color,
                        text: text,
                        timestamp: Date.now()
                    };
                    
                    // Send to ALL clients in the room (including sender)
                    const room = rooms.get(currentRoom);
                    if (room) {
                        room.forEach((_, client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(chatMessage));
                            }
                        });
                    }
                    
                    console.log(`[${currentRoom}] ${userData.name}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
                    break;
                }
                
                case 'leaveRoom': {
                    if (currentRoom && rooms.has(currentRoom)) {
                        const room = rooms.get(currentRoom);
                        room.delete(ws);
                        
                        broadcastToRoom(currentRoom, {
                            type: 'system',
                            message: `${userData.name} left the room.`
                        });
                        broadcastUserList(currentRoom);
                        cleanupRoom(currentRoom);
                        
                        ws.send(JSON.stringify({
                            type: 'roomLeft',
                            message: 'You left the room.'
                        }));
                        
                        console.log(`[-] User left room: ${currentRoom}`);
                        currentRoom = null;
                    }
                    break;
                }
                
                default:
                    console.log(`[?] Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('[!] Error processing message:', error.message);
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        if (currentRoom && rooms.has(currentRoom)) {
            const room = rooms.get(currentRoom);
            room.delete(ws);
            
            broadcastToRoom(currentRoom, {
                type: 'system',
                message: `${userData.name} disconnected.`
            });
            broadcastUserList(currentRoom);
            cleanupRoom(currentRoom);
            
            console.log(`[-] User disconnected from room: ${currentRoom}`);
        } else {
            console.log(`[-] User disconnected (no room)`);
        }
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error('[!] WebSocket error:', error.message);
    });
});

// Server stats endpoint (optional - for monitoring)
setInterval(() => {
    const totalUsers = Array.from(rooms.values()).reduce((sum, room) => sum + room.size, 0);
    if (rooms.size > 0) {
        console.log(`[Stats] Rooms: ${rooms.size} | Users: ${totalUsers}`);
    }
}, 60000); // Log stats every minute

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n[!] Shutting down server...');
    
    rooms.forEach((room, roomCode) => {
        broadcastToRoom(roomCode, {
            type: 'system',
            message: 'Server is shutting down!'
        });
    });
    
    wss.close(() => {
        console.log('[!] Server closed.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    process.emit('SIGINT');
});
