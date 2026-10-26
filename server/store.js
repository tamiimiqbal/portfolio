// Storage layer: MongoDB when MONGODB_URI is set, otherwise a local JSON file.
// The whole site state is small, so it is kept as one document / one file.
const fs = require('fs');
const path = require('path');
const seed = require('./seed');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

let state = null;
let mongoCol = null;
let writing = Promise.resolve();

function fillMissing(s) {
  const base = seed();
  for (const k of Object.keys(base)) if (s[k] === undefined) s[k] = base[k];
  s.profile = { ...base.profile, ...s.profile, socials: { ...base.profile.socials, ...(s.profile.socials || {}) } };
  return s;
}

async function init() {
  if (process.env.MONGODB_URI) {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    mongoCol = client.db(process.env.MONGODB_DB || 'portfolio').collection('site');
    const doc = await mongoCol.findOne({ _id: 'main' });
    if (doc) {
      delete doc._id;
      state = fillMissing(doc);
    } else {
      state = seed();
      await mongoCol.insertOne({ _id: 'main', ...state });
    }
    console.log('  storage  → MongoDB');
  } else {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      state = fillMissing(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
    } else {
      state = seed();
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
    }
    console.log('  storage  → data/db.json (set MONGODB_URI for cloud hosting)');
  }
}

function persist() {
  const snapshot = JSON.parse(JSON.stringify(state));
  writing = writing.then(async () => {
    if (mongoCol) {
      await mongoCol.replaceOne({ _id: 'main' }, { _id: 'main', ...snapshot }, { upsert: true });
    } else {
      const tmp = DATA_FILE + '.tmp';
      await fs.promises.writeFile(tmp, JSON.stringify(snapshot, null, 2));
      await fs.promises.rename(tmp, DATA_FILE);
    }
  }).catch((e) => console.error('Persist failed:', e));
  return writing;
}

const get = () => state;

module.exports = { init, get, persist, DATA_FILE };
