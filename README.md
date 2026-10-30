# Social Circle 🌐

A full-stack social media app built with **React + Node.js + Socket.io** — runs entirely on localhost, no database required.

![Social Circle](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Node](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat&logo=socket.io)

---
<img width="1920" height="1080" alt="Screenshot (190)" src="https://github.com/user-attachments/assets/6f1c5ad9-2d22-46d1-930c-c85d700ca8ec" />
<img width="1920" height="1080" alt="Screenshot (191)" src="https://github.com/user-attachments/assets/8a8ad5a3-375e-4eda-865d-bfdfb92585fe" />
<img width="1920" height="1080" alt="Screenshot (192)" src="https://github.com/user-attachments/assets/5707bd82-1f1f-4832-9087-f0f742b56126" />


## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | Register / Login with JWT, bcrypt password hashing |
| 📸 Posts | Create posts with photo + caption, hashtag highlighting |
| ❤️ Reactions | Like posts + 6 emoji reactions (❤️ 🔥 😂 😮 😢 👏) |
| 💬 Comments | Add / delete comments on any post in a bottom sheet |
| 🗑️ Delete posts | Post authors can delete their own posts |
| 📖 Stories | 24-hour stories with gradient backgrounds + full-screen viewer |
| 🔍 Search | Search users and posts in real-time |
| 🧭 Explore | Discover trending posts in a masonry grid |
| 👥 Suggestions | "Who to follow" suggestions based on popularity |
| 👤 Profile | Avatar upload, edit name/bio/headline/city via modal |
| 👥 Followers | View followers & following lists from profile stats |
| 💌 Messages | Real-time chat via Socket.io with typing indicator |
| 📎 File sharing | Send file attachments in chat |
| 🟢 Online status | See who's online in chat |
| 🔔 Notifications | Like, comment, follow notifications with badge count |
| 💾 Bookmarks | Save / unsave posts, view saved tab on profile |
| 📱 Mobile UI | iPhone-style phone frame, dark theme, gradient accents |

---

## 🚀 Quick Start

### 1. Backend (port 5000)
```bash
cd backend
npm install
npm start
```

### 2. Frontend (port 5173) — new terminal
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Demo Accounts

| Email | Password | Notes |
|---|---|---|
| prateekrai2007@gmail.com | 123456 | Verified account |
| rohit@example.com | 123456 | |
| priya@example.com | 123456 | Verified account |
| neha@example.com | 123456 | |

Open a second incognito window and log in as another user to test real-time chat!

---

## 🗂️ Project Structure

```
social-circle/
├── backend/
│   ├── server.js        # Express API + Socket.io
│   └── data.json        # JSON file database (auto-created)
└── frontend/
    └── src/
        ├── App.jsx                    # App shell & routing
        ├── api.js                     # Fetch + Socket helpers
        ├── styles.css                 # All styles
        └── components/
            ├── Shared.jsx             # Icons, Avatar, BottomNav
            ├── Auth.jsx               # Login, Register
            ├── Feed.jsx               # Feed, PostCard, Stories, Create
            ├── Explore.jsx            # Explore, Search, Notifications
            ├── Profile.jsx            # Profile, EditModal, FollowList
            └── Messages.jsx           # Messages list, Chat
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Socket.io-client
- **Backend:** Node.js, Express, Socket.io, bcryptjs, jsonwebtoken
- **Storage:** JSON file (no DB install needed)
- **Styling:** Pure CSS with CSS variables, glassmorphism, gradients

---

## 📝 Notes

- Data is saved in `backend/data.json` — delete it to reset to seed data
- Images are stored as base64 in the JSON file (resized to keep it small)
- Stories expire after 24 hours automatically
