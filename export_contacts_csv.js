const fs = require('fs');
const path = require('path');
const { getAllContacts } = require('./db');

const outPath = path.join(__dirname, 'data', 'contacts_export.csv');

function toCSV(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = ['id','name','email','phone','subject','message','date','status'];
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    return '"' + String(v).replace(/"/g, '""') + '"';
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => escape(r[h])).join(','));
  }
  return lines.join('\n');
}

getAllContacts()
  .then(rows => {
    const csv = toCSV(rows);
    fs.writeFileSync(outPath, csv, 'utf8');
    console.log(`Exported ${rows.length} rows to ${outPath}`);
  })
  .catch(err => {
    console.error('Failed to export contacts:', err.message || err);
    process.exit(1);
  });
