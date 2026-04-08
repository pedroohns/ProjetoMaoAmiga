const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

//teste de conexao
pool.connect((err, client, release) => {
  if (err) {
    console.error('erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('banco de dados conectado com sucesso!');
    release();
  }
});

module.exports = pool;
