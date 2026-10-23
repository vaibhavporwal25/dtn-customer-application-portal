import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, execute, queryOne, saveDatabase } from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function rotateAdminPassword() {
  const args = process.argv.slice(2);
  const username = args[0] || process.env.ADMIN_USERNAME || 'admin';
  const newPassword = args[1] || process.env.ADMIN_PASSWORD;

  if (!newPassword) {
    console.error('Error: New password must be provided via command argument or ADMIN_PASSWORD environment variable.');
    console.error('Usage: npm run rotate-admin <username> <newPassword>');
    console.error('   or: ADMIN_PASSWORD="yourNewPassword" npm run rotate-admin');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('Error: Administrator password must be at least 8 characters in length.');
    process.exit(1);
  }

  console.log(`[Admin Security] Rotating credentials for administrator: "${username}"...`);

  await getDatabase();

  const admin = await queryOne('SELECT id, username, email FROM admins WHERE username = ? OR email = ?', [
    username,
    username
  ]);

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(newPassword, salt);

  if (!admin) {
    console.log(`[Admin Security] Administrator "${username}" not found. Creating new administrator account...`);
    await execute(`
      INSERT INTO admins (username, email, password_hash, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      username,
      `${username}@dtnindia.com`,
      hash,
      'DTN System Administrator',
      'superadmin',
      new Date().toISOString()
    ]);
    console.log(`[Admin Security] Administrator "${username}" created successfully.`);
  } else {
    await execute('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, admin.id]);
    console.log(`[Admin Security] Password for administrator "${admin.username}" (ID: ${admin.id}) has been updated.`);
  }

  saveDatabase();
  console.log('[Admin Security] Changes committed to database. Safe to proceed.');
}

rotateAdminPassword().catch((err) => {
  console.error('[Admin Security] Error during password rotation:', err.message);
  process.exit(1);
});
