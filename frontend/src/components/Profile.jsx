import React, { useEffect, useState } from "react";
import { api, readImage } from "../api";
import { Avatar, Field, Icon } from "./Shared";

function EditModal({ user, onSave, onClose }) {
  const [f, setF] = useState({ name: user.name, bio: user.bio, headline: user.headline||"", city: user.city||"" });
  const set = k => e => setF({...f,[k]:e.target.value});
  const save = async () => { onSave(await api("/me","PUT",f)); onClose(); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Profile</h3>
        <Field icon="user" value={f.name} onChange={set("name")} placeholder="Full name"/>
        <Field icon="sparkle" value={f.headline} onChange={set("headline")} placeholder="Headline (e.g. B.Tech CSE)"/>
        <Field icon="pin" value={f.city} onChange={set("city")} placeholder="City"/>
        <label className="field" style={{height:"auto",padding:"10px 14px",alignItems:"flex-start"}}>
          <Icon n="edit" size={18} color="#a1a1b5" style={{marginTop:2}}/>
          <textarea value={f.bio} onChange={set("bio")} placeholder="Bio" rows={3}
            style={{flex:1,fontSize:13,resize:"none",background:"transparent",border:"none",outline:"none",lineHeight:1.5}}/>
        </label>
        <div className="modal-actions">
          <button className="outline" onClick={onClose}>Cancel</button>
          <button className="cta" style={{flex:1,marginTop:0}} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

function FollowList({ title, users, openProfile, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h3 style={{margin:0}}>{title}</h3>
          <span onClick={onClose} style={{cursor:"pointer",lineHeight:0}}><Icon n="x" size={20}/></span>
        </div>
        <div className="fl-list">
          {users.map(u=>(
            <div key={u.id} className="user-chip" onClick={()=>{openProfile(u.id);onClose();}}>
              <Avatar user={u} size={40}/>
              <div className="mid"><b>{u.name}</b><small>@{u.username}</small></div>
            </div>
          ))}
          {users.length===0 && <p className="empty">None yet</p>}
        </div>
      </div>
    </div>
  );
}

export function Profile({ id, me, back, setMe, logout, openChat, openProfile }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [followList, setFollowList] = useState(null);
  const mine = id===me.id;

  const load = () => api(`/users/${id}`).then(setData);
  useEffect(()=>{ load(); },[id]);

  if(!data) return <div className="scroll"/>;
  const u = data.user;

  const changeAvatar = async (e) => {
    if(!e.target.files[0]) return;
    const avatar = await readImage(e.target.files[0],400);
    const upd = await api("/me","PUT",{avatar});
    setMe(upd); load();
  };

  const follow = async () => { await api(`/users/${u.id}/follow`,"POST"); load(); };

  const items = tab==="posts" ? data.posts : data.saved;
  const filler = Math.max(0,6-items.length);

  return (
    <div className="scroll" style={{position:"relative"}}>
      {editing && <EditModal user={u} onClose={()=>setEditing(false)} onSave={u=>{setMe(u);load();}}/>}
      {followList && (
        <FollowList
          title={followList==="followers"?"Followers":"Following"}
          users={followList==="followers"?data.followers:data.following}
          openProfile={openProfile} onClose={()=>setFollowList(null)}/>
      )}

      <div className="phead">
        <div className="pbar">
          <span onClick={back} style={{cursor:"pointer"}}><Icon n="back" size={22}/></span>
          {mine && <button onClick={logout} style={{color:"#c4b5fd",lineHeight:0}}><Icon n="logout" size={22}/></button>}
        </div>
        <div className="pcurve"/>
      </div>

      <div className="pavatar">
        <div className="pa-ring"><Avatar user={u} size={92}/></div>
        {mine && (
          <label className="pencil">
            <Icon n="camera" size={13} color="#fff"/>
            <input type="file" accept="image/*" hidden onChange={changeAvatar}/>
          </label>
        )}
      </div>

      <div className="pinfo">
        <h3>
          {u.username}
          {u.verified && <span className="vbadge"><Icon n="check" size={10} color="#fff"/></span>}
        </h3>
        <p className="muted">{u.headline}</p>
        <p className="bio">
          {u.bio.split("|").map((s,i,a)=>(
            <span key={i}>{s.trim()}{i<a.length-1&&<em> | </em>}</span>
          ))}
        </p>
        <div className="stats">
          <div><b>{u.postsCount}</b><small>Posts</small></div>
          <div onClick={()=>mine&&setFollowList("followers")}><b>{u.followersCount}</b><small>Followers</small></div>
          <div onClick={()=>mine&&setFollowList("following")}><b>{u.followingCount}</b><small>Following</small></div>
        </div>
        {mine ? (
          <button className="outline" onClick={()=>setEditing(true)}>Edit Profile</button>
        ) : (
          <div style={{display:"flex",gap:10}}>
            <button className="outline" onClick={follow}>{data.isFollowing?"Following ✓":"Follow"}</button>
            <button className="outline" onClick={()=>openChat(u)}>Message</button>
          </div>
        )}
      </div>

      <div className="tabs">
        <button className={tab==="posts"?"on":""} onClick={()=>setTab("posts")}>
          <Icon n="grid" size={19}/><small>Posts</small>
        </button>
        {mine && (
          <button className={tab==="saved"?"on":""} onClick={()=>setTab("saved")}>
            <Icon n="bookmark" size={19}/><small>Saved</small>
          </button>
        )}
      </div>

      <div className="grid">
        {items.map(p=>{
          const [a,b] = [["#3b2a7a","#7c3aed"],["#1f3a5f","#3b82f6"],["#5b2a4e","#ec4899"],["#1e4b45","#14b8a6"],["#5a3a1e","#f59e0b"]][[...p.id].reduce((a,c)=>a+c.charCodeAt(0),0)%5];
          return p.image
            ? <img key={p.id} src={p.image} alt=""/>
            : <div key={p.id} className="tile" style={{background:`linear-gradient(135deg,${a}55,#0f0f17 70%)`}}><span>{p.caption.slice(0,40)}</span></div>;
        })}
        {tab==="posts" && Array.from({length:filler}).map((_,i)=><div key={i} className="tile empty-tile"/>)}
      </div>
    </div>
  );
}
