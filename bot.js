const mc = require('minecraft-protocol');
const http = require('http');
const config = require('./config.json');

const BOT_USERNAME = 'LifestealGo'; // Change to your bot's username

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

  // Wait until the bot entity spawns before starting auto-jump
  client.on('spawn', () => {
    console.log('🟢 Bot entity ready, starting auto-jump...');

    // AUTO JUMP EVERY 30 SECONDS
    setInterval(() => {
      if (!client.entity) return; // ensure entity exists

      try {
        console.log('⬆️ Jumping...');
        client.write('position', {
          x: client.entity.position.x,
          y: client.entity.position.y + 0.5,
          z: client.entity.position.z,
          onGround: false
        });
      } catch (err) {
        console.log('⚠️ Jump error:', err.message);
      }
    }, 30000); // 30 seconds
  });

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
    console.log('⚠️ Disconnected. Reconnecting in 30s...');
    setTimeout(startBot, 30000);
  });

  // AUTO RECONNECT ON ERROR
  client.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    console.log('⚠️ Reconnecting in 30s...');
    setTimeout(startBot, 30000);
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
