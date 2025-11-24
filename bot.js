const mc = require('minecraft-protocol');
const config = require('./config.json');

const client = mc.createClient({
  host: config.serverIp,
  port: config.serverPort,
  username: 'BotUsername' // Change this to your bot username
});

client.on('login', () => {
  console.log('✅ Bot logged in successfully!');
  client.chat('Hello from 24/7 bot!');
});

client.on('chat', (packet) => {
  const message = JSON.parse(packet.message);
  console.log('💬', message.text || message.translate || packet.message);
});

client.on('end', () => {
  console.log('⚠️ Disconnected. Reconnecting in 5 seconds...');
  setTimeout(() => {
    client.connect();
  }, 5000);
});
