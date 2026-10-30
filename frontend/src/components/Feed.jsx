import React, { useEffect, useRef, useState } from "react";
import { api, timeAgo, readImage } from "../api";
import { Avatar, Icon, tint } from "./Shared";

const EMOJIS = ["❤️","🔥","😂","😮","😢","👏"];
const STORY_BGS = [
  ["#3b2a7a","#7c3aed"],["#1f3a5f","#3b82f6"],["#5b2a4e","#ec4899"],
  ["#1e4b45","#14b8a6"],["#5a3a1e","#f59e0b"],["#1a1a2e","#e94560"],
];

function CommentsSheet({ post, me, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  useEffect(() => {
    api(`/posts/${post.id}/comments`).then(setComments);
  }, [post.id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const c = await api(`/posts/${post.id}/comments`,"POST",{text});
    setComments(prev=>[...prev,c]);
    setText("");
  };

  const del = async (cid) => {
    await api(`/posts/${post.id}/comments/${cid}`,"DELETE");
    setComments(prev=>prev.filter(c=>c.id!==cid));
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="sheet-title">Comments ({post.commentsCount})</div>
        <div className="sheet-body">
          {comments.length===0 && <p className="empty">No comments yet. Be the first!</p>}
          {comments.map(c=>(
            <div className="comment-row" key={c.id}>
              <Avatar user={c.user} size={32}/>
              <div className="cbubble">
                <b>{c.user?.name}</b>
                <p>{c.text}</p>
                <small>{timeAgo(c.createdAt)}{c.userId===me.id && <span onClick={()=>del(c.id)} style={{marginLeft:8,color:"#ff6b6b",cursor:"pointer"}}>delete</span>}</small>
              </div>
            </div>
          ))}
        </div>
        <form className="sheet-input" onSubmit={submit}>
          <Avatar user={me} size={30}/>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a comment…"/>
          <button type="submit" style={{lineHeight:0}}><Icon n="send" size={20} color="#8b5cf6"/></button>
        </form>
      </div>
    </div>
  );
}

export function PostCard({ post, me, onChange, openProfile, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [a,b] = tint(post.id);

  const like = async () => {
    const next = !liked;
    setLiked(next); setLikesCount(c=>next?c+1:c-1);
    const updated = await api(`/posts/${post.id}/like`,"POST");
    onChange(updated);
  };

  const react = async (emoji) => {
    setShowReactions(false);
    onChange(await api(`/posts/${post.id}/react`,"POST",{emoji}));
  };

  const reactionEntries = Object.entries(post.reactions||{});
  const reactionSummary = EMOJIS.map(e=>({
    emoji:e, count:reactionEntries.filter(([,v])=>v===e).length
  })).filter(r=>r.count>0);

  const words = post.caption.split(/(#\w+)/g);

  return (
    <article className="post">
      <header>
        <span onClick={()=>openProfile(post.user.id)} style={{cursor:"pointer"}}><Avatar user={post.user} size={38}/></span>
        <div className="who">
          <b>{post.user.name}{post.user.verified&&<span className="vbadge" style={{marginLeft:4,width:14,height:14,display:"inline-grid",placeItems:"center",borderRadius:"50%",background:"#8b5cf6"}}><Icon n="check" size={8} color="#fff"/></span>}</b>
          <small>{timeAgo(post.createdAt)} · {post.user.city||"Roorkee"}</small>
        </div>
        <span style={{position:"relative"}}>
          <span onClick={()=>setShowMenu(!showMenu)} style={{cursor:"pointer",lineHeight:0}}><Icon n="dotsH" color="#cfcfe0"/></span>
          {showMenu && (
            <div style={{position:"absolute",right:0,top:24,background:"#1c1c28",border:"1px solid #2e2e40",borderRadius:12,zIndex:20,minWidth:140,overflow:"hidden"}}>
              {post.user.id===me.id && (
                <button onClick={()=>{setShowMenu(false);onDelete(post.id);}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",width:"100%",color:"#ff6b6b",fontSize:13}}>
                  <Icon n="trash" size={15} color="#ff6b6b"/> Delete post
                </button>
              )}
              <button onClick={()=>{setShowMenu(false);onChange({...post,saved:!post.saved});api(`/posts/${post.id}/save`,"POST");}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",width:"100%",fontSize:13}}>
                <Icon n="bookmark" size={15}/> {post.saved?"Unsave":"Save"}
              </button>
            </div>
          )}
        </span>
      </header>

      {post.image ? (
        <img className="pimg" src={post.image} alt="" onDoubleClick={like}/>
      ) : (
        <div className="pimg ph" style={{background:`linear-gradient(135deg,${a},${b})`}}>
          {post.caption.split("\n")[0].slice(0,40)||"Social Circle"}
        </div>
      )}

      <div className="acts">
        <button className={`like-btn${liked?" liked":""}`} onClick={like} style={{color:liked?"#ff3b5c":"#fff"}}>
          <Icon n="heart" fill={liked} color={liked?"#ff3b5c":"#cfcfe0"}/> {likesCount}
        </button>
        <button onClick={()=>setShowComments(true)}>
          <Icon n="comment" size={19} color="#cfcfe0"/> {post.commentsCount}
        </button>
        <button onClick={()=>setShowReactions(!showReactions)}>
          <span style={{fontSize:16}}>{post.myReaction||"😊"}</span>
        </button>
        <button style={{marginLeft:"auto"}} onClick={()=>api(`/posts/${post.id}/save`,"POST").then(onChange)}>
          <Icon n="bookmark" size={19} fill={post.saved} color={post.saved?"#8b5cf6":"#cfcfe0"}/>
        </button>
      </div>

      {showReactions && (
        <div className="reaction-picker">
          {EMOJIS.map(e=>(
            <span key={e} onClick={()=>react(e)} style={{fontSize:22,cursor:"pointer"}}>{e}</span>
          ))}
        </div>
      )}

      {reactionSummary.length>0 && (
        <div className="reactions">
          {reactionSummary.map(r=>(
            <span key={r.emoji} className={`reaction-chip${post.myReaction===r.emoji?" mine":""}`} onClick={()=>react(r.emoji)}>
              {r.emoji} {r.count}
            </span>
          ))}
        </div>
      )}

      <p className="cap" style={{marginTop:8}}>
        {words.map((w,i)=>w.startsWith("#")?<span key={i} className="tag">{w}</span>:w)}
      </p>

      {showComments && <CommentsSheet post={post} me={me} onClose={()=>setShowComments(false)}/>}
    </article>
  );
}

function StoryViewer({ users, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef();

  const user = users[idx];
  const story = user?.stories?.[0];

  useEffect(() => {
    setProgress(0);
    timerRef.current = setInterval(()=>setProgress(p=>{
      if(p>=100){ clearInterval(timerRef.current); if(idx<users.length-1) setIdx(i=>i+1); else onClose(); return 100; }
      return p+2;
    }),100);
    return ()=>clearInterval(timerRef.current);
  },[idx]);

  if(!user||!story) return null;
  const [c1,c2] = story.bg||["#3b2a7a","#7c3aed"];

  return (
    <div className="story-viewer">
      <div className="sv-bg" style={{background:`linear-gradient(135deg,${c1},${c2})`}}/>
      <div className="sv-content">
        <div className="sv-bar">
          {users.map((_,i)=>(
            <div key={i} className="sv-seg">
              <div className="sv-seg-fill" style={{width:i<idx?"100%":i===idx?`${progress}%`:"0%"}}/>
            </div>
          ))}
        </div>
        <div className="sv-head">
          <Avatar user={user} size={36}/>
          <div style={{flex:1}}>
            <b style={{fontSize:13}}>{user.name}</b>
            <div style={{fontSize:11,opacity:.7}}>{timeAgo(story.createdAt)}</div>
          </div>
          <button className="sv-close" onClick={onClose}><Icon n="x" size={16} color="#fff"/></button>
        </div>
        <div className="sv-text">{story.text}</div>
      </div>
    </div>
  );
}

export function Feed({ me, openProfile, go }) {
  const [posts, setPosts] = useState([]);
  const [storyUsers, setStoryUsers] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);

  useEffect(()=>{
    api("/feed").then(setPosts);
    api("/stories").then(u=>setStoryUsers(u.filter(x=>x.id!==me.id)));
  },[]);

  const deletePost = async (id) => {
    await api(`/posts/${id}`,"DELETE");
    setPosts(prev=>prev.filter(p=>p.id!==id));
  };

  const storyList = storyUsers.filter(u=>u.hasStory);

  return (
    <div className="scroll" style={{position:"relative"}}>
      {viewingStory!==null && (
        <StoryViewer users={storyList} startIdx={viewingStory} onClose={()=>setViewingStory(null)}/>
      )}
      <div className="topbar">
        <h2>Social Circle</h2>
        <div style={{gap:14}}>
          <span onClick={()=>go("search")} style={{cursor:"pointer",lineHeight:0}}><Icon n="search" size={21}/></span>
          <span onClick={()=>go("create")} style={{cursor:"pointer",lineHeight:0}}><Icon n="camera" size={21}/></span>
        </div>
      </div>

      <div className="stories">
        <div className="story" onClick={()=>go("create")}>
          <div style={{position:"relative"}}>
            <Avatar user={me} size={54} ring="no"/>
            <span className="plus-badge"><Icon n="plus" size={12} color="#fff"/></span>
          </div>
          <small>Your Story</small>
        </div>
        {storyList.map((u,i)=>(
          <div key={u.id} className="story" onClick={()=>setViewingStory(i)}>
            <Avatar user={u} size={54} ring="story"/>
            <small>{u.name.split(" ")[0]}</small>
          </div>
        ))}
      </div>

      {posts.map(p=>(
        <PostCard key={p.id} post={p} me={me} openProfile={openProfile}
          onDelete={deletePost}
          onChange={np=>setPosts(posts.map(x=>x.id===np.id?np:x))}/>
      ))}
    </div>
  );
}

export function Create({ me, go }) {
  const [tab, setTab] = useState("post");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [storyText, setStoryText] = useState("");
  const [storyBg, setStoryBg] = useState(0);
  const [err, setErr] = useState("");

  const pickImage = async (e) => {
    if(!e.target.files[0]) return;
    setImage(await readImage(e.target.files[0]));
  };

  const publishPost = async () => {
    try { await api("/posts","POST",{caption,image}); go("feed"); }
    catch(x) { setErr(x.message); }
  };

  const publishStory = async () => {
    try { await api("/stories","POST",{text:storyText,bg:STORY_BGS[storyBg]}); go("feed"); }
    catch(x) { setErr(x.message); }
  };

  return (
    <div className="scroll pad">
      <div className="topbar"><h2>Create</h2></div>
      <div className="tabs" style={{marginBottom:16}}>
        <button className={tab==="post"?"on":""} onClick={()=>setTab("post")}><small>📝 Post</small></button>
        <button className={tab==="story"?"on":""} onClick={()=>setTab("story")}><small>✨ Story</small></button>
      </div>

      {tab==="post" && (
        <>
          <textarea className="area" rows={4} placeholder="What's on your mind? Use #hashtags" value={caption} onChange={e=>setCaption(e.target.value)}/>
          <label className="drop">
            {image?<img src={image} alt=""/>:<><Icon n="camera" size={30} color="#8b5cf6"/><span>Add a photo</span></>}
            <input type="file" accept="image/*" hidden onChange={pickImage}/>
          </label>
          {err && <div className="err">{err}</div>}
          <button className="cta" onClick={publishPost}>Share Post</button>
        </>
      )}

      {tab==="story" && (
        <>
          <div style={{height:180,borderRadius:16,background:`linear-gradient(135deg,${STORY_BGS[storyBg][0]},${STORY_BGS[storyBg][1]})`,display:"grid",placeItems:"center",marginBottom:12}}>
            <span style={{fontSize:22,fontWeight:800,color:"#fff",textAlign:"center",padding:"0 20px"}}>{storyText||"Your story text…"}</span>
          </div>
          <input className="area" style={{marginBottom:12}} placeholder="Type your story text…" value={storyText} onChange={e=>setStoryText(e.target.value)}/>
          <div className="story-bgs">
            {STORY_BGS.map(([c1,c2],i)=>(
              <div key={i} className={`story-bg-opt${storyBg===i?" sel":""}`}
                style={{background:`linear-gradient(135deg,${c1},${c2})`}}
                onClick={()=>setStoryBg(i)}/>
            ))}
          </div>
          {err && <div className="err">{err}</div>}
          <button className="cta" onClick={publishStory}>Post Story</button>
        </>
      )}
    </div>
  );
}
