const mc = require('minecraft-protocol');
const http = require('http');
const config = require('./config.json');

const BOT_USERNAME = 'LifestealGo'; // Change to your bot's username

// Function to start the Minecraft bot
function startBot() {
  const client = mc.createClient({
    host: config.serverIp,
    port: config.serverPort,
    username: BOT_USERNAME
  });

  client.on('login', () => {
    console.log('✅ Bot logged in successfully!');
    client.chat('Hello from 24/7 bot!');
  });

  client.on('chat', (packet) => {
    try {
      const message = JSON.parse(packet.message);
      console.log('💬', message.text || message.translate || packet.message);
    } catch (e) {
      console.log('💬', packet.message);
    }
  });

  client.on('end', () => {
    console.log('⚠️ Disconnected. Reconnecting in 5 seconds...');
    setTimeout(startBot, 5000);
  });

  client.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    console.log('⚠️ Reconnecting in 5 seconds...');
    setTimeout(startBot, 5000);
  });
}

// Start the bot
startBot();

// Dummy HTTP server for Render health check
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Minecraft bot is running ✅');
}).listen(PORT, () => {
  console.log(`🌐 Render health check server listening on port ${PORT}`);
});
