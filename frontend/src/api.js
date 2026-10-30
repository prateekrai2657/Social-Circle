import { io } from "socket.io-client";

export const getToken = () => localStorage.getItem("sc_token");

export async function api(path, method="GET", body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()||""}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||"Something went wrong");
  return data;
}

let socket;
export const connectSocket = () => {
  if(socket) socket.disconnect();
  socket = io({
    auth: { token: getToken() },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
  return socket;
};
export const getSocket = () => socket;

export const readImage = (file, max=1000) =>
  new Promise(resolve=>{
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max/Math.max(img.width,img.height));
        const c = document.createElement("canvas");
        c.width=img.width*s; c.height=img.height*s;
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        resolve(c.toDataURL("image/jpeg",0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });

export const timeAgo = t => {
  const m = Math.floor((Date.now()-t)/60000);
  if(m<1) return "now";
  if(m<60) return `${m}m ago`;
  if(m<1440) return `${Math.floor(m/60)}h ago`;
  return `${Math.floor(m/1440)}d ago`;
};
export const clock = t => new Date(t).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
export const listTime = t => {
  const d=new Date(t), now=new Date();
  if(d.toDateString()===now.toDateString()) return clock(t);
  const y=new Date(now); y.setDate(now.getDate()-1);
  if(d.toDateString()===y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US",{weekday:"short"});
};
