const express = require("express");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const PORT = 5000;
const SECRET = "social-circle-local-secret";
const FILE = path.join(__dirname, "data.json");

let db;
const save = () => fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
const uid = () => Math.random().toString(36).slice(2, 10);
const ago = (min) => Date.now() - min * 60000;

function seed() {
  const hash = bcrypt.hashSync("123456", 8);
  const mk = (id, name, username, email, bio, extra = {}) => ({
    id, name, username, email, password: hash, phone: "", dob: "", city: "Roorkee",
    bio, avatar: null, verified: false, followers: [], following: [],
    baseFollowers: 0, baseFollowing: 0, basePosts: 0, ...extra,
  });
  const users = [
    mk("u1", "Prateek Rai", "prateekrai2007", "prateekrai2007@gmail.com", "Learning | Building | Better Version of Me",
      { verified: true, baseFollowers: 512, baseFollowing: 187, basePosts: 18, headline: "B.Tech CSE | Roorkee" }),
    mk("u2", "Rohit Sharma", "rohit", "rohit@example.com", "Gym • Code • Chai", { baseFollowers: 234, baseFollowing: 89 }),
    mk("u3", "Aman Singh", "aman", "aman@example.com", "Assignments are due", { baseFollowers: 156, baseFollowing: 120 }),
    mk("u4", "Priya Sharma", "priya", "priya@example.com", "Photography 📸 | Wanderlust", { baseFollowers: 891, baseFollowing: 203, verified: true }),
    mk("u5", "Neha Yadav", "neha", "neha@example.com", "Notes queen 👑 | Study hard", { baseFollowers: 445, baseFollowing: 167 }),
    mk("u6", "Sagar Verma", "sagar", "sagar@example.com", "Class topper | DSA grind", { baseFollowers: 312, baseFollowing: 98 }),
    mk("u7", "Sneha Gupta", "sneha", "sneha@example.com", "Travel ✈️ | Food | Life", { baseFollowers: 678, baseFollowing: 234 }),
  ];
  const P = (caption, min, userId = "u1") => ({ id: uid(), userId, caption, image: null, likes: [], saves: [], comments: [], reactions: {}, createdAt: ago(min) });
  const posts = [
    { ...P("Good vibes only! 🌟 #college #friends #roorkee", 120), baseLikes: 47, baseComments: 12, baseShares: 5 },
    { ...P("Discipline\nBuilds\nFreedom 💪", 1500), baseLikes: 89, baseComments: 7 },
    { ...P("Mountains are calling 🏔️ #travel #nature", 3000), baseLikes: 134, baseComments: 23 },
    { ...P("Leg day done ✅ #gym #fitness", 4000), baseLikes: 56, baseComments: 4 },
    { ...P("Golden hour hits different 🌅 #photography", 5000), baseLikes: 201, baseComments: 31 },
    { ...P("New setup 🖥️ #tech #coding", 6000), baseLikes: 78, baseComments: 9 },
    { ...P("Coffee + Code = Life ☕ #developer #morning", 200, "u2"), baseLikes: 43, baseComments: 6 },
    { ...P("Captured this moment 📸 #photography #golden", 800, "u4"), baseLikes: 167, baseComments: 18 },
    { ...P("Study session 📚 #college #notes", 1200, "u5"), baseLikes: 34, baseComments: 5 },
    { ...P("Weekend vibes 🎉 #weekend #fun", 2400, "u7"), baseLikes: 92, baseComments: 14 },
  ];
  const M = (a, b, text, min) => ({ id: uid(), from: a, to: b, type: "text", text, createdAt: ago(min) });
  const messages = [
    M("u2", "u1", "Bro kal gym chale? 💪", 1),
    M("u1", "u2", "Haan bhai, 6 baje!", 0.5),
    M("u3", "u1", "Assignment submit kar diya?", 3),
    M("u4", "u1", "Haha nice picture! 👌", 1440),
    M("u5", "u1", "Notes bhej doge?", 1500),
    M("u6", "u1", "Class ka lecture mil gaya kya?", 4400),
  ];
  const stories = [
    { id: uid(), userId: "u2", text: "Gym time! 💪", bg: ["#1f3a5f", "#3b82f6"], createdAt: ago(60) },
    { id: uid(), userId: "u4", text: "Golden hour 🌅", bg: ["#5a3a1e", "#f59e0b"], createdAt: ago(120) },
    { id: uid(), userId: "u7", text: "Weekend vibes ✨", bg: ["#5b2a4e", "#ec4899"], createdAt: ago(180) },
    { id: uid(), userId: "u5", text: "Study mode on 📚", bg: ["#1e4b45", "#14b8a6"], createdAt: ago(240) },
  ];
  return { users, posts, messages, notifications: [], unread: { u2: 2, u3: 1 }, stories };
}

db = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : seed();
if (!db.unread) db.unread = {};
if (!db.stories) db.stories = [];
db.posts.forEach((p) => { if (!p.reactions) p.reactions = {}; if (!p.comments) p.comments = []; });
save();

const pub = (u) => u && ({
  id: u.id, name: u.name, username: u.username, bio: u.bio, avatar: u.avatar, verified: u.verified,
  headline: u.headline || u.city || "", city: u.city,
  postsCount: db.posts.filter((p) => p.userId === u.id).length + (u.basePosts || 0),
  followersCount: u.followers.length + (u.baseFollowers || 0),
  followingCount: u.following.length + (u.baseFollowing || 0),
});
const fmtPost = (p, me) => ({
  ...p,
  user: pub(db.users.find((u) => u.id === p.userId)),
  likesCount: p.likes.length + (p.baseLikes || 0),
  commentsCount: p.comments.length + (p.baseComments || 0),
  sharesCount: p.baseShares || 0,
  liked: p.likes.includes(me),
  saved: p.saves.includes(me),
  myReaction: p.reactions[me] || null,
});
const auth = (req, res, next) => {
  try { req.uid = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), SECRET).id; next(); }
  catch { res.status(401).json({ error: "Please log in again" }); }
};
const token = (u) => jwt.sign({ id: u.id }, SECRET, { expiresIn: "30d" });

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Auth
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password, dob, city } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: "This email is already registered" });
  const u = {
    id: uid(), name, email, phone, dob, city, username: email.split("@")[0].toLowerCase(),
    password: bcrypt.hashSync(password, 8), bio: "New on Social Circle 🌟", avatar: null, verified: false,
    followers: [], following: [], baseFollowers: 0, baseFollowing: 0, basePosts: 0,
  };
  db.users.push(u); save();
  res.json({ token: token(u), user: pub(u) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const u = db.users.find((x) => x.email.toLowerCase() === (email || "").toLowerCase());
  if (!u || !bcrypt.compareSync(password || "", u.password)) return res.status(401).json({ error: "Wrong email or password" });
  res.json({ token: token(u), user: pub(u) });
});

app.get("/api/me", auth, (req, res) => res.json(pub(db.users.find((u) => u.id === req.uid))));

app.put("/api/me", auth, (req, res) => {
  const u = db.users.find((x) => x.id === req.uid);
  ["name", "bio", "avatar", "headline", "city", "phone"].forEach((k) => req.body[k] !== undefined && (u[k] = req.body[k]));
  save(); res.json(pub(u));
});

// Stories (24h)
app.get("/api/stories", auth, (req, res) => {
  const cutoff = Date.now() - 86400000;
  db.stories = db.stories.filter((s) => s.createdAt > cutoff);
  save();
  const result = db.users.map((u) => ({
    ...pub(u),
    stories: db.stories.filter((s) => s.userId === u.id),
    hasStory: db.stories.some((s) => s.userId === u.id),
  }));
  res.json(result);
});

app.post("/api/stories", auth, (req, res) => {
  const { text, bg, image } = req.body;
  const s = { id: uid(), userId: req.uid, text: text || "", bg: bg || ["#3b2a7a", "#7c3aed"], image: image || null, createdAt: Date.now() };
  db.stories.push(s); save();
  res.json(s);
});

// Feed
app.get("/api/feed", auth, (req, res) =>
  res.json(db.posts.slice().sort((a, b) => b.createdAt - a.createdAt).map((p) => fmtPost(p, req.uid))));

// Explore
app.get("/api/explore", auth, (req, res) => {
  const posts = db.posts.slice().sort((a, b) => (b.likes.length + (b.baseLikes || 0)) - (a.likes.length + (a.baseLikes || 0)));
  res.json(posts.map((p) => fmtPost(p, req.uid)));
});

// Search
app.get("/api/search", auth, (req, res) => {
  const q = (req.query.q || "").toLowerCase().trim();
  if (!q) return res.json({ users: [], posts: [] });
  const users = db.users.filter((u) => u.id !== req.uid && (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))).map(pub);
  const posts = db.posts.filter((p) => p.caption.toLowerCase().includes(q)).map((p) => fmtPost(p, req.uid));
  res.json({ users, posts });
});

// Suggestions
app.get("/api/suggestions", auth, (req, res) => {
  const me = db.users.find((u) => u.id === req.uid);
  const suggestions = db.users
    .filter((u) => u.id !== req.uid && !me.following.includes(u.id))
    .sort((a, b) => (b.baseFollowers + b.followers.length) - (a.baseFollowers + a.followers.length))
    .slice(0, 5)
    .map(pub);
  res.json(suggestions);
});

// Posts
app.post("/api/posts", auth, (req, res) => {
  const { caption, image } = req.body;
  if (!caption && !image) return res.status(400).json({ error: "Add a caption or a photo" });
  const p = { id: uid(), userId: req.uid, caption: caption || "", image: image || null, likes: [], saves: [], comments: [], reactions: {}, createdAt: Date.now() };
  db.posts.push(p); save(); res.json(fmtPost(p, req.uid));
});

app.delete("/api/posts/:id", auth, (req, res) => {
  const idx = db.posts.findIndex((p) => p.id === req.params.id && p.userId === req.uid);
  if (idx === -1) return res.sendStatus(403);
  db.posts.splice(idx, 1); save(); res.json({ ok: true });
});

app.post("/api/posts/:id/like", auth, (req, res) => {
  const p = db.posts.find((x) => x.id === req.params.id);
  if (!p) return res.sendStatus(404);
  const i = p.likes.indexOf(req.uid);
  if (i >= 0) p.likes.splice(i, 1);
  else {
    p.likes.push(req.uid);
    if (p.userId !== req.uid) db.notifications.push({ id: uid(), to: p.userId, from: req.uid, type: "like", text: "liked your post", createdAt: Date.now() });
  }
  save(); res.json(fmtPost(p, req.uid));
});

app.post("/api/posts/:id/save", auth, (req, res) => {
  const p = db.posts.find((x) => x.id === req.params.id);
  if (!p) return res.sendStatus(404);
  const i = p.saves.indexOf(req.uid);
  i >= 0 ? p.saves.splice(i, 1) : p.saves.push(req.uid);
  save(); res.json(fmtPost(p, req.uid));
});

app.post("/api/posts/:id/react", auth, (req, res) => {
  const p = db.posts.find((x) => x.id === req.params.id);
  if (!p) return res.sendStatus(404);
  const { emoji } = req.body;
  if (p.reactions[req.uid] === emoji) delete p.reactions[req.uid];
  else p.reactions[req.uid] = emoji;
  save(); res.json(fmtPost(p, req.uid));
});

// Comments
app.get("/api/posts/:id/comments", auth, (req, res) => {
  const p = db.posts.find((x) => x.id === req.params.id);
  if (!p) return res.sendStatus(404);
  res.json(p.comments.map((c) => ({ ...c, user: pub(db.users.find((u) => u.id === c.userId)) })));
});

app.post("/api/posts/:id/comments", auth, (req, res) => {
  const p = db.posts.find((x) => x.id === req.params.id);
  if (!p) return res.sendStatus(404);
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "Comment cannot be empty" });
  const c = { id: uid(), userId: req.uid, text: text.trim(), createdAt: Date.now() };
  p.comments.push(c);
  if (p.userId !== req.uid) db.notifications.push({ id: uid(), to: p.userId, from: req.uid, type: "comment", text: "commented on your post", createdAt: Date.now() });
  save();
  res.json({ ...c, user: pub(db.users.find((u) => u.id === req.uid)) });
});

app.delete("/api/posts/:id/comments/:cid", auth, (req, res) => {
  const p = db.posts.find((x) => x.id === req.params.id);
  if (!p) return res.sendStatus(404);
  const idx = p.comments.findIndex((c) => c.id === req.params.cid && c.userId === req.uid);
  if (idx === -1) return res.sendStatus(403);
  p.comments.splice(idx, 1); save(); res.json({ ok: true });
});

// Users
app.get("/api/users/:id", auth, (req, res) => {
  const u = db.users.find((x) => x.id === req.params.id);
  if (!u) return res.sendStatus(404);
  const posts = db.posts.filter((p) => p.userId === u.id).sort((a, b) => b.createdAt - a.createdAt).map((p) => fmtPost(p, req.uid));
  const saved = u.id === req.uid ? db.posts.filter((p) => p.saves.includes(u.id)).map((p) => fmtPost(p, req.uid)) : [];
  const followers = u.followers.map((id) => pub(db.users.find((x) => x.id === id))).filter(Boolean);
  const following = u.following.map((id) => pub(db.users.find((x) => x.id === id))).filter(Boolean);
  res.json({ user: pub(u), posts, saved, isFollowing: u.followers.includes(req.uid), followers, following });
});

app.post("/api/users/:id/follow", auth, (req, res) => {
  const t = db.users.find((x) => x.id === req.params.id), me = db.users.find((x) => x.id === req.uid);
  if (!t || t.id === me.id) return res.sendStatus(400);
  if (t.followers.includes(me.id)) {
    t.followers = t.followers.filter((i) => i !== me.id);
    me.following = me.following.filter((i) => i !== t.id);
  } else {
    t.followers.push(me.id); me.following.push(t.id);
    db.notifications.push({ id: uid(), to: t.id, from: me.id, type: "follow", text: "started following you", createdAt: Date.now() });
  }
  save(); res.json({ isFollowing: t.followers.includes(me.id), user: pub(t) });
});

app.get("/api/users", auth, (req, res) => res.json(db.users.filter((u) => u.id !== req.uid).map(pub)));

// Notifications
app.get("/api/notifications", auth, (req, res) =>
  res.json(db.notifications.filter((n) => n.to === req.uid).sort((a, b) => b.createdAt - a.createdAt)
    .map((n) => ({ ...n, user: pub(db.users.find((u) => u.id === n.from)) }))));

app.post("/api/notifications/read", auth, (req, res) => {
  db.notifications.filter((n) => n.to === req.uid).forEach((n) => (n.read = true));
  save(); res.json({ ok: true });
});

// Messages
app.get("/api/conversations", auth, (req, res) => {
  const map = new Map();
  db.messages.filter((m) => m.from === req.uid || m.to === req.uid)
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((m) => map.set(m.from === req.uid ? m.to : m.from, m));
  const list = [...map.entries()].map(([id, last]) => ({
    user: pub(db.users.find((u) => u.id === id)),
    last: last.type === "file" ? `📎 ${last.fileName}` : last.text,
    at: last.createdAt,
    unread: db.unread[`${req.uid}_${id}`] || 0,
  })).sort((a, b) => b.at - a.at);
  res.json(list);
});

app.get("/api/messages/:userId", auth, (req, res) => {
  delete db.unread[`${req.uid}_${req.params.userId}`]; save();
  res.json(db.messages.filter((m) => (m.from === req.uid && m.to === req.params.userId) || (m.from === req.params.userId && m.to === req.uid))
    .sort((a, b) => a.createdAt - b.createdAt));
});

// Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const online = new Set();

io.use((socket, next) => {
  try { socket.uid = jwt.verify(socket.handshake.auth.token, SECRET).id; next(); }
  catch { next(new Error("unauthorized")); }
});

io.on("connection", (socket) => {
  socket.join(socket.uid);
  online.add(socket.uid);
  io.emit("online", [...online]);

  socket.on("send", (data, ack) => {
    if (!data.to || (!data.text && data.type !== "file")) {
      ack && ack(null);
      return;
    }
    const m = {
      id: uid(), from: socket.uid, to: data.to, type: data.type || "text", text: data.text || "",
      fileName: data.fileName, fileSize: data.fileSize, createdAt: Date.now(),
    };
    db.messages.push(m); save();
    // Track unread for recipient
    const key = `${m.to}_${m.from}`;
    db.unread[key] = (db.unread[key] || 0) + 1;
    save();
    // Emit to both rooms so sender sees it too
    io.to(m.to).emit("message", m);
    io.to(m.from).emit("message", m);
    ack && ack(m);
  });

  socket.on("typing", (to) => io.to(to).emit("typing", { from: socket.uid }));
  socket.on("stopTyping", (to) => io.to(to).emit("stopTyping", { from: socket.uid }));

  socket.on("disconnect", () => {
    online.delete(socket.uid);
    io.emit("online", [...online]);
  });
});

server.listen(PORT, () => console.log(`Social Circle API running on http://localhost:${PORT}`));
