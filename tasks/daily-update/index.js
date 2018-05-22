const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const getValidTokens = async () => {
  const pool = await new Pool({ connectionString });
  const { rows } = await pool.query(
    'select * from public."ExpoPushToken" where "isValid" = true',
  );
  pool.end();

  return rows;
};

exports.handler = async () => {
  const validTokens = await getValidTokens();
  console.log('validTokens', validTokens);

  return 'daily update done';
};
