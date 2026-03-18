const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware que verifica se o token JWT é válido
// Adiciona req.usuario com os dados do usuário logado
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login para continuar.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
    }
    req.usuario = payload; // { id, nome, email, tipo }
    next();
  });
}

// Middleware opcional — não bloqueia, mas anexa o usuário se o token existir
function autenticarOpcional(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.usuario = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    req.usuario = err ? null : payload;
    next();
  });
}

module.exports = { autenticar, autenticarOpcional };
