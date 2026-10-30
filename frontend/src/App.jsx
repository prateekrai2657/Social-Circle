import React, { useEffect, useState } from "react";
import { api, connectSocket, getSocket } from "./api";
import { Phone, Status, BottomNav } from "./components/Shared";
import { Login, Register } from "./components/Auth";
import { Feed, Create } from "./components/Feed";
import { Explore, Search, Notifications } from "./components/Explore";
import { Profile } from "./components/Profile";
import { Messages, Chat } from "./components/Messages";

export default function App() {
  const [me, setMe] = useState(()=>JSON.parse(localStorage.getItem("sc_user")||"null"));
  const [screen, setScreen] = useState(me?"feed":"login");
  const [profileId, setProfileId] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const [unread, setUnread] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const onAuth = ({token,user}) => {
    localStorage.setItem("sc_token",token);
    localStorage.setItem("sc_user",JSON.stringify(user));
    setMe(user); setScreen("feed");
  };

  const logout = () => {
    localStorage.removeItem("sc_token");
    localStorage.removeItem("sc_user");
    getSocket()?.disconnect();
    setMe(null); setProfileId(null); setChatWith(null); setScreen("login");
  };

  useEffect(()=>{
    if(!me) return;
    const s = connectSocket();
    s.on("online", users => setOnlineUsers(users));
    api("/me").then(u=>{ setMe(u); localStorage.setItem("sc_user",JSON.stringify(u)); }).catch(logout);
    return ()=>s.disconnect();
  },[me?.id]);

  useEffect(()=>{
    if(!me) return;
    api("/conversations").then(l=>setUnread(l.reduce((a,c)=>a+c.unread,0))).catch(()=>{});
    api("/notifications").then(l=>setNotifCount(l.filter(n=>!n.read).length)).catch(()=>{});
  },[screen,me?.id]);

  const go = s => {
    setChatWith(null);
    if(s==="profile") setProfileId(me.id);
    setScreen(s);
  };
  const openProfile = id => { setProfileId(id); setScreen("profile"); };
  const openChat = u => { setChatWith(u); setScreen("chat"); };

  if(!me) return (
    <Phone>
      {screen==="register"
        ? <Register onAuth={onAuth} go={setScreen}/>
        : <Login onAuth={onAuth} go={setScreen}/>
      }
    </Phone>
  );

  const navTab = screen==="chat"?"messages"
    : screen==="profile"&&profileId!==me.id?"feed"
    : screen==="search"?"explore"
    : screen;

  const showNav = screen!=="chat";

  return (
    <Phone>
      <div className={`screen app${screen==="profile"?" gradtop":""}`}>
        <Status/>
        {screen==="feed"    && <Feed me={me} openProfile={openProfile} go={go}/>}
        {screen==="explore" && <Explore openProfile={openProfile}/>}
        {screen==="search"  && <Search openProfile={openProfile}/>}
        {screen==="create"  && <Create me={me} go={go}/>}
        {screen==="notifications" && <Notifications onRead={()=>setNotifCount(0)}/>}
        {screen==="profile" && (
          <Profile key={profileId} id={profileId} me={me} setMe={u=>{setMe(u);localStorage.setItem("sc_user",JSON.stringify(u));}}
            logout={logout} back={()=>go("feed")} openChat={openChat} openProfile={openProfile}/>
        )}
        {screen==="messages" && <Messages me={me} openChat={openChat}/>}
        {screen==="chat" && chatWith && <Chat me={me} other={chatWith} back={()=>go("messages")} onlineUsers={onlineUsers}/>}
        {showNav && (
          <BottomNav tab={navTab} go={go} unread={unread} notifCount={notifCount}/>
        )}
      </div>
    </Phone>
  );
}
