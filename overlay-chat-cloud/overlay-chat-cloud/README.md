Overlay Chat

A lightweight, always-on-top chat overlay for gamers. No account needed, no data stored, just simple group chat with your friends.

Features
- Stays visible over games (borderless windowed mode)
- Create private rooms, share the 6-character code with friends
- Pick any display name (great for roleplay!)
- Choose your own color
- Prevent accidental dragging
- Make it as transparent as you want
- `Ctrl+Shift+O` to hide/show instantly
- Messages disappear when you leave

---------------------------------------------------------------------

Quick Start (Users)

Download & Run

1. Download the latest release
2. Extract and run `Overlay Chat.exe`
3. Create a room or enter a friend's room code
4. Chat

Controls

| Key/Button | Action |
|------------|--------|
| "Ctrl+Shift+O" | Toggle visibility |
| ⚙️ | Settings |
| 📋 | Copy room code |
| 🚪 | Leave room |
| 🔓/🔒 | Lock/unlock position |

---------------------------------------------------------------------

Self-Hosting Guide

For the brave and worthy who want to self-host

 Option one: Deploy to Render

1. Fork this repo
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" --> "Web Service"
4. Connect your GitHub and select your forked repo
5. Configure:
   - Name it whatever you want
   - Root Directory: server
   - Runtime: Node
   - Build Command: npm install
   - Start Command: npm start
6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Copy your URL (e.g., `overlay-chat-xxxx.onrender.com`)

Option Two: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click New Project --> "Deploy from GitHub repo"
3. Select your forked repo
4. Set Root Directory to "server"
5. Deploy and copy your URL

Option 3 is Fly.io

```bash
cd server
fly launch
fly deploy
```

Update the Client

After deploying, update `client/config.js`:

```javascript
SERVER_URL: 'wss://your-app-name.onrender.com'
```

Note: Use `wss://` for HTTPS servers, `ws://` for local/HTTP.

---------------------------------------------------------------------
Building the Client

Prerequisites

- Node.js 18+
- npm

Development

```bash
cd client
npm install
npm start
```

Build Executable

```bash
cd client
npm run build:win    # Windows
npm run build:all    # All platforms
```

Executables will be in `client/dist/`

---

Project Structure

```
overlay-chat/
├── server/
│   ├── package.json
│   └── index.js          # WebSocket server with room support
│
├── client/
│   ├── package.json
│   ├── config.js         # This is where Server Url is set.
│   ├── main.js           # Electron main process
│   ├── preload.js
│   └── src/
│       ├── index.html
│       ├── styles.css
│       └── renderer.js
│
└── README.md
```

---

Configuration

Server Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |

Client Config (`client/config.js`)

```javascript
module.exports = {
    SERVER_URL: 'wss://your-server.com',  // Your deployed server
    APP_NAME: 'Overlay Chat',
    VERSION: '2.0.0'
};
```

---------------------------------------------------------------------

Game Compatibility

Works best with borderless windowed mode.
Tested on popular games like Roblox, Minecraft, Elden ring, AC6, etc.
I am yet to find out if the anticheat software flags it. It should not.

---------------------------------------------------------------------

Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

---------------------------------------------------------------------

License

MIT License - do whatever you want with it.

---------------------------------------------------------------------
FAQ

Q: Is this free?
A: Yes, completely free and open source.

Q: Do I need an account?
A: No accounts needed. Just pick a name and go.

Q: Are messages saved?
A: No. Messages only exist while the room is active.

Q: Can I use this commercially?
A: Yes, MIT license allows commercial use.

Q: Why not just use Discord?
A: Discord's overlay is heavy and requires an account. This is lightweight and far more specialised

Q: Did you make this for Roblox following the chat ban?
A: Noooooo...Why would you say that? Using this app to chat in roblox would be breach of TOS. Do NOT use it for this purpose.

---------------------------------------------------------------------
