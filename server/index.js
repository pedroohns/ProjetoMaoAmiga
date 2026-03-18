const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

// ============================
// MIDDLEWARES GLOBAIS
// ============================
app.use(cors({
  origin: '*', // Em produção, troque pelo domínio do seu front-end
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve os arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================
// ROTAS DA API
// ============================
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// Rota de saúde — útil pra checar se o servidor está de pé
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', mensagem: 'Servidor Mão Amiga rodando!' });
});

// Qualquer outra rota serve o index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ============================
// INICIA O SERVIDOR
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Front-end servido em http://localhost:${PORT}/index.html`);
  console.log(`🔗 API disponível em http://localhost:${PORT}/api`);
});
