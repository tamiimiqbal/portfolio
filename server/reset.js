// Resets local JSON data to the starter content: npm run reset-data
const fs = require('fs');
const path = require('path');
const seed = require('./seed');
const { DATA_FILE } = require('./store');
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.writeFileSync(DATA_FILE, JSON.stringify(seed(), null, 2));
console.log('Data reset →', DATA_FILE);
