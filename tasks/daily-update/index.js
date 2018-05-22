const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

exports.handler = async () => {
  const pool = await new Pool({
    connectionString,
  });

  await new Promise(resolve =>
    pool.query(
      'select * from public."ExpoPushToken" where "isValid" = true',
      (err, res) => {
        console.log(err, res);
        pool.end();
        resolve();
      },
    ),
  );

  return 'daily update done';
};
