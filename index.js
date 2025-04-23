const fs = require('fs');
const csv = require('csv-parser');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

// Removed direct puppeteer import — whatsapp-web.js handles it internally

// Initialize the WhatsApp client with appropriate Puppeteer settings
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// Generate QR code in terminal
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

// Once WhatsApp is ready, send messages
client.on('ready', () => {
  console.log('✅ WhatsApp is ready!');
  sendMessagesFromCSV();
});

client.initialize();

// Send messages from CSV
function sendMessagesFromCSV() {
  const results = [];

  fs.createReadStream('numbers.csv')
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', async () => {
      for (const entry of results) {
        const number = entry.number.replace(/\D/g, '') + '@c.us'; // Sanitize number
        const message = entry.message;

        try {
          await client.sendMessage(number, message);
          console.log(`✅ Message sent to ${entry.number}`);
        } catch (err) {
          console.error(`❌ Failed to send to ${entry.number}`, err.message);
        }
      }
    });
}
