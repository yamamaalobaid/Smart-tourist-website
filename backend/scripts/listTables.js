const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('open error', err.message);
    process.exit(1);
  }
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    if (err) {
      console.error('err', err);
      process.exit(1);
    }
    console.log(JSON.stringify(rows, null, 2));
    db.close();
  });
});
