const fs = require('fs');
const csv = require('csv-parser');
const qrcode = require('qrcode-terminal');

const puppeteer = require('puppeteer');


const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp is ready!');
  sendMessagesFromCSV();
});

client.initialize();

// Minimal HTTP server for Render port detection
const http = require('http');

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('✅ WhatsApp Bulk Sender is running.\n');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 HTTP server listening on port ${PORT}`);
});

function sendMessagesFromCSV() {
  const results = [];

  fs.createReadStream('numbers.csv')
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', async () => {
      for (const entry of results) {
        const number = entry.number + '@c.us';
        const message = entry.message;

        try {
          // To send just text
          await client.sendMessage(number, message);
          console.log(`✅ Message sent to ${entry.number}`);
        } catch (err) {
          console.error(`❌ Failed to send to ${entry.number}`, err);
        }
      }
    });
}
