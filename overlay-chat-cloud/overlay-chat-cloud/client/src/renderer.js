/**
 * Overlay Chat - Renderer Process
 * Cloud Edition with Room Codes
 */

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Panels
    roomPanel: document.getElementById('room-panel'),
    settingsPanel: document.getElementById('settings-panel'),
    chatPanel: document.getElementById('chat-panel'),
    
    // Room controls
    btnCreateRoom: document.getElementById('btn-create-room'),
    btnJoinRoom: document.getElementById('btn-join-room'),
    roomCodeInput: document.getElementById('room-code-input'),
    roomStatus: document.getElementById('room-status'),
    
    // Room info bar
    currentRoomCode: document.getElementById('current-room-code'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    btnLeaveRoom: document.getElementById('btn-leave-room'),
    
    // Title bar
    btnSettings: document.getElementById('btn-settings'),
    btnMinimize: document.getElementById('btn-minimize'),
    btnLock: document.getElementById('btn-lock'),
    btnClose: document.getElementById('btn-close'),
    
    // Settings
    displayName: document.getElementById('display-name'),
    nameColor: document.getElementById('name-color'),
    btnSetName: document.getElementById('btn-set-name'),
    btnSetColor: document.getElementById('btn-set-color'),
    opacitySlider: document.getElementById('opacity-slider'),
    opacityValue: document.getElementById('opacity-value'),
    userList: document.getElementById('user-list'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    
    // Chat
    messagesContainer: document.getElementById('messages-container'),
    messages: document.getElementById('messages'),
    messageInput: document.getElementById('message-input'),
    btnSend: document.getElementById('btn-send')
};

// ============================================
// State
// ============================================
let socket = null;
let serverUrl = 'ws://localhost:8080';
let isConnected = false;
let currentRoom = null;
let myName = 'Anonymous';
let myColor = '#00ff88';
let isLocked = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// ============================================
// Initialization
// ============================================
async function init() {
    try {
        const config = await window.electronAPI.getConfig();
        serverUrl = config.serverUrl;
        console.log(`Overlay Chat v${config.version}`);
        console.log(`Server: ${serverUrl}`);
    } catch (e) {
        console.log('Using default server URL');
    }
    
    connectToServer();
}

// ============================================
// WebSocket Functions
// ============================================
function connectToServer() {
    updateRoomStatus('Connecting to server...', 'info');
    
    try {
        socket = new WebSocket(serverUrl);
        
        socket.onopen = () => {
            isConnected = true;
            reconnectAttempts = 0;
            updateRoomStatus('Connected! Create or join a room.', 'success');
            console.log('Connected to server');
        };
        
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        };
        
        socket.onclose = () => {
            isConnected = false;
            socket = null;
            
            if (currentRoom) {
                currentRoom = null;
                showPanel('room');
            }
            
            updateRoomStatus('Disconnected from server', 'error');
            
            // Auto-reconnect
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                setTimeout(() => {
                    updateRoomStatus(`Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, 'info');
                    connectToServer();
                }, 2000 * reconnectAttempts);
            } else {
                updateRoomStatus('Could not connect. Check your internet.', 'error');
            }
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
    } catch (error) {
        updateRoomStatus('Failed to connect', 'error');
    }
}

function handleMessage(data) {
    switch (data.type) {
        case 'roomCreated':
            currentRoom = data.roomCode;
            elements.currentRoomCode.textContent = `Room: ${data.roomCode}`;
            showPanel('chat');
            addSystemMessage(`Room created! Share code: ${data.roomCode}`);
            break;
            
        case 'roomJoined':
            currentRoom = data.roomCode;
            elements.currentRoomCode.textContent = `Room: ${data.roomCode}`;
            showPanel('chat');
            addSystemMessage(data.message);
            break;
            
        case 'roomLeft':
            currentRoom = null;
            showPanel('room');
            elements.messages.innerHTML = '';
            break;
            
        case 'chat':
            addChatMessage(data.name, data.color, data.text, data.timestamp);
            break;
            
        case 'system':
            addSystemMessage(data.message);
            break;
            
        case 'userList':
            updateUserList(data.users);
            break;
            
        case 'error':
            if (currentRoom) {
                addSystemMessage('⚠️ ' + data.message);
            } else {
                updateRoomStatus(data.message, 'error');
            }
            break;
    }
}

function sendMessage(type, data = {}) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type, ...data }));
    }
}

// ============================================
// Room Functions
// ============================================
function createRoom() {
    if (!isConnected) {
        updateRoomStatus('Not connected to server', 'error');
        return;
    }
    sendMessage('createRoom');
}

function joinRoom() {
    if (!isConnected) {
        updateRoomStatus('Not connected to server', 'error');
        return;
    }
    
    const code = elements.roomCodeInput.value.trim().toUpperCase();
    if (!code || code.length !== 6) {
        updateRoomStatus('Enter a 6-character room code', 'error');
        return;
    }
    
    sendMessage('joinRoom', { roomCode: code });
}

function leaveRoom() {
    sendMessage('leaveRoom');
    currentRoom = null;
    showPanel('room');
    elements.messages.innerHTML = '';
}

function copyRoomCode() {
    if (currentRoom) {
        navigator.clipboard.writeText(currentRoom).then(() => {
            elements.btnCopyCode.classList.add('copied');
            setTimeout(() => elements.btnCopyCode.classList.remove('copied'), 300);
        });
    }
}

// ============================================
// UI Functions
// ============================================
function showPanel(panel) {
    elements.roomPanel.classList.add('hidden');
    elements.settingsPanel.classList.add('hidden');
    elements.chatPanel.classList.add('hidden');
    
    switch (panel) {
        case 'room':
            elements.roomPanel.classList.remove('hidden');
            break;
        case 'settings':
            elements.settingsPanel.classList.remove('hidden');
            break;
        case 'chat':
            elements.chatPanel.classList.remove('hidden');
            break;
    }
}

function updateRoomStatus(text, type = '') {
    elements.roomStatus.textContent = text;
    elements.roomStatus.className = 'status-message ' + type;
}

function addChatMessage(name, color, text, timestamp) {
    const time = new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.innerHTML = `
        <span class="time">${time}</span>
        <span class="sender" style="color: ${escapeHtml(color)}">${escapeHtml(name)}:</span>
        <span class="text">${escapeHtml(text)}</span>
    `;
    
    elements.messages.appendChild(messageEl);
    scrollToBottom();
}

function addSystemMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message system';
    messageEl.textContent = text;
    
    elements.messages.appendChild(messageEl);
    scrollToBottom();
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function updateUserList(users) {
    if (users.length === 0) {
        elements.userList.innerHTML = '<li class="no-users">No one else here yet</li>';
        return;
    }
    
    elements.userList.innerHTML = users.map(user => `
        <li>
            <span class="user-color-dot" style="background-color: ${escapeHtml(user.color)}"></span>
            <span>${escapeHtml(user.name)}</span>
        </li>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Event Listeners
// ============================================

// Room actions
elements.btnCreateRoom.addEventListener('click', createRoom);
elements.btnJoinRoom.addEventListener('click', joinRoom);
elements.roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
});
elements.roomCodeInput.addEventListener('input', () => {
    elements.roomCodeInput.value = elements.roomCodeInput.value.toUpperCase();
});

// Room info bar
elements.btnCopyCode.addEventListener('click', copyRoomCode);
elements.btnLeaveRoom.addEventListener('click', leaveRoom);

// Title bar
elements.btnSettings.addEventListener('click', () => {
    if (!currentRoom) return;
    if (elements.settingsPanel.classList.contains('hidden')) {
        showPanel('settings');
    } else {
        showPanel('chat');
    }
});

elements.btnMinimize.addEventListener('click', async () => {
    const minimized = await window.electronAPI.toggleMinimize();
    elements.btnMinimize.textContent = minimized ? '➕' : '➖';
});

elements.btnLock.addEventListener('click', async () => {
    isLocked = await window.electronAPI.toggleLock();
    elements.btnLock.textContent = isLocked ? '🔒' : '🔓';
    elements.btnLock.classList.toggle('locked', isLocked);
});

elements.btnClose.addEventListener('click', () => {
    if (socket) socket.close();
    window.electronAPI.closeApp();
});

// Settings
elements.btnSetName.addEventListener('click', () => {
    const name = elements.displayName.value.trim();
    if (name) {
        myName = name;
        sendMessage('setName', { name });
    }
});

elements.displayName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const name = elements.displayName.value.trim();
        if (name) {
            myName = name;
            sendMessage('setName', { name });
        }
    }
});

elements.btnSetColor.addEventListener('click', () => {
    myColor = elements.nameColor.value;
    sendMessage('setColor', { color: myColor });
});

elements.nameColor.addEventListener('change', () => {
    myColor = elements.nameColor.value;
    sendMessage('setColor', { color: myColor });
});

elements.opacitySlider.addEventListener('input', () => {
    const opacity = elements.opacitySlider.value / 100;
    elements.opacityValue.textContent = `${elements.opacitySlider.value}%`;
    window.electronAPI.setOpacity(opacity);
});

elements.btnCloseSettings.addEventListener('click', () => {
    showPanel('chat');
});

// Chat
elements.btnSend.addEventListener('click', () => {
    const text = elements.messageInput.value.trim();
    if (text && isConnected && currentRoom) {
        sendMessage('chat', { text });
        elements.messageInput.value = '';
    }
});

elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = elements.messageInput.value.trim();
        if (text && isConnected && currentRoom) {
            sendMessage('chat', { text });
            elements.messageInput.value = '';
        }
    }
});

// ============================================
// Start
// ============================================
init();
console.log('Overlay Chat initialized! Press Ctrl+Shift+O to toggle visibility.');
