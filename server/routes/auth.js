const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
require('dotenv').config();

// ============================
// POST /api/auth/cadastro
// Cria um novo usuário
// ============================
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha, tipo, localidade } = req.body;

  // Validações básicas
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const tiposValidos = ['doador', 'beneficiado', 'voluntario'];
  const tipoFinal = tiposValidos.includes(tipo) ? tipo : 'beneficiado';

  try {
    // Verifica se o e-mail já está em uso
    const emailExiste = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Gera o hash da senha (custo 10 = bom equilíbrio segurança/velocidade)
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o usuário no banco
    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo, localidade)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, tipo, localidade, criado_em`,
      [
        nome.trim(),
        email.toLowerCase().trim(),
        senhaHash,
        tipoFinal,
        localidade || null
      ]
    );

    const usuario = resultado.rows[0];

    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      mensagem: 'Conta criada com sucesso!',
      token,
      usuario: {
        id:         usuario.id,
        nome:       usuario.nome,
        email:      usuario.email,
        tipo:       usuario.tipo,
        localidade: usuario.localidade,
        criado_em:  usuario.criado_em,
      }
    });

  } catch (err) {
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor. Tente novamente.' });
  }
});

// ============================
// POST /api/auth/login
// Autentica um usuário existente
// ============================
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Busca o usuário pelo e-mail
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const usuario = resultado.rows[0];

    // Compara a senha com o hash
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      // Mesma mensagem intencional — não revelamos qual dos dois está errado
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id:         usuario.id,
        nome:       usuario.nome,
        email:      usuario.email,
        tipo:       usuario.tipo,
        localidade: usuario.localidade,
        foto_url:   usuario.foto_url,
      }
    });

  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor. Tente novamente.' });
  }
});

// ============================
// GET /api/auth/me
// Retorna os dados do usuário logado
// ============================
const { autenticar } = require('../middleware/auth');

router.get('/me', autenticar, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, tipo, localidade, foto_url, bio, criado_em FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ usuario: resultado.rows[0] });

  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

module.exports = router;
