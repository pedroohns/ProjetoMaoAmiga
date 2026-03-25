const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { autenticar, autenticarOpcional } = require('../middleware/auth');

// GET /api/posts
// lista posts do feed com paginaçao e filtro por tipo
router.get('/', autenticarOpcional, async (req, res) => {
  const { tipo, ordem = 'recentes', pagina = 1, limite = 10 } = req.query;
  const offset = (pagina - 1) * limite;
  const usuarioId = req.usuario?.id || null;

  try {
    const tiposValidos = ['historia', 'pedido', 'doacao', 'voluntario'];
    const filtroTipo = tiposValidos.includes(tipo) ? tipo : null;

    const ordenacao = ordem === 'curtidos'
      ? 'total_curtidas DESC, p.criado_em DESC'
      : 'p.criado_em DESC';

    const query = `
      SELECT
        p.id,
        p.tipo,
        p.conteudo,
        p.criado_em,
        u.id           AS usuario_id,
        u.nome         AS usuario_nome,
        u.tipo         AS usuario_tipo,
        u.localidade   AS usuario_localidade,
        u.foto_url     AS usuario_foto,
        COUNT(DISTINCT c.id)   AS total_curtidas,
        COUNT(DISTINCT cm.id)  AS total_comentarios,
        -- Verifica se o usuário logado já curtiu este post
        CASE WHEN $3::int IS NOT NULL
          THEN EXISTS (
            SELECT 1 FROM curtidas
            WHERE post_id = p.id AND usuario_id = $3
          )
          ELSE false
        END AS curtido_por_mim
      FROM posts p
      JOIN usuarios u ON u.id = p.usuario_id
      LEFT JOIN curtidas  c  ON c.post_id  = p.id
      LEFT JOIN comentarios cm ON cm.post_id = p.id
      WHERE ($1::text IS NULL OR p.tipo = $1)
      GROUP BY p.id, u.id
      ORDER BY ${ordenacao}
      LIMIT $2 OFFSET ${offset}
    `;

    const resultado = await pool.query(query, [filtroTipo, limite, usuarioId]);

    return res.status(200).json({
      posts: resultado.rows,
      pagina: Number(pagina),
      limite: Number(limite),
    });

  } catch (err) {
    console.error('Erro ao buscar posts:', err);
    return res.status(500).json({ erro: 'Erro interno ao buscar posts.' });
  }
});

// POST /api/posts
// cria um novo post (requer login)
router.post('/', autenticar, async (req, res) => {
  const { tipo, conteudo } = req.body;

  if (!conteudo || !conteudo.trim()) {
    return res.status(400).json({ erro: 'O conteúdo do post não pode estar vazio.' });
  }

  const tiposValidos = ['historia', 'pedido', 'doacao', 'voluntario'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo de post inválido.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO posts (usuario_id, tipo, conteudo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.usuario.id, tipo, conteudo.trim()]
    );

    return res.status(201).json({
      mensagem: 'Post publicado com sucesso!',
      post: resultado.rows[0],
    });

  } catch (err) {
    console.error('Erro ao criar post:', err);
    return res.status(500).json({ erro: 'Erro interno ao publicar post.' });
  }
});

// DELETE /api/posts/:id
// remove um post (só o dono pode apagar)
router.delete('/:id', autenticar, async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);

    if (post.rows.length === 0) {
      return res.status(404).json({ erro: 'Post não encontrado.' });
    }

    if (post.rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você não tem permissão para apagar este post.' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    return res.status(200).json({ mensagem: 'Post removido com sucesso.' });

  } catch (err) {
    console.error('Erro ao deletar post:', err);
    return res.status(500).json({ erro: 'Erro interno ao remover post.' });
  }
});

// POST /api/posts/:id/curtir
// curtir ou descurtir um post
router.post('/:id/curtir', autenticar, async (req, res) => {
  const postId = req.params.id;
  const usuarioId = req.usuario.id;

  try {
    // verifica se ja curtiu
    const jaCurtiu = await pool.query(
      'SELECT id FROM curtidas WHERE usuario_id = $1 AND post_id = $2',
      [usuarioId, postId]
    );

    if (jaCurtiu.rows.length > 0) {
      // descurtir
      await pool.query(
        'DELETE FROM curtidas WHERE usuario_id = $1 AND post_id = $2',
        [usuarioId, postId]
      );
      return res.status(200).json({ curtido: false, mensagem: 'Curtida removida.' });
    } else {
      // curtir
      await pool.query(
        'INSERT INTO curtidas (usuario_id, post_id) VALUES ($1, $2)',
        [usuarioId, postId]
      );
      return res.status(201).json({ curtido: true, mensagem: 'Post curtido!' });
    }

  } catch (err) {
    console.error('Erro ao curtir:', err);
    return res.status(500).json({ erro: 'Erro interno ao processar curtida.' });
  }
});

// GET /api/posts/:id/comentarios
// lista comentarios de um post
router.get('/:id/comentarios', async (req, res) => {
  const postId = req.params.id;

  try {
    const resultado = await pool.query(
      `SELECT
         cm.id,
         cm.conteudo,
         cm.criado_em,
         u.id       AS usuario_id,
         u.nome     AS usuario_nome,
         u.foto_url AS usuario_foto,
         u.tipo     AS usuario_tipo
       FROM comentarios cm
       JOIN usuarios u ON u.id = cm.usuario_id
       WHERE cm.post_id = $1
       ORDER BY cm.criado_em ASC`,
      [postId]
    );

    return res.status(200).json({ comentarios: resultado.rows });

  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    return res.status(500).json({ erro: 'Erro interno ao buscar comentários.' });
  }
});

// POST /api/posts/:id/comentarios
// adiciona um comentario (requer login)
router.post('/:id/comentarios', autenticar, async (req, res) => {
  const postId    = req.params.id;
  const { conteudo } = req.body;

  if (!conteudo || !conteudo.trim()) {
    return res.status(400).json({ erro: 'O comentário não pode estar vazio.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO comentarios (usuario_id, post_id, conteudo)
       VALUES ($1, $2, $3)
       RETURNING
         id, conteudo, criado_em`,
      [req.usuario.id, postId, conteudo.trim()]
    );

    return res.status(201).json({
      mensagem: 'Comentário publicado!',
      comentario: {
        ...resultado.rows[0],
        usuario_id:   req.usuario.id,
        usuario_nome: req.usuario.nome,
      }
    });

  } catch (err) {
    console.error('Erro ao comentar:', err);
    return res.status(500).json({ erro: 'Erro interno ao publicar comentário.' });
  }
});

// DELETE /api/posts/:postId/comentarios/:id
// remove um comentario (so o dono pode apagar)
router.delete('/:postId/comentarios/:id', autenticar, async (req, res) => {
  const { id } = req.params;

  try {
    const comentario = await pool.query(
      'SELECT * FROM comentarios WHERE id = $1',
      [id]
    );

    if (comentario.rows.length === 0) {
      return res.status(404).json({ erro: 'Comentário não encontrado.' });
    }

    if (comentario.rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você não tem permissão para apagar este comentário.' });
    }

    await pool.query('DELETE FROM comentarios WHERE id = $1', [id]);

    return res.status(200).json({ mensagem: 'Comentário removido com sucesso.' });

  } catch (err) {
    console.error('Erro ao deletar comentário:', err);
    return res.status(500).json({ erro: 'Erro interno ao remover comentário.' });
  }
});

module.exports = router;