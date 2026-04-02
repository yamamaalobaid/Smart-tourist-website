const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) { console.error('open error', err.message); process.exit(1); }
  db.run("DROP TABLE IF EXISTS Users_backup", function(err) {
    if (err) { console.error('drop error', err); process.exit(1); }
    console.log('Users_backup dropped');
    db.close();
  });
});
