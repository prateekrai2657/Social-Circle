import React, { useEffect, useRef, useState } from "react";
import { api, clock, listTime, getSocket } from "../api";
import { Avatar, Icon } from "./Shared";

const QUICK_EMOJIS = ["👍","❤️","😂","🔥","😮","🙏"];

export function Messages({ me, openChat }) {
  const [list, setList] = useState([]);
  const [people, setPeople] = useState(null);
  const [search, setSearch] = useState("");

  const load = () => api("/conversations").then(setList).catch(()=>{});

  useEffect(()=>{
    load();
    const s = getSocket();
    s?.on("message", load);
    return ()=>s?.off("message", load);
  },[]);

  const compose = async () => setPeople(people ? null : await api("/users"));
  const filtered = list.filter(c => c.user?.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="scroll">
      <div className="topbar">
        <h2>Messages</h2>
        <span onClick={compose} style={{cursor:"pointer",lineHeight:0}}><Icon n="edit" size={21}/></span>
      </div>

      <div className="search-bar" style={{margin:"0 16px 12px"}}>
        <Icon n="search" size={18} color="#a1a1b5"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations…"/>
        {search && <span onClick={()=>setSearch("")} style={{cursor:"pointer",lineHeight:0}}><Icon n="x" size={16} color="#a1a1b5"/></span>}
      </div>

      {people && (
        <div className="newchat">
          <small>Start a new chat</small>
          {people.map(u=>(
            <div className="row" key={u.id} onClick={()=>{ setPeople(null); openChat(u); }}>
              <Avatar user={u} size={36}/>
              <div className="mid"><b>{u.name}</b><small>@{u.username}</small></div>
            </div>
          ))}
        </div>
      )}

      {filtered.length===0 && !people && (
        <p className="empty">No conversations yet.<br/>Tap the pencil icon to start chatting!</p>
      )}

      {filtered.map(c=>(
        <div className="row conv" key={c.user.id} onClick={()=>openChat(c.user)}>
          <Avatar user={c.user} size={46}/>
          <div className="mid">
            <b>{c.user.name}</b>
            <small>{c.last}</small>
          </div>
          <div className="right">
            <span className="time">{listTime(c.at)}</span>
            {c.unread>0 && <i className="unread">{c.unread}</i>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Chat({ me, other, back, onlineUsers }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const end = useRef();
  const fileRef = useRef();
  const typingTimer = useRef();
  const inputRef = useRef();
  const isOnline = onlineUsers?.includes(other.id);

  useEffect(()=>{
    // Load history from REST
    api(`/messages/${other.id}`).then(setMsgs).catch(()=>{});

    const s = getSocket();
    if(!s) return;

    const onMsg = m => {
      if(m.from===other.id || m.to===other.id) {
        setMsgs(prev => prev.some(x=>x.id===m.id) ? prev : [...prev, m]);
      }
    };

    const onTyping = ({from}) => {
      if(from!==other.id) return;
      setIsTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(()=>setIsTyping(false), 2500);
    };

    const onStopTyping = ({from}) => {
      if(from===other.id) { clearTimeout(typingTimer.current); setIsTyping(false); }
    };

    s.on("message", onMsg);
    s.on("typing", onTyping);
    s.on("stopTyping", onStopTyping);

    return ()=>{
      s.off("message", onMsg);
      s.off("typing", onTyping);
      s.off("stopTyping", onStopTyping);
      clearTimeout(typingTimer.current);
    };
  },[other.id]);

  useEffect(()=>{
    end.current?.scrollIntoView({behavior:"smooth"});
  },[msgs]);

  const handleInput = e => {
    setText(e.target.value);
    const s = getSocket();
    if(s) {
      s.emit("typing", other.id);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(()=>s.emit("stopTyping", other.id), 1500);
    }
  };

  const send = e => {
    e?.preventDefault();
    const trimmed = text.trim();
    if(!trimmed || sending) return;

    const s = getSocket();
    if(!s || !s.connected) {
      alert("Not connected. Please refresh the page.");
      return;
    }

    // Optimistic message shown immediately
    const optimistic = {
      id: `opt_${Date.now()}`,
      from: me.id,
      to: other.id,
      type: "text",
      text: trimmed,
      createdAt: Date.now(),
      pending: true,
    };
    setMsgs(prev=>[...prev, optimistic]);
    setText("");
    setShowEmoji(false);
    setSending(true);

    s.emit("send", { to: other.id, text: trimmed }, (confirmed) => {
      // Replace optimistic with confirmed message from server
      setMsgs(prev => prev.map(m => m.id===optimistic.id ? {...confirmed, pending:false} : m));
      setSending(false);
    });

    inputRef.current?.focus();
  };

  const attach = e => {
    const f = e.target.files[0];
    if(!f) return;
    const s = getSocket();
    if(!s || !s.connected) return;
    s.emit("send", {
      to: other.id,
      type: "file",
      fileName: f.name,
      fileSize: `${(f.size/1048576).toFixed(1)} MB`,
    }, confirmed => {
      if(confirmed) setMsgs(prev=>[...prev, confirmed]);
    });
    e.target.value = "";
  };

  const handleKeyDown = e => {
    if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  let lastDate = null;

  return (
    <div className="chat">
      <div className="chead">
        <span onClick={back} style={{cursor:"pointer"}}><Icon n="back" size={22}/></span>
        <Avatar user={other} size={38}/>
        <div className="mid">
          <b>{other.name}</b>
          {isTyping
            ? <small className="typing-ind">typing…</small>
            : <small className={isOnline?"online":"offline"}>{isOnline?"● Online":"● Offline"}</small>
          }
        </div>
        <Icon n="dotsH" color="#cfcfe0"/>
      </div>

      <div className="msgs">
        {msgs.map(m=>{
          const mineMsg = m.from===me.id;
          const d = new Date(m.createdAt).toDateString();
          const showDate = d!==lastDate;
          lastDate = d;
          return (
            <React.Fragment key={m.id}>
              {showDate && (
                <div className="date-div">
                  <span>{new Date(m.createdAt).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
                </div>
              )}
              <div className={`msg ${mineMsg?"out":"in"}`} style={{opacity:m.pending?0.6:1}}>
                {!mineMsg && <Avatar user={other} size={28} style={{alignSelf:"flex-end"}}/>}
                <div className="mcol">
                  {m.type==="file" ? (
                    <div className="bubble file">
                      <span className="fico"><Icon n="file" size={18} color="#fff"/></span>
                      <div><b>{m.fileName}</b><small>{m.fileSize}</small></div>
                      <Icon n="download" size={17}/>
                    </div>
                  ) : (
                    <div className="bubble">{m.text}</div>
                  )}
                  <small className="mtime">
                    {clock(m.createdAt)}
                    {mineMsg && <span className="ticks">{m.pending?" ○○":" ✓✓"}</span>}
                  </small>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={end}/>
      </div>

      {showEmoji && (
        <div className="emoji-row">
          {QUICK_EMOJIS.map(e=>(
            <span key={e} onClick={()=>setText(t=>t+e)} style={{fontSize:22,cursor:"pointer"}}>{e}</span>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={send}>
        <div className="pill">
          <span onClick={()=>setShowEmoji(!showEmoji)} style={{cursor:"pointer",lineHeight:0}}>
            <Icon n="smile" size={20} color={showEmoji?"#8b5cf6":"#cfcfe0"}/>
          </span>
          <input
            ref={inputRef}
            placeholder="Type a message…"
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
          <span onClick={()=>fileRef.current.click()} style={{cursor:"pointer",lineHeight:0}}>
            <Icon n="clip" size={19} color="#cfcfe0"/>
          </span>
          <input ref={fileRef} type="file" hidden onChange={attach}/>
        </div>
        <button className="sendbtn" type="submit" disabled={!text.trim()}>
          <Icon n="send" size={20} color="#fff" fill/>
        </button>
      </form>
    </div>
  );
}
