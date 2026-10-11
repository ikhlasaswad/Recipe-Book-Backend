const { Pool, types } = require('pg');
require('dotenv').config();

// PostgreSQL بيرجّع COUNT و AVG كنصوص — نحوّلهم لأرقام عشان تطبيق Flutter يقرأهم صح
types.setTypeParser(20, (v) => parseInt(v, 10));   // bigint (COUNT)
types.setTypeParser(1700, (v) => parseFloat(v));    // numeric (AVG)

// Neon بيطلب اتصال مشفّر (SSL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

// PostgreSQL بيستخدم $1, $2 بدل علامة ? — هاي الدالة بتحوّل تلقائياً
// عشان باقي الكود (الكنترولرز) يضل زي ما هو
function convert(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function run(client, sql, params = []) {
  let text = convert(sql);
  const isInsert = /^\s*insert\s/i.test(text);
  // نفس سلوك mysql2: بعد INSERT نرجّع insertId
  if (isInsert && !/returning\s/i.test(text)) text += ' RETURNING id';

  const res = await client.query(text, params);

  if (isInsert) {
    return [{ insertId: res.rows[0] ? res.rows[0].id : null, affectedRows: res.rowCount }];
  }
  if (res.command === 'SELECT') return [res.rows];
  return [{ affectedRows: res.rowCount }];
}

module.exports = {
  query: (sql, params) => run(pool, sql, params),

  // للعمليات اللي بتحتاج Transaction (متل إضافة وصفة مع مكوناتها وخطواتها)
  async getConnection() {
    const client = await pool.connect();
    return {
      query: (sql, params) => run(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release(),
    };
  },
};
