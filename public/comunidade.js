// ============================================
// COMUNIDADE.JS — Mão Amiga
// ===========================================
// que loucura

const API = 'https://projetomaoamiga-production.up.railway.app';

const usuario = JSON.parse(localStorage.getItem('usuario'));
const token   = localStorage.getItem('token');

let filtroAtivo = 'todos';
let ordemAtiva  = 'recentes';

// INICIALIZAÇAO
document.addEventListener('DOMContentLoaded', () => {
  atualizarSidebarPerfil();
  carregarFeed();
  iniciarModal();
  iniciarFiltros();
  iniciarOrdenacao();

  document.querySelectorAll('.btn-seguir').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('seguindo');
      btn.textContent = btn.classList.contains('seguindo') ? 'Seguindo ✓' : 'Seguir';
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.acao-btn.compartilhar')) {
      if (navigator.share) {
        navigator.share({ title: 'Mão Amiga — Comunidade', url: window.location.href }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => mostrarToast('Link copiado!'));
      }
    }
  });
});

// SIDEBAR DO PERFIL
function atualizarSidebarPerfil() {
  if (!usuario) return;
  const nomeEl = document.querySelector('.perfil-nome');
  const btnEl  = document.querySelector('.btn-entrar-perfil');
  if (nomeEl) nomeEl.textContent = usuario.nome.split(' ')[0];
  if (btnEl) { btnEl.textContent = 'Meu perfil'; btnEl.onclick = () => window.location.href = 'perfil.html'; }
}

// CARREGAR FEED
async function carregarFeed() {
  const feed = document.getElementById('feedPosts');
  feed.innerHTML = `<div class="feed-loading"><i class="fa-solid fa-spinner fa-spin"></i><p>Carregando publicações...</p></div>`;

  try {
    const tipo   = filtroAtivo !== 'todos' ? `&tipo=${filtroAtivo}` : '';
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const resposta = await fetch(`${API}/api/posts?ordem=${ordemAtiva}${tipo}`, { headers });
    const dados    = await resposta.json();

    feed.innerHTML = '';

    if (!dados.posts || dados.posts.length === 0) {
      feed.innerHTML = `<div class="feed-vazio"><i class="fa-solid fa-seedling"></i><p>Nenhuma publicação ainda. Seja o primeiro a compartilhar!</p></div>`;
      return;
    }

    dados.posts.forEach(post => {
      const card = criarCardPost(post);
      feed.appendChild(card);
      registrarEventosPost(card, post);
    });

  } catch (err) {
    feed.innerHTML = `<div class="feed-vazio"><i class="fa-solid fa-circle-exclamation"></i><p>Erro ao carregar publicações. Tente novamente.</p></div>`;
  }
}

// CRIAR CARD DE POST
function criarCardPost(post) {
  const tipoLabels     = { historia: 'História', pedido: 'Pedido', doacao: 'Doação', voluntario: 'Voluntário' };
  const tipoBadge      = { doador: 'doador', beneficiado: 'beneficiado', voluntario: 'voluntario' };
  const tipoNome       = { doador: 'Doador', beneficiado: 'Beneficiado', voluntario: 'Voluntário' };
  const tempoPassado   = calcularTempo(post.criado_em);
  const localidade     = post.usuario_localidade || 'Brasil';
  const fotoPerfil     = post.usuario_foto || 'imagens/user.png';
  const jaCurtiu       = post.curtido_por_mim;
  const ehMeuPost      = usuario && usuario.id === post.usuario_id;

  const article = document.createElement('article');
  article.className = 'post-card';
  article.dataset.tipo     = post.tipo;
  article.dataset.curtidas = post.total_curtidas;
  article.dataset.postId   = post.id;

  article.innerHTML = `
    <div class="post-header">
      <img src="${fotoPerfil}" alt="${post.usuario_nome}" class="post-avatar"
           onerror="this.src='imagens/user.png'">
      <div class="post-info">
        <div class="post-nome-linha">
          <strong>${post.usuario_nome}</strong>
          <span class="post-badge ${tipoBadge[post.usuario_tipo] || 'voluntario'}">
            ${tipoNome[post.usuario_tipo] || 'Membro'}
          </span>
        </div>
        <span class="post-meta">
          <i class="fa-solid fa-location-dot"></i> ${localidade} · ${tempoPassado}
        </span>
      </div>
      <div class="post-header-direita">
        <span class="post-tipo-tag ${post.tipo}">${tipoLabels[post.tipo]}</span>
        ${ehMeuPost ? `
          <button class="btn-excluir-post" data-id="${post.id}" title="Excluir post">
            <i class="fa-solid fa-trash"></i>
          </button>` : ''}
      </div>
    </div>
    <div class="post-corpo">
      <p>${post.conteudo.replace(/\n/g, '<br>')}</p>
    </div>
    <div class="post-acoes">
      <button class="acao-btn curtir ${jaCurtiu ? 'ativo' : ''}" data-id="${post.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M12 21s-6.2-5.05-8.4-7.24A5.5 5.5 0 0 1 12 5.5a5.5 5.5 0 0 1 8.4 8.26C18.2 15.95 12 21 12 21z"
            stroke="currentColor" stroke-width="2" ${jaCurtiu ? 'fill="currentColor"' : 'fill="none"'}/>
        </svg>
        <span class="curtidas-count">${post.total_curtidas}</span>
      </button>
      <button class="acao-btn comentar" data-id="${post.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>${post.total_comentarios} comentários</span>
      </button>
      <button class="acao-btn compartilhar">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
          <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
          <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Compartilhar</span>
      </button>
    </div>
    <div class="comentarios-area" id="comentarios-${post.id}" style="display:none">
      <div class="comentarios-lista"></div>
      <div class="novo-comentario">
        <img src="${usuario?.foto_url || 'imagens/user.png'}" alt="" class="comentario-avatar"
             onerror="this.src='imagens/user.png'">
        <input type="text" placeholder="${usuario ? 'Escreva um comentário...' : 'Faça login para comentar'}"
               class="input-comentario" ${!usuario ? 'disabled' : ''}>
        <button class="btn-enviar-comentario" ${!usuario ? 'disabled' : ''}>Enviar</button>
      </div>
    </div>
  `;

  return article;
}

// REGISTRAR EVENTOS EM UM POST
function registrarEventosPost(card, post) {
  card.querySelector('.acao-btn.curtir')?.addEventListener('click', (e) => curtirPost(e.currentTarget, post.id));
  card.querySelector('.acao-btn.comentar')?.addEventListener('click', () => toggleComentarios(post.id));
  card.querySelector('.btn-enviar-comentario')?.addEventListener('click', () => enviarComentario(post.id, card));
  card.querySelector('.input-comentario')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviarComentario(post.id, card); });

  // excluir post
  const btnExcluir = card.querySelector('.btn-excluir-post');
  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => excluirPost(post.id, card));
  }
}

// CURTIR / DESCURTIR
async function curtirPost(btn, postId) {
  if (!usuario || !token) { mostrarToast('Faça login para curtir!'); return; }

  const contSpan = btn.querySelector('.curtidas-count');
  const ativo    = btn.classList.contains('ativo');
  const count    = parseInt(contSpan.textContent);

  btn.classList.toggle('ativo');
  contSpan.textContent = ativo ? count - 1 : count + 1;
  btn.style.transform = 'scale(1.2)';
  setTimeout(() => btn.style.transform = '', 200);

  try {
    await fetch(`${API}/api/posts/${postId}/curtir`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch {
    btn.classList.toggle('ativo');
    contSpan.textContent = count;
    mostrarToast('Erro ao curtir. Tente novamente.');
  }
}

// EXCLUIR POST
async function excluirPost(postId, card) {
  if (!confirm('Tem certeza que deseja excluir este post?')) return;

  try {
    const resposta = await fetch(`${API}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resposta.ok) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(-10px)';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => card.remove(), 300);
      mostrarToast('Post excluído.');
    } else {
      mostrarToast('Erro ao excluir post.');
    }
  } catch {
    mostrarToast('Erro de conexão.');
  }
}

// TOGGLE COMENTARIOS
async function toggleComentarios(postId) {
  const area = document.getElementById(`comentarios-${postId}`);
  if (!area) return;

  if (area.style.display !== 'none') { area.style.display = 'none'; return; }

  area.style.display = 'flex';
  const lista = area.querySelector('.comentarios-lista');

  if (lista && lista.children.length === 0) {
    lista.innerHTML = '<p style="font-size:0.85rem;color:#999;padding:8px 0">Carregando...</p>';

    try {
      const resposta = await fetch(`${API}/api/posts/${postId}/comentarios`);
      const dados    = await resposta.json();
      lista.innerHTML = '';

      if (dados.comentarios.length === 0) {
        lista.innerHTML = '<p style="font-size:0.85rem;color:#999;padding:8px 0">Nenhum comentário ainda.</p>';
        return;
      }

      dados.comentarios.forEach(c => {
        lista.appendChild(criarElementoComentario(c, postId));
      });

    } catch {
      lista.innerHTML = '<p style="font-size:0.85rem;color:#999;padding:8px 0">Erro ao carregar comentários.</p>';
    }
  }

  const input = area.querySelector('.input-comentario');
  if (input && usuario) input.focus();
}

// CRIAR ELEMENTO DE COMENTARIO
function criarElementoComentario(c, postId) {
  const ehMeuComentario = usuario && usuario.id === c.usuario_id;
  const div = document.createElement('div');
  div.className = 'comentario';
  div.dataset.comentarioId = c.id;
  div.innerHTML = `
    <img src="${c.usuario_foto || 'imagens/user.png'}" alt="" class="comentario-avatar"
         onerror="this.src='imagens/user.png'">
    <div class="comentario-corpo">
      <div class="comentario-nome-linha">
        <strong>${c.usuario_nome}</strong>
        ${ehMeuComentario ? `
          <button class="btn-excluir-comentario" title="Excluir comentário">
            <i class="fa-solid fa-trash"></i>
          </button>` : ''}
      </div>
      <p>${c.conteudo}</p>
    </div>
  `;

  // evento de excluir comentario
  const btnExcluir = div.querySelector('.btn-excluir-comentario');
  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => excluirComentario(c.id, postId, div));
  }

  return div;
}

// ENVIAR COMENTARIO
async function enviarComentario(postId, card) {
  if (!usuario || !token) { mostrarToast('Faça login para comentar!'); return; }

  const area      = card.querySelector('.comentarios-area');
  const input     = area.querySelector('.input-comentario');
  const texto     = input.value.trim();
  if (!texto) return;

  const btnEnviar = area.querySelector('.btn-enviar-comentario');
  btnEnviar.disabled = true;
  btnEnviar.textContent = '...';

  try {
    const resposta = await fetch(`${API}/api/posts/${postId}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ conteudo: texto })
    });

    const dados = await resposta.json();
    if (!resposta.ok) { mostrarToast(dados.erro || 'Erro ao comentar.'); return; }

    const lista    = area.querySelector('.comentarios-lista');
    const msgVazia = lista.querySelector('p');
    if (msgVazia) msgVazia.remove();

    // monta comentario com os dados retornados
    const novoComentario = criarElementoComentario({
      id:           dados.comentario.id,
      usuario_id:   usuario.id,
      usuario_nome: usuario.nome,
      usuario_foto: usuario.foto_url || null,
      conteudo:     texto
    }, postId);

    lista.appendChild(novoComentario);
    input.value = '';

    // atualiza contador
    const btnComentar = card.querySelector('.acao-btn.comentar span');
    if (btnComentar) {
      const match = btnComentar.textContent.match(/\d+/);
      const atual = match ? parseInt(match[0]) : 0;
      btnComentar.textContent = `${atual + 1} comentários`;
    }

  } catch { mostrarToast('Erro de conexão.'); }
  finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar';
  }
}

// EXCLUIR COMENTARIO
async function excluirComentario(comentarioId, postId, elemento) {
  if (!confirm('Excluir este comentário?')) return;

  try {
    const resposta = await fetch(`${API}/api/posts/${postId}/comentarios/${comentarioId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resposta.ok) {
      elemento.style.opacity = '0';
      elemento.style.transition = 'opacity 0.2s';
      setTimeout(() => elemento.remove(), 200);
      mostrarToast('Comentário excluído.');

      // atualiza o contador no post
      const card        = document.querySelector(`[data-post-id="${postId}"]`);
      const btnComentar = card?.querySelector('.acao-btn.comentar span');
      if (btnComentar) {
        const match = btnComentar.textContent.match(/\d+/);
        const atual = match ? parseInt(match[0]) : 1;
        btnComentar.textContent = `${Math.max(0, atual - 1)} comentários`;
      }
    } else {
      mostrarToast('Erro ao excluir comentário.');
    }
  } catch { mostrarToast('Erro de conexão.'); }
}

// MODAL DE NOVO POST
function iniciarModal() {
  const overlay   = document.getElementById('modalOverlay');
  const trigger   = document.querySelector('.novo-post-trigger');
  const btnFechar = document.getElementById('fecharModal');

  function abrirModal() {
    if (!usuario) { mostrarToast('Faça login para publicar!'); setTimeout(() => window.location.href = 'tela-login.html', 1500); return; }
    overlay.classList.add('ativo');
    document.body.style.overflow = 'hidden';
  }

  function fecharModal() {
    overlay.classList.remove('ativo');
    document.body.style.overflow = '';
  }

  trigger?.addEventListener('click', abrirModal);
  btnFechar?.addEventListener('click', fecharModal);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) fecharModal(); });

  document.querySelectorAll('.modal-tipo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tipo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelector('.modal-publicar')?.addEventListener('click', () => publicarPost(fecharModal));
}

// PUBLICAR POST
async function publicarPost(fecharModal) {
  const textarea  = document.querySelector('.modal-textarea');
  const tipoAtivo = document.querySelector('.modal-tipo-btn.active');
  const texto     = textarea.value.trim();
  const tipo      = tipoAtivo ? tipoAtivo.dataset.tipo : 'historia';

  if (!texto) { textarea.style.borderColor = '#f472b6'; textarea.placeholder = 'Escreva algo antes de publicar!'; return; }

  const btnPublicar = document.querySelector('.modal-publicar');
  btnPublicar.disabled = true;
  btnPublicar.textContent = 'Publicando...';

  try {
    const resposta = await fetch(`${API}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ tipo, conteudo: texto })
    });

    const dados = await resposta.json();
    if (!resposta.ok) { mostrarToast(dados.erro || 'Erro ao publicar.'); return; }

    fecharModal();
    textarea.value = '';
    mostrarToast('Post publicado!');
    carregarFeed();

  } catch { mostrarToast('Erro de conexão.'); }
  finally { btnPublicar.disabled = false; btnPublicar.textContent = 'Publicar'; }
}

// FILTROS
function iniciarFiltros() {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroAtivo = btn.dataset.filtro;
      carregarFeed();
    });
  });
}

// ORDENAÇAO
function iniciarOrdenacao() {
  document.querySelectorAll('.ordem-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ordem-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ordemAtiva = btn.dataset.ordem;
      carregarFeed();
    });
  });
}

// UTILITARIOS
function calcularTempo(dataISO) {
  const agora   = new Date();
  const data    = new Date(dataISO);
  const diffSeg = Math.floor((agora - data) / 1000);
  const diffMin = Math.floor(diffSeg / 60);
  const diffHora = Math.floor(diffMin / 60);
  const diffDia  = Math.floor(diffHora / 24);

  if (diffSeg < 60)  return 'agora mesmo';
  if (diffMin < 60)  return `${diffMin} min atrás`;
  if (diffHora < 24) return `${diffHora}h atrás`;
  if (diffDia < 7)   return `${diffDia} dias atrás`;
  return data.toLocaleDateString('pt-BR');
}

function mostrarToast(mensagem) {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:12px 24px;border-radius:100px;font-size:0.9rem;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);animation:fadeInUp 0.3s ease;`;
  toast.textContent = mensagem;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function abrirModalComTipo(tipo) {
  if (!usuario) { mostrarToast('Faça login para publicar!'); setTimeout(() => window.location.href = 'tela-login.html', 1500); return; }
  document.getElementById('modalOverlay').classList.add('ativo');
  document.body.style.overflow = 'hidden';
  document.querySelectorAll('.modal-tipo-btn').forEach(b => b.classList.toggle('active', b.dataset.tipo === tipo));
  document.querySelector('.modal-textarea').focus();
}