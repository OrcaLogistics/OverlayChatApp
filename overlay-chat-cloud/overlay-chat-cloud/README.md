# 💬 Overlay Chat

A lightweight, always-on-top chat overlay for gamers. No account needed, no data stored, just simple group chat with your friends.

![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Mac%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <img src="docs/screenshot.png" alt="Overlay Chat Screenshot" width="350">
</p>

## ✨ Features

- 🎮 **Always-On-Top** - Stays visible over games (borderless windowed mode)
- 🔑 **Room Codes** - Create private rooms, share the 6-character code with friends
- 👤 **Custom Names** - Pick any display name (great for roleplay!)
- 🎨 **Name Colors** - Choose your own color
- 🔒 **Lock Position** - Prevent accidental dragging
- 👻 **Adjustable Opacity** - Make it as transparent as you want
- ⌨️ **Quick Toggle** - `Ctrl+Shift+O` to hide/show instantly
- 🚫 **No Data Storage** - Messages disappear when you leave

---

## 🚀 Quick Start (Users)

### Download & Run

1. Download the latest release from [Releases](../../releases)
2. Extract and run `Overlay Chat.exe`
3. Create a room or enter a friend's room code
4. Chat!

### Controls

| Key/Button | Action |
|------------|--------|
| `Ctrl+Shift+O` | Toggle visibility |
| ⚙️ | Open settings |
| 📋 | Copy room code |
| 🚪 | Leave room |
| 🔓/🔒 | Lock/unlock position |

---

## 🛠️ Self-Hosting Guide

Want to run your own server? Here's how:

### Option 1: Deploy to Render (Free, Recommended)

1. Fork this repository
2. Go to [render.com](https://render.com) and sign up
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub and select your forked repo
5. Configure:
   - **Name**: `overlay-chat` (or whatever you want)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. Copy your URL (e.g., `overlay-chat-xxxx.onrender.com`)

### Option 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your forked repo
4. Set **Root Directory** to `server`
5. Deploy and copy your URL

### Option 3: Deploy to Fly.io

```bash
cd server
fly launch
fly deploy
```

### Update the Client

After deploying, update `client/config.js`:

```javascript
SERVER_URL: 'wss://your-app-name.onrender.com'
```

Note: Use `wss://` for HTTPS servers, `ws://` for local/HTTP.

---

## 🏗️ Building the Client

### Prerequisites

- Node.js 18+
- npm

### Development

```bash
cd client
npm install
npm start
```

### Build Executable

```bash
cd client
npm run build:win    # Windows
npm run build:all    # All platforms
```

Executables will be in `client/dist/`

---

## 📁 Project Structure

```
overlay-chat/
├── server/
│   ├── package.json
│   └── index.js          # WebSocket server with room support
│
├── client/
│   ├── package.json
│   ├── config.js         # ⬅️ Set your server URL here!
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

## 🔧 Configuration

### Server Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |

### Client Config (`client/config.js`)

```javascript
module.exports = {
    SERVER_URL: 'wss://your-server.com',  // Your deployed server
    APP_NAME: 'Overlay Chat',
    VERSION: '2.0.0'
};
```

---

## 🎮 Game Compatibility

The overlay works with games in **Borderless Windowed** mode. Most games have this option in Display/Video settings.

### Tested Games
- League of Legends ✅
- Valorant ✅
- Minecraft ✅
- Among Us ✅
- Most Unity/Unreal games ✅

### Known Issues
- Exclusive Fullscreen games may hide the overlay
- Some anti-cheat software may flag overlays (rare)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

---

## 📜 License

MIT License - do whatever you want with it!

---

## 💡 Ideas for Contributors

- [ ] Sound notifications
- [ ] Emoji picker
- [ ] Image sharing
- [ ] Voice chat integration
- [ ] Multiple themes
- [ ] End-to-end encryption
- [ ] Mobile companion app

---

## ❓ FAQ

**Q: Is this free?**
A: Yes, completely free and open source.

**Q: Do I need an account?**
A: No accounts needed. Just pick a name and go.

**Q: Are messages saved?**
A: No. Messages only exist while the room is active.

**Q: Can I use this commercially?**
A: Yes, MIT license allows commercial use.

**Q: Why not just use Discord?**
A: Discord's overlay is heavy and requires an account. This is lightweight and instant.

---

Made with ❤️ for gamers who just want to chat
