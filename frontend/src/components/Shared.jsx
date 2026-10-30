import React from "react";

export const TINTS = [["#3b2a7a","#7c3aed"],["#1f3a5f","#3b82f6"],["#5b2a4e","#ec4899"],["#1e4b45","#14b8a6"],["#5a3a1e","#f59e0b"]];
export const tint = (s="") => TINTS[[...s].reduce((a,c)=>a+c.charCodeAt(0),0)%TINTS.length];

const P = {
  home:<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>,
  mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  plus:<><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
  bell:<><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7z"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
  search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  heart:<path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"/>,
  comment:<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z"/>,
  share:<path d="M7 17 17 7M8 7h9v9"/>,
  bookmark:<path d="M6 3h12v18l-6-4-6 4z"/>,
  dotsH:<><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></>,
  back:<path d="M15 5 8 12l7 7"/>,
  logout:<><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  edit:<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>,
  send:<path d="M3 11 21 3l-8 18-2-8z"/>,
  clip:<path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/>,
  smile:<><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01"/></>,
  phone:<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>,
  lock:<><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  eye:<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  cal:<><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></>,
  pin:<><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>,
  grid:<><rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/></>,
  download:<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>,
  group:<><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5M15.5 14.5c3 0 5.5 1.5 5.5 4.5"/></>,
  file:<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6"/>,
  check:<path d="m5 13 4 4L19 7"/>,
  compass:<><circle cx="12" cy="12" r="9"/><path d="m16.2 7.8-4.6 4.6-2.8 1.2 1.2-2.8 4.6-4.6 1.6 1.6z"/></>,
  trash:<><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>,
  x:<path d="M18 6 6 18M6 6l12 12"/>,
  camera:<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
  group:<><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5M15.5 14.5c3 0 5.5 1.5 5.5 4.5"/></>,
  sparkle:<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>,
  dots:<><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></>,
};

export const Icon = ({ n, size=20, fill, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill ? color||"currentColor" : "none"}
    stroke={color||"currentColor"}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {P[n]}
  </svg>
);

export function Avatar({ user, size=44, ring, style }) {
  const [a,b] = tint(user?.id);
  const inner = user?.avatar ? (
    <img src={user.avatar} alt="" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",display:"block"}}/>
  ) : (
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${a},${b})`,display:"grid",placeItems:"center",color:"#fff",fontWeight:700,fontSize:size*0.38}}>
      {(user?.name||"?").split(" ").map(w=>w[0]).slice(0,2).join("")}
    </div>
  );
  if (!ring) return <div style={{lineHeight:0,...style}}>{inner}</div>;
  return (
    <div className={`ring${ring==="story"?"":" no-story"}`} style={{width:size+8,height:size+8,...style}}>
      <div className="ring-in">{inner}</div>
    </div>
  );
}

export const Field = ({ icon, right, ...p }) => (
  <label className="field">
    <Icon n={icon} size={18} color="#a1a1b5"/>
    <input {...p}/>
    {right}
  </label>
);

export const Status = () => (
  <div className="status"><span>9:41</span><span className="sicons">▂▄▆ &nbsp;◠ &nbsp;▭</span></div>
);

export function Phone({ children }) {
  return <div className="stage"><div className="phone">{children}</div></div>;
}

export function BottomNav({ tab, go, unread, notifCount }) {
  const items = [
    ["feed","home","Home"],
    ["explore","compass","Explore"],
    ["messages","mail","Messages"],
    ["notifications","bell","Activity"],
    ["profile","user","Profile"],
  ];
  return (
    <nav className="bnav">
      {items.map(([k,ic,label]) => (
        <button key={k} className={tab===k?"on":""} onClick={()=>go(k)}>
          <span style={{position:"relative"}}>
            <Icon n={ic} size={22} fill={tab===k && ic!=="compass"}/>
            {k==="messages" && unread>0 && <i className="dot-badge">{unread}</i>}
            {k==="notifications" && notifCount>0 && <i className="dot-badge">{notifCount}</i>}
          </span>
          <small>{label}</small>
        </button>
      ))}
    </nav>
  );
}
