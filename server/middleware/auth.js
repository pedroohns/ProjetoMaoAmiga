const jwt = require('jsonwebtoken');
require('dotenv').config();

// middleware que verifica se o JWT é valido
// adiciona req.usuario com os dados do usuario logado
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: "bearer <token>"

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

// middleware opcional — nao bloqueia, mas anexa o usuario se o token existir
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
