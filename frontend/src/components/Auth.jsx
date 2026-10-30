import React, { useState } from "react";
import { api } from "../api";
import { Field, Icon, Status } from "./Shared";

export function Login({ onAuth, go }) {
  const [email, setEmail] = useState("prateekrai2007@gmail.com");
  const [password, setPassword] = useState("123456");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { onAuth(await api("/auth/login","POST",{email,password})); }
    catch(x) { setErr(x.message); } finally { setBusy(false); }
  };

  return (
    <div className="screen auth login">
      <Status/>
      <div className="hero">
        <div className="logo"><Icon n="group" size={34} color="#fff"/></div>
        <h1>Social Circle</h1>
        <p>Stay close to the people who matter</p>
      </div>
      <form className="card" onSubmit={submit}>
        <h2>Welcome back 👋</h2>
        <p className="sub">Login to your account</p>
        <Field icon="mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required/>
        <Field icon="lock" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required
          right={<span onClick={()=>setShow(!show)} style={{cursor:"pointer",lineHeight:0}}><Icon n="eye" size={18} color="#a1a1b5"/></span>}/>
        {err && <div className="err">{err}</div>}
        <button className="cta" disabled={busy}>{busy?"Logging in…":"Log In"}</button>
        <p className="alt">New here? <a onClick={()=>go("register")}>Create an account</a></p>
      </form>
    </div>
  );
}

export function Register({ onAuth, go }) {
  const [f, setF] = useState({name:"",email:"",phone:"",password:"",dob:"",city:""});
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const set = k => e => setF({...f,[k]:e.target.value});

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { onAuth(await api("/auth/register","POST",f)); }
    catch(x) { setErr(x.message); }
  };

  return (
    <div className="screen auth reg">
      <Status/>
      <div className="hero small">
        <div className="logo"><Icon n="group" size={30} color="#fff"/></div>
        <h1 style={{fontSize:21}}>Join Social Circle</h1>
        <p>Create your account</p>
      </div>
      <form className="card reg-card" onSubmit={submit}>
        <h2 style={{fontSize:18}}>Create account</h2>
        <p className="sub">Fill in your details to get started</p>
        <Field icon="user" value={f.name} onChange={set("name")} placeholder="Full name" required/>
        <Field icon="mail" type="email" value={f.email} onChange={set("email")} placeholder="Email" required/>
        <Field icon="phone" value={f.phone} onChange={set("phone")} placeholder="Phone number"/>
        <Field icon="lock" type={show?"text":"password"} value={f.password} onChange={set("password")} placeholder="Password" required
          right={<span onClick={()=>setShow(!show)} style={{cursor:"pointer",lineHeight:0}}><Icon n="eye" size={18} color="#a1a1b5"/></span>}/>
        <Field icon="cal" type="text" onFocus={e=>(e.target.type="date")} value={f.dob} onChange={set("dob")} placeholder="Date of birth"/>
        <Field icon="pin" value={f.city} onChange={set("city")} placeholder="City"/>
        {err && <div className="err">{err}</div>}
        <button className="cta">Sign Up 🚀</button>
        <p className="alt">Already have an account? <a onClick={()=>go("login")}>Login</a></p>
      </form>
    </div>
  );
}
