const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { autenticar, autenticarOpcional } = require('../middleware/auth');

// ============================
// GET /api/usuarios/:id
// Retorna o perfil público de um usuário
// ============================
router.get('/:id', autenticarOpcional, async (req, res) => {
  const { id } = req.params;
  const quemVe = req.usuario?.id || null;

  try {
    // Dados do usuário
    const resultado = await pool.query(
      `SELECT id, nome, tipo, localidade, foto_url, bio, criado_em
       FROM usuarios WHERE id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = resultado.rows[0];

    // Contadores
    const contadores = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM posts      WHERE usuario_id = $1) AS total_posts,
         (SELECT COUNT(*) FROM seguidores WHERE seguido_id  = $1) AS total_seguidores,
         (SELECT COUNT(*) FROM seguidores WHERE seguidor_id = $1) AS total_seguindo`,
      [id]
    );

    // Verifica se quem está vendo já segue este usuário
    let seguindo = false;
    if (quemVe && quemVe !== parseInt(id)) {
      const seg = await pool.query(
        'SELECT id FROM seguidores WHERE seguidor_id = $1 AND seguido_id = $2',
        [quemVe, id]
      );
      seguindo = seg.rows.length > 0;
    }

    // Posts do usuário
    const posts = await pool.query(
      `SELECT
         p.id, p.tipo, p.conteudo, p.criado_em,
         COUNT(DISTINCT c.id)  AS total_curtidas,
         COUNT(DISTINCT cm.id) AS total_comentarios
       FROM posts p
       LEFT JOIN curtidas    c  ON c.post_id  = p.id
       LEFT JOIN comentarios cm ON cm.post_id = p.id
       WHERE p.usuario_id = $1
       GROUP BY p.id
       ORDER BY p.criado_em DESC`,
      [id]
    );

    return res.status(200).json({
      usuario: {
        ...usuario,
        ...contadores.rows[0],
        seguindo,
      },
      posts: posts.rows,
    });

  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return res.status(500).json({ erro: 'Erro interno ao buscar perfil.' });
  }
});

// ============================
// PUT /api/usuarios/:id
// Edita o próprio perfil (só o dono pode editar)
// ============================
router.put('/:id', autenticar, async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) !== req.usuario.id) {
    return res.status(403).json({ erro: 'Você não pode editar o perfil de outro usuário.' });
  }

  const { nome, bio, localidade } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'O nome não pode estar vazio.' });
  }

  try {
    const resultado = await pool.query(
      `UPDATE usuarios
       SET nome = $1, bio = $2, localidade = $3
       WHERE id = $4
       RETURNING id, nome, email, tipo, localidade, foto_url, bio`,
      [nome.trim(), bio?.trim() || null, localidade?.trim() || null, id]
    );

    const usuarioAtualizado = resultado.rows[0];

    // Atualiza o localStorage do front com os novos dados
    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso!',
      usuario: usuarioAtualizado,
    });

  } catch (err) {
    console.error('Erro ao editar perfil:', err);
    return res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
  }
});

// ============================
// POST /api/usuarios/:id/seguir
// Seguir ou deixar de seguir um usuário
// ============================
router.post('/:id/seguir', autenticar, async (req, res) => {
  const seguidoId  = parseInt(req.params.id);
  const seguidorId = req.usuario.id;

  if (seguidorId === seguidoId) {
    return res.status(400).json({ erro: 'Você não pode seguir a si mesmo.' });
  }

  try {
    const jaSegue = await pool.query(
      'SELECT id FROM seguidores WHERE seguidor_id = $1 AND seguido_id = $2',
      [seguidorId, seguidoId]
    );

    if (jaSegue.rows.length > 0) {
      await pool.query(
        'DELETE FROM seguidores WHERE seguidor_id = $1 AND seguido_id = $2',
        [seguidorId, seguidoId]
      );
      return res.status(200).json({ seguindo: false, mensagem: 'Você deixou de seguir.' });
    } else {
      await pool.query(
        'INSERT INTO seguidores (seguidor_id, seguido_id) VALUES ($1, $2)',
        [seguidorId, seguidoId]
      );
      return res.status(201).json({ seguindo: true, mensagem: 'Seguindo!' });
    }

  } catch (err) {
    console.error('Erro ao seguir:', err);
    return res.status(500).json({ erro: 'Erro interno ao processar.' });
  }
});

module.exports = router;