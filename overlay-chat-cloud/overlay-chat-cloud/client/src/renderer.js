/**
 * Overlay Chat - Minimal Edition
 */

const elements = {
    roomPanel: document.getElementById('room-panel'),
    settingsPanel: document.getElementById('settings-panel'),
    chatPanel: document.getElementById('chat-panel'),
    btnCreateRoom: document.getElementById('btn-create-room'),
    btnJoinRoom: document.getElementById('btn-join-room'),
    roomCodeInput: document.getElementById('room-code-input'),
    roomStatus: document.getElementById('room-status'),
    currentRoomCode: document.getElementById('current-room-code'),
    btnCopyCode: document.getElementById('btn-copy-code'),
    btnLeaveRoom: document.getElementById('btn-leave-room'),
    btnSettings: document.getElementById('btn-settings'),
    btnMinimize: document.getElementById('btn-minimize'),
    btnLock: document.getElementById('btn-lock'),
    btnClose: document.getElementById('btn-close'),
    displayName: document.getElementById('display-name'),
    nameColor: document.getElementById('name-color'),
    btnSetName: document.getElementById('btn-set-name'),
    btnSetColor: document.getElementById('btn-set-color'),
    userList: document.getElementById('user-list'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    messagesContainer: document.getElementById('messages-container'),
    messages: document.getElementById('messages'),
    messageInput: document.getElementById('message-input'),
    btnSend: document.getElementById('btn-send')
};

let socket = null;
let serverUrl = 'ws://localhost:8080';
let isConnected = false;
let currentRoom = null;
let myName = 'anon';
let myColor = '#888888';
let isLocked = false;
let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

async function init() {
    try {
        const config = await window.electronAPI.getConfig();
        serverUrl = config.serverUrl;
    } catch (e) {}
    connectToServer();
}

function connectToServer() {
    updateStatus('connecting...', 'info');
    
    try {
        socket = new WebSocket(serverUrl);
        
        socket.onopen = () => {
            isConnected = true;
            reconnectAttempts = 0;
            updateStatus('connected', 'success');
        };
        
        socket.onmessage = (e) => {
            try {
                handleMessage(JSON.parse(e.data));
            } catch (err) {}
        };
        
        socket.onclose = () => {
            isConnected = false;
            socket = null;
            if (currentRoom) {
                currentRoom = null;
                showPanel('room');
            }
            updateStatus('disconnected', 'error');
            
            if (reconnectAttempts < MAX_RECONNECT) {
                reconnectAttempts++;
                setTimeout(connectToServer, 2000 * reconnectAttempts);
            }
        };
        
        socket.onerror = () => {};
    } catch (e) {
        updateStatus('error', 'error');
    }
}

function handleMessage(data) {
    switch (data.type) {
        case 'roomCreated':
            currentRoom = data.roomCode;
            elements.currentRoomCode.textContent = data.roomCode;
            showPanel('chat');
            addSystem('room: ' + data.roomCode);
            break;
        case 'roomJoined':
            currentRoom = data.roomCode;
            elements.currentRoomCode.textContent = data.roomCode;
            showPanel('chat');
            addSystem('joined');
            break;
        case 'roomLeft':
            currentRoom = null;
            showPanel('room');
            elements.messages.innerHTML = '';
            break;
        case 'chat':
            addChat(data.name, data.color, data.text, data.timestamp);
            break;
        case 'system':
            addSystem(data.message);
            break;
        case 'userList':
            updateUsers(data.users);
            break;
        case 'error':
            if (currentRoom) addSystem(data.message);
            else updateStatus(data.message, 'error');
            break;
    }
}

function send(type, data = {}) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type, ...data }));
    }
}

function createRoom() {
    if (!isConnected) return updateStatus('not connected', 'error');
    send('createRoom');
}

function joinRoom() {
    if (!isConnected) return updateStatus('not connected', 'error');
    const code = elements.roomCodeInput.value.trim().toUpperCase();
    if (code.length !== 6) return updateStatus('6 chars', 'error');
    send('joinRoom', { roomCode: code });
}

function leaveRoom() {
    send('leaveRoom');
    currentRoom = null;
    showPanel('room');
    elements.messages.innerHTML = '';
}

function copyCode() {
    if (currentRoom) navigator.clipboard.writeText(currentRoom);
}

function showPanel(p) {
    elements.roomPanel.classList.add('hidden');
    elements.settingsPanel.classList.add('hidden');
    elements.chatPanel.classList.add('hidden');
    if (p === 'room') elements.roomPanel.classList.remove('hidden');
    if (p === 'settings') elements.settingsPanel.classList.remove('hidden');
    if (p === 'chat') elements.chatPanel.classList.remove('hidden');
}

function updateStatus(t, c = '') {
    elements.roomStatus.textContent = t;
    elements.roomStatus.className = 'status-message ' + c;
}

function addChat(name, color, text, ts) {
    const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const el = document.createElement('div');
    el.className = 'message';
    el.innerHTML = `<span class="time">${time}</span><span class="sender" style="color:${esc(color)}">${esc(name)}</span>${esc(text)}`;
    elements.messages.appendChild(el);
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function addSystem(t) {
    const el = document.createElement('div');
    el.className = 'message system';
    el.textContent = t;
    elements.messages.appendChild(el);
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function updateUsers(users) {
    if (!users.length) {
        elements.userList.innerHTML = '<li class="no-users">empty</li>';
        return;
    }
    elements.userList.innerHTML = users.map(u => 
        `<li><span class="user-color-dot" style="background:${esc(u.color)}"></span>${esc(u.name)}</li>`
    ).join('');
}

function esc(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

// Events
elements.btnCreateRoom.addEventListener('click', createRoom);
elements.btnJoinRoom.addEventListener('click', joinRoom);
elements.roomCodeInput.addEventListener('keypress', e => e.key === 'Enter' && joinRoom());
elements.roomCodeInput.addEventListener('input', () => elements.roomCodeInput.value = elements.roomCodeInput.value.toUpperCase());
elements.btnCopyCode.addEventListener('click', copyCode);
elements.btnLeaveRoom.addEventListener('click', leaveRoom);

elements.btnSettings.addEventListener('click', () => {
    if (!currentRoom) return;
    showPanel(elements.settingsPanel.classList.contains('hidden') ? 'settings' : 'chat');
});

elements.btnMinimize.addEventListener('click', async () => {
    const m = await window.electronAPI.toggleMinimize();
    elements.btnMinimize.textContent = m ? '+' : '_';
});

elements.btnLock.addEventListener('click', async () => {
    isLocked = await window.electronAPI.toggleLock();
    elements.btnLock.textContent = isLocked ? '*' : 'o';
    elements.btnLock.classList.toggle('locked', isLocked);
});

elements.btnClose.addEventListener('click', () => {
    if (socket) socket.close();
    window.electronAPI.closeApp();
});

elements.btnSetName.addEventListener('click', () => {
    const n = elements.displayName.value.trim();
    if (n) { myName = n; send('setName', { name: n }); }
});

elements.displayName.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        const n = elements.displayName.value.trim();
        if (n) { myName = n; send('setName', { name: n }); }
    }
});

elements.btnSetColor.addEventListener('click', () => {
    myColor = elements.nameColor.value;
    send('setColor', { color: myColor });
});

elements.nameColor.addEventListener('change', () => {
    myColor = elements.nameColor.value;
    send('setColor', { color: myColor });
});

elements.btnCloseSettings.addEventListener('click', () => showPanel('chat'));

elements.btnSend.addEventListener('click', () => {
    const t = elements.messageInput.value.trim();
    if (t && isConnected && currentRoom) {
        send('chat', { text: t });
        elements.messageInput.value = '';
    }
});

elements.messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        const t = elements.messageInput.value.trim();
        if (t && isConnected && currentRoom) {
            send('chat', { text: t });
            elements.messageInput.value = '';
        }
    }
});

init();
