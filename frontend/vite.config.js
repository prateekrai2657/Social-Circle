import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
plugins: [react()],
server: {
port: 5187,
strictPort: true,
allowedHosts: ["limb-barbed-cloud.ngrok-free.dev"],
proxy: {
"/api": "http://localhost:5000",
"/socket.io": { target: "http://localhost:5000", ws: true },
},
},
});

