# Social Circle 🌐

A full-stack social media app built with **React + Node.js + Socket.io** — runs entirely on localhost, no database required.

![Social Circle](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Node](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js) ![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat&logo=socket.io)

---
<img width="1223" height="786" alt="social_circle-3" src="https://github.com/user-attachments/assets/d0c1a14e-4c9d-4310-b369-5d0344c6ce46" />
<img width="1197" height="786" alt="social_circle-2" src="https://github.com/user-attachments/assets/72b916d1-e250-494c-9eaa-72e06a590c7c" />
<img width="1277" height="795" alt="social-circle-1" src="https://github.com/user-attachments/assets/3a70471d-c60f-495d-8616-87b1e8fb7bad" />





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
