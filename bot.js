// bot.js
const mineflayer = require('mineflayer');
const http = require('http');
const config = require('./config.json');

const BOT_USERNAME = 'LifestealGo'; // change if needed
const RECONNECT_DELAY = 30000; // 30s
const MOVE_CYCLE_MS = 3000; // full left->right->jump cycle length

let bot = null;
let movementInterval = null;

function startBot() {
  console.log('Starting bot...');
  bot = mineflayer.createBot({
    host: config.serverIp,
    //port: config.serverPort || 25565,
    username: BOT_USERNAME,
    // version: false // optional: specify a version string if needed, e.g. "1.20.4"
  });

  bot.on('login', () => {
    console.log('✅ Bot logged in successfully!');
  });

  bot.on('spawn', () => {
    console.log('🟢 Bot spawned — starting continuous movement loop');

    // Make sure any old interval is cleared
    if (movementInterval) {
      clearInterval(movementInterval);
      movementInterval = null;
    }

    // Movement pattern:
    // - Move right for 1s
    // - Move left for 1s
    // - Jump once (and stop moving for a short moment) then repeat
    movementInterval = setInterval(() => {
      if (!bot.entity) return;

      try {
        // move right
        bot.setControlState('right', true);
        bot.setControlState('left', false);
        bot.setControlState('forward', false);
        bot.setControlState('back', false);

        setTimeout(() => {
          // stop right, move left
          bot.setControlState('right', false);
          bot.setControlState('left', true);
        }, 1000);

        setTimeout(() => {
          // stop left and do a jump
          bot.setControlState('left', false);

          // make the bot jump for ~500ms
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }, 2000);

      } catch (err) {
        console.log('⚠️ Movement error (interval):', err.message);
      }
    }, MOVE_CYCLE_MS);
  });

  // Log chat to console (safe parsing)
  bot.on('chat', (username, message) => {
    console.log('💬', username + ':', message);
  });

  // Clean up and reconnect logic
  function cleanupAndReconnect() {
    try {
      if (movementInterval) {
        clearInterval(movementInterval);
        movementInterval = null;
      }
    } catch (e) { /* ignore */ }

    // Destroy old bot to free resources
    try {
      if (bot && bot.quit) bot.quit(); // graceful quit if possible
    } catch (e) { /* ignore */ }
    bot = null;

    console.log(`⚠️ Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
    setTimeout(startBot, RECONNECT_DELAY);
  }

  bot.on('end', () => {
    console.log('⚠️ Bot disconnected (end).');
    cleanupAndReconnect();
  });

  bot.on('kicked', (reason, loggedIn) => {
    console.log('⚠️ Bot kicked:', reason, 'loggedIn:', loggedIn);
    cleanupAndReconnect();
  });

  bot.on('error', (err) => {
    console.log('❌ Bot error:', err && err.message ? err.message : err);
    cleanupAndReconnect();
  });
}

// Start bot
startBot();

// Simple HTTP server for Render / UptimeRobot health checks
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  let uptimeStatus = 'offline';
  try {
    if (bot && bot.entity) uptimeStatus = 'online';
  } catch (e) { uptimeStatus = 'unknown'; }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Minecraft bot status: ${uptimeStatus}\n`);
}).listen(PORT, () => {
  console.log(`🌐 Health server listening on port ${PORT}`);
});
