const mineflayer = require('mineflayer');
const http = require('http');
const config = require('./config.json');

const RECONNECT_DELAY = 30000; // 30 seconds
const MOVE_CYCLE_MS = 3000;

let bot = null;
let movementInterval = null;

function startBot() {
  console.log('🚀 Starting bot...');

  bot = mineflayer.createBot({
    host: config.serverIp,
    port: config.serverPort || 25565,
    username: config.username
  });

  bot.on('login', () => {
    console.log('✅ Logged in to Minecraft server');
  });

  bot.once('spawn', () => {
    console.log('🟢 Spawned');

    // 🔐 Auto register / login
    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
      console.log('🔐 Sent register/login');
    }, 2000);

    startMovement();
  });

  // 📩 Chat listener (auth detection)
  bot.on('chat', (username, message) => {
    const msg = message.toLowerCase();

    if (msg.includes('register')) {
      bot.chat(`/register ${config.password} ${config.password}`);
      console.log('📝 Registering...');
    }

    if (msg.includes('login')) {
      bot.chat(`/login ${config.password}`);
      console.log('🔑 Logging in...');
    }

    console.log(`💬 ${username}: ${message}`);
  });

  // 🏃 Continuous movement (anti-AFK)
  function startMovement() {
    if (movementInterval) clearInterval(movementInterval);

    movementInterval = setInterval(() => {
      if (!bot || !bot.entity) return;

      try {
        // move right
        bot.setControlState('right', true);
        bot.setControlState('left', false);

        setTimeout(() => {
          // move left
          bot.setControlState('right', false);
          bot.setControlState('left', true);
        }, 1000);

        setTimeout(() => {
          // jump
          bot.setControlState('left', false);
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }, 2000);

      } catch (e) {
        console.log('⚠️ Movement error:', e.message);
      }
    }, MOVE_CYCLE_MS);
  }

  // 🔁 Cleanup + reconnect
  function reconnect() {
    try {
      if (movementInterval) clearInterval(movementInterval);
      movementInterval = null;
    } catch {}

    try {
      if (bot) bot.quit();
    } catch {}

    bot = null;

    console.log(`🔁 Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
    setTimeout(startBot, RECONNECT_DELAY);
  }

  bot.on('end', () => {
    console.log('⚠️ Disconnected');
    reconnect();
  });

  bot.on('kicked', (reason) => {
    console.log('🚫 Kicked:', reason);
    reconnect();
  });

  bot.on('error', (err) => {
    console.log('❌ Error:', err.message || err);
    reconnect();
  });
}

// ▶️ Start bot
startBot();

// 🌐 Health server (Render + UptimeRobot)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  const status = bot && bot.entity ? 'online' : 'offline';
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Minecraft bot status: ${status}\n`);
}).listen(PORT, () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});
