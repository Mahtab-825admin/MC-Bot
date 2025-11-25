const mc = require('minecraft-protocol');
const http = require('http');
const config = require('./config.json');

const BOT_USERNAME = 'LifestealGo'; // change if needed

let client;

function startBot() {
  client = mc.createClient({
    host: config.serverIp,
    port: config.serverPort,
    username: BOT_USERNAME,
  });

  client.on('login', () => {
    console.log('✅ Bot logged in successfully!');
  });

  client.on('spawn', () => {
    console.log("🟢 Bot spawned, starting continuous movement...");

    // Continuous movement loop
    setInterval(() => {
      if (!client.entity) return;

      try {
        console.log("➡️ Moving right...");
        client.write('position', {
          x: client.entity.position.x + 0.3,
          y: client.entity.position.y,
          z: client.entity.position.z,
          onGround: true
        });

        setTimeout(() => {
          console.log("⬅️ Moving left...");
          client.write('position', {
            x: client.entity.position.x - 0.3,
            y: client.entity.position.y,
            z: client.entity.position.z,
            onGround: true
          });
        }, 1000);

        setTimeout(() => {
          console.log("⬆️ Jumping...");
          client.write('position', {
            x: client.entity.position.x,
            y: client.entity.position.y + 0.5,
            z: client.entity.position.z,
            onGround: false
          });
        }, 2000);

      } catch (err) {
        console.log("⚠️ Movement error:", err.message);
      }

    }, 3000); // full cycle every 3 sec
  });

  client.on('end', () => {
    console.log("⚠️ Disconnected. Reconnecting in 30s...");
    setTimeout(startBot, 30000);
  });

  client.on('error', err => {
    console.log("❌ Error:", err.message);
    console.log("⚠️ Reconnecting in 30s...");
    setTimeout(startBot, 30000);
  });
}

startBot();

// Render health check server
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot running with continuous movement.');
}).listen(PORT, () => {
  console.log(`🌐 Web server live on port ${PORT}`);
});
