import { app, ipcMain } from 'electron';
import Database from 'better-sqlite3';
import isDev from 'electron-is-dev';

// const dbDirectory = isDev
//   ? `${app.getAppPath()}\\database`
//   : app.getAppPath().replace('app.asar', 'localStorage');

const dbDirectory = `${app.getAppPath()}\\database`;
const dbAddress = `${dbDirectory}\\simpleSpell.db`;

export default class dbHandler {
  static db: any;

  static initDb(): void {
    this.db = new Database(dbAddress, {});
    this.db.pragma('journal_mode = WAL');

    const createTable = this.db.prepare(`
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT UNIQUE,
    queries INTEGER ,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

    createTable.run();
  }
}

// Get the current words list
ipcMain.handle('DB:GETWORDSLIST', async (event, arg) => {
  // Get the top results
  const stmt = dbHandler.db.prepare(
    'SELECT * FROM words ORDER BY queries DESC LIMIT 5'
  );
  return stmt.all();
});

// Add or update a word.
ipcMain.on('DB:ADDUPDATEWORD', async (event, arg) => {
  // Split the input if containing multiply words.
  const wordsInputArray = arg.split(' ');

  for (let index = 0; index < wordsInputArray.length; index++) {
    const word = wordsInputArray[index];
    const inputword = word.toLowerCase();

    // check if the word already exists
    let stmt = dbHandler.db.prepare('SELECT * FROM words WHERE text = ?');
    let wordtext = stmt.get(inputword);

    // If the word already exists.
    if (wordtext !== undefined && wordtext.queries) {
      const update = dbHandler.db.prepare(
        `UPDATE words SET queries = ? WHERE id = ${wordtext.id}`
      );
      update.run(wordtext.queries + 1);
    } else {
      const insert = dbHandler.db.prepare(
        'INSERT INTO words (text, queries) VALUES (?, ?)'
      );
      insert.run(inputword, 1);
    }

    stmt = dbHandler.db.prepare('SELECT * FROM words WHERE text = ?');
    wordtext = stmt.get(arg);
  }

  // Get the top results
  const stmt = dbHandler.db.prepare(
    'SELECT * FROM words ORDER BY queries DESC LIMIT 5'
  );
  const result = stmt.all();

  console.log(result);
});
