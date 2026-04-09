const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { autenticar } = require('../middleware/auth');

// ============================
// POST /api/beneficiados
// salva o cadastro completo do beneficiado
// ============================
router.post('/', autenticar, async (req, res) => {

  // so beneficiados podem acessar
  if (req.usuario.tipo !== 'beneficiado') {
    return res.status(403).json({ erro: 'Apenas beneficiados podem preencher este cadastro.' });
  }

  const {
    cpf, nascimento, estado_civil,
    telefone,
    cep, cidade, endereco,
    renda_familiar, pessoas_casa, situacao_atual,
    tipos_doacao
  } = req.body;

  // validaçoes basicas
  if (!telefone || !cep || !cidade || !endereco) {
    return res.status(400).json({ erro: 'Telefone, CEP, cidade e endereço são obrigatórios.' });
  }

  const usuarioId = req.usuario.id;

  try {
    // upserte insere ou atualiza se ja existir
    await pool.query(
      `INSERT INTO cadastros_beneficiados
         (usuario_id, cpf, nascimento, estado_civil, telefone, cep, cidade, endereco,
          renda_familiar, pessoas_casa, situacao_atual, tipos_doacao, atualizado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       ON CONFLICT (usuario_id) DO UPDATE SET
         cpf            = EXCLUDED.cpf,
         nascimento     = EXCLUDED.nascimento,
         estado_civil   = EXCLUDED.estado_civil,
         telefone       = EXCLUDED.telefone,
         cep            = EXCLUDED.cep,
         cidade         = EXCLUDED.cidade,
         endereco       = EXCLUDED.endereco,
         renda_familiar = EXCLUDED.renda_familiar,
         pessoas_casa   = EXCLUDED.pessoas_casa,
         situacao_atual = EXCLUDED.situacao_atual,
         tipos_doacao   = EXCLUDED.tipos_doacao,
         atualizado_em  = NOW()`,
      [
        usuarioId,
        cpf || null,
        nascimento || null,
        estado_civil || null,
        telefone,
        cep,
        cidade,
        endereco,
        renda_familiar || null,
        pessoas_casa ? parseInt(pessoas_casa) : null,
        situacao_atual || null,
        tipos_doacao?.length ? tipos_doacao : null
      ]
    );

    // marca cadastro como completo na tabela usuarios
    await pool.query(
      'UPDATE usuarios SET cadastro_completo = TRUE WHERE id = $1',
      [usuarioId]
    );

    // busca dados atualizados do usuario pra retornar pro front
    const resultado = await pool.query(
      'SELECT id, nome, email, tipo, localidade, foto_url, cadastro_completo FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    return res.status(200).json({
      mensagem: 'Cadastro concluído com sucesso!',
      usuario: resultado.rows[0]
    });

  } catch (err) {
    console.error('Erro ao salvar cadastro beneficiado:', err);
    return res.status(500).json({ erro: 'Erro interno ao salvar cadastro.' });
  }
});

// ============================
// GET /api/beneficiados/meu-cadastro
// retorna o cadastro do beneficiado logado
// ============================
router.get('/meu-cadastro', autenticar, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM cadastros_beneficiados WHERE usuario_id = $1',
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ cadastro: null });
    }

    return res.status(200).json({ cadastro: resultado.rows[0] });

  } catch (err) {
    console.error('Erro ao buscar cadastro:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
});

module.exports = router;