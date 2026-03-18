-- ============================================
-- BANCO DE DADOS — Mão Amiga
-- Execute este script no PostgreSQL para
-- criar todas as tabelas necessárias.
--
-- Como rodar:
--   psql -U postgres -c "CREATE DATABASE mao_amiga;"
--   psql -U postgres -d mao_amiga -f schema.sql
-- ============================================

-- Extensão para UUIDs (opcional, mas mais seguro que IDs sequenciais)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================
-- USUÁRIOS
-- ============================
CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(100)        NOT NULL,
  email       VARCHAR(150)        NOT NULL UNIQUE,
  senha_hash  TEXT                NOT NULL,
  tipo        VARCHAR(20)         NOT NULL DEFAULT 'beneficiado'
                CHECK (tipo IN ('doador', 'beneficiado', 'voluntario')),
  localidade  VARCHAR(100),
  foto_url    TEXT,
  bio         TEXT,
  criado_em   TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================
-- POSTS
-- ============================
CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT                 NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo        VARCHAR(20)         NOT NULL
                CHECK (tipo IN ('historia', 'pedido', 'doacao', 'voluntario')),
  conteudo    TEXT                NOT NULL,
  criado_em   TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================
-- CURTIDAS
-- ============================
CREATE TABLE IF NOT EXISTS curtidas (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT                 NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  post_id     INT                 NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  criado_em   TIMESTAMP           NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, post_id)   -- um usuário só pode curtir um post uma vez
);

-- ============================
-- COMENTÁRIOS
-- ============================
CREATE TABLE IF NOT EXISTS comentarios (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT                 NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  post_id     INT                 NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  conteudo    TEXT                NOT NULL,
  criado_em   TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================
-- SEGUIDORES
-- ============================
CREATE TABLE IF NOT EXISTS seguidores (
  id          SERIAL PRIMARY KEY,
  seguidor_id INT                 NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  seguido_id  INT                 NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em   TIMESTAMP           NOT NULL DEFAULT NOW(),
  UNIQUE (seguidor_id, seguido_id),           -- não pode seguir duas vezes
  CHECK (seguidor_id != seguido_id)           -- não pode seguir a si mesmo
);

-- ============================
-- ÍNDICES (para melhorar performance)
-- ============================
CREATE INDEX IF NOT EXISTS idx_posts_usuario    ON posts(usuario_id);
CREATE INDEX IF NOT EXISTS idx_posts_tipo       ON posts(tipo);
CREATE INDEX IF NOT EXISTS idx_posts_criado_em  ON posts(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_curtidas_post    ON curtidas(post_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_post ON comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_seguidores_seguido ON seguidores(seguido_id);

-- ============================
-- DADOS DE EXEMPLO (opcional)
-- ============================
-- Descomente abaixo para inserir dados de teste

/*
INSERT INTO usuarios (nome, email, senha_hash, tipo, localidade) VALUES
  ('Admin Teste', 'admin@maoamiga.com', '$2b$10$exemplo_hash_nao_usar_em_prod', 'voluntario', 'Volta Redonda, RJ');
*/
