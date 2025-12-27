const { getAllContacts } = require('./db');
(async () => {
  try {
    const rows = await getAllContacts();
    console.log('CONTACTS:', rows);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
})();
