const db = require('../config/database');

async function setActive(email, isActive) {
  try {
    const affected = await db('users').where({ email }).update({ is_active: isActive });
    console.log(`Updated ${affected} user(s) for ${email} -> is_active=${isActive}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating user', err.message);
    process.exit(1);
  }
}

const [,, email, flag] = process.argv;
if (!email || typeof flag === 'undefined') {
  console.error('Usage: node setUserActive.js <email> <true|false>');
  process.exit(2);
}
setActive(email, flag === 'true');
