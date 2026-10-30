import React, { useEffect, useState } from "react";
import { api, timeAgo } from "../api";
import { Avatar, Icon, tint } from "./Shared";

export function Explore({ openProfile }) {
  const [posts, setPosts] = useState([]);
  useEffect(()=>{ api("/explore").then(setPosts); },[]);

  return (
    <div className="scroll">
      <div className="topbar"><h2>Explore</h2></div>
      <div className="explore-grid">
        {posts.map((p,i)=>{
          const [a,b] = tint(p.id);
          const big = i%7===0;
          return (
            <div key={p.id} className="explore-tile" style={big?{gridColumn:"span 2"}:{}}>
              {p.image
                ? <img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div className="etile-bg" style={{background:`linear-gradient(135deg,${a},${b})`}}>{p.caption.slice(0,30)}</div>
              }
              <div className="etile-overlay">
                <span><Icon n="heart" size={12} fill color="#fff"/> {p.likesCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Search({ openProfile }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(()=>{ api("/suggestions").then(setSuggestions); },[]);

  useEffect(()=>{
    if(!q.trim()){ setResults(null); return; }
    const t = setTimeout(()=>api(`/search?q=${encodeURIComponent(q)}`).then(setResults),300);
    return ()=>clearTimeout(t);
  },[q]);

  const follow = async (id) => {
    await api(`/users/${id}/follow`,"POST");
    setSuggestions(prev=>prev.filter(u=>u.id!==id));
  };

  return (
    <div className="scroll">
      <div className="topbar"><h2>Search</h2></div>
      <div className="search-bar">
        <Icon n="search" size={18} color="#a1a1b5"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search people, posts…" autoFocus/>
        {q && <span onClick={()=>setQ("")} style={{cursor:"pointer",lineHeight:0}}><Icon n="x" size={16} color="#a1a1b5"/></span>}
      </div>

      {!results && suggestions.length>0 && (
        <div className="suggestions">
          <h4>Suggested for you</h4>
          {suggestions.map(u=>(
            <div key={u.id} className="sug-card">
              <Avatar user={u} size={42}/>
              <div className="mid" onClick={()=>openProfile(u.id)} style={{cursor:"pointer"}}>
                <b>{u.name}</b>
                <small>{u.followersCount} followers</small>
              </div>
              <button className="follow-btn" onClick={()=>follow(u.id)}>Follow</button>
            </div>
          ))}
        </div>
      )}

      {results && (
        <>
          {results.users.length>0 && (
            <div className="search-section">
              <h4>People</h4>
              {results.users.map(u=>(
                <div key={u.id} className="user-chip" onClick={()=>openProfile(u.id)}>
                  <Avatar user={u} size={40}/>
                  <div className="mid">
                    <b>{u.name}</b>
                    <small>@{u.username} · {u.followersCount} followers</small>
                  </div>
                  {u.verified && <Icon n="check" size={14} color="#8b5cf6"/>}
                </div>
              ))}
            </div>
          )}
          {results.posts.length>0 && (
            <div className="search-section">
              <h4>Posts</h4>
              {results.posts.map(p=>{
                const [a,b]=tint(p.id);
                return (
                  <div key={p.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #262636",cursor:"pointer"}}>
                    <div style={{width:52,height:52,borderRadius:10,background:`linear-gradient(135deg,${a},${b})`,flexShrink:0,overflow:"hidden"}}>
                      {p.image&&<img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.caption}</p>
                      <small style={{color:"#9a9ab0"}}>{p.user?.name} · {p.likesCount} likes</small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {results.users.length===0&&results.posts.length===0&&(
            <p className="empty">No results for "{q}"</p>
          )}
        </>
      )}
    </div>
  );
}

export function Notifications({ onRead }) {
  const [list, setList] = useState(null);
  useEffect(()=>{
    api("/notifications").then(d=>{ setList(d); onRead&&onRead(); });
  },[]);

  const iconFor = (type) => {
    if(type==="like") return {n:"heart",color:"#ff3b5c",cls:"like"};
    if(type==="comment") return {n:"comment",color:"#14b8a6",cls:"comment"};
    return {n:"user",color:"#8b5cf6",cls:"follow"};
  };

  return (
    <div className="scroll">
      <div className="topbar"><h2>Activity</h2></div>
      {list?.length===0 && <p className="empty">No activity yet.<br/>Likes and follows will show up here.</p>}
      {list?.map(n=>{
        const ic = iconFor(n.type);
        return (
          <div className="notif-row" key={n.id}>
            <div style={{position:"relative"}}>
              <Avatar user={n.user} size={42}/>
              <span className={`notif-icon ${ic.cls}`} style={{position:"absolute",bottom:-2,right:-2,width:18,height:18}}>
                <Icon n={ic.n} size={10} color={ic.color} fill/>
              </span>
            </div>
            <div className="mid">
              <b>{n.user?.name}</b>
              <small style={{color:"#b7b0ee"}}>{n.text}</small>
            </div>
            <span className="time">{timeAgo(n.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}
