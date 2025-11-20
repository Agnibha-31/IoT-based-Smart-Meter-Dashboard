import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wasmDir = path.resolve(__dirname, 'node_modules/sql.js/dist');
const dbPath = path.join(__dirname, 'storage', 'smartmeter.sqlite');

(async () => {
  try {
    const SQL = await initSqlJs({
      locateFile: (file) => path.join(wasmDir, file),
    });

    const fileBuffer = await fs.readFile(dbPath);
    const db = new SQL.Database(fileBuffer);

    db.run('DELETE FROM users');
    console.log('✓ Deleted all user accounts');

    const data = db.export();
    await fs.writeFile(dbPath, Buffer.from(data));
    
    db.close();
    
    console.log('✓ Database saved');
    console.log('\n✓ All user accounts have been removed!');
    console.log('✓ The application is now reset to first-time setup.');
    console.log('✓ Next login will show the registration screen.');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
})();
