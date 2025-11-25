const mc = require('minecraft-protocol');
const http = require('http');
const config = require('./config.json');

const BOT_USERNAME = 'LifestealGo'; // change this

let client;

// === START BOT FUNCTION ===
function startBot() {
  client = mc.createClient({
    host: config.serverIp,
    port: config.serverPort,
    username: BOT_USERNAME,
  });

  client.on('login', () => {
    console.log('✅ Bot logged in successfully!');
    client.chat('Hello! I am your 24/7 AFK bot!');
  });

  // AUTO JUMP EVERY 60 SECONDS
  setInterval(() => {
    if (!client) return;

    try {
      console.log("⬆️ Jumping...");
      client.write('position', {
        x: client.entity.position.x,
        y: client.entity.position.y + 0.5, // slight jump
        z: client.entity.position.z,
        onGround: false
      });
    } catch (err) {
      console.log("⚠️ Jump error:", err.message);
    }

  }, 60000); // 1 minute = 60000 ms

  // CHAT LOG
  client.on('chat', (packet) => {
    try {
      const msg = JSON.parse(packet.message);
      console.log('💬', msg.text || msg.translate || packet.message);
    } catch {
      console.log('💬', packet.message);
    }
  });

  // AUTO RECONNECT ON END
  client.on('end', () => {
    console.log('⚠️ Disconnected. Reconnecting in 5s...');
    setTimeout(startBot, 5000);
  });

  // AUTO RECONNECT ON ERROR
  client.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    console.log('⚠️ Reconnecting in 5s...');
    setTimeout(startBot, 5000);
  });
}

// START BOT
startBot();

// === RENDER WEB SERVER (for green tick + uptime robot) ===
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Minecraft bot is running with auto-jump! ✅');
}).listen(PORT, () => {
  console.log(`🌐 Render health check server running on port ${PORT}`);
});
