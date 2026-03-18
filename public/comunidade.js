// ============================================
// COMUNIDADE.JS — Mão Amiga
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================
  // MODAL DE NOVO POST
  // ============================
  const overlay = document.getElementById('modalOverlay');
  const btnAbrir = document.getElementById('abrirModal');
  const btnFechar = document.getElementById('fecharModal');
  const trigger = document.querySelector('.novo-post-trigger');

  function abrirModal() {
    overlay.classList.add('ativo');
    document.body.style.overflow = 'hidden';
  }

  function fecharModal() {
    overlay.classList.remove('ativo');
    document.body.style.overflow = '';
  }

  if (trigger) trigger.addEventListener('click', abrirModal);
  if (btnFechar) btnFechar.addEventListener('click', fecharModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharModal();
    });
  }

  // Seleção de tipo no modal
  document.querySelectorAll('.modal-tipo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tipo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Publicar post (demo — sem back-end ainda)
  const btnPublicar = document.querySelector('.modal-publicar');
  if (btnPublicar) {
    btnPublicar.addEventListener('click', () => {
      const texto = document.querySelector('.modal-textarea').value.trim();
      const tipoAtivo = document.querySelector('.modal-tipo-btn.active');
      const tipo = tipoAtivo ? tipoAtivo.dataset.tipo : 'historia';

      if (!texto) {
        document.querySelector('.modal-textarea').style.borderColor = '#ff0000';
        document.querySelector('.modal-textarea').placeholder = 'Escreva algo antes de publicar!';
        return;
      }

      criarPostNoFeed(texto, tipo);
      fecharModal();
      document.querySelector('.modal-textarea').value = '';
    });
  }

  // ============================
  // CRIAR POST NO FEED (demo)
  // ============================
  function criarPostNoFeed(texto, tipo) {
    const feed = document.getElementById('feedPosts');
    const tipoLabels = {
      historia: 'História',
      pedido: 'Pedido',
      doacao: 'Doação',
      voluntario: 'Voluntário'
    };

    const postId = 'novo-' + Date.now();
    const article = document.createElement('article');
    article.className = 'post-card';
    article.dataset.tipo = tipo;
    article.dataset.curtidas = '0';

    article.innerHTML = `
      <div class="post-header">
        <img src="imagens/user.png" alt="Você" class="post-avatar">
        <div class="post-info">
          <div class="post-nome-linha">
            <strong>Você</strong>
            <span class="post-badge voluntario">Você</span>
          </div>
          <span class="post-meta"><i class="fa-solid fa-location-dot"></i> Volta Redonda · agora mesmo</span>
        </div>
        <span class="post-tipo-tag ${tipo}">${tipoLabels[tipo]}</span>
      </div>
      <div class="post-corpo">
        <p>${texto.replace(/\n/g, '<br>')}</p>
      </div>
      <div class="post-acoes">
        <button class="acao-btn curtir" data-id="${postId}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 21s-6.2-5.05-8.4-7.24A5.5 5.5 0 0 1 12 5.5a5.5 5.5 0 0 1 8.4 8.26C18.2 15.95 12 21 12 21z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          <span class="curtidas-count">0</span>
        </button>
        <button class="acao-btn comentar" data-id="${postId}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/></svg>
          <span>0 comentários</span>
        </button>
        <button class="acao-btn compartilhar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/></svg>
          <span>Compartilhar</span>
        </button>
      </div>
      <div class="comentarios-area" id="comentarios-${postId}" style="display:none">
        <div class="novo-comentario">
          <img src="imagens/user.png" alt="" class="comentario-avatar">
          <input type="text" placeholder="Escreva um comentário..." class="input-comentario">
          <button class="btn-enviar-comentario">Enviar</button>
        </div>
      </div>
    `;

    // Inserir no topo do feed com animação
    feed.insertBefore(article, feed.firstChild);
    article.style.animationDelay = '0s';

    // Registrar eventos no novo post
    registrarEventosPost(article);

    // Feedback visual
    mostrarToast('Post publicado!');
  }

  // ============================
  // CURTIDAS
  // ============================
  function registrarCurtida(btn) {
    btn.addEventListener('click', () => {
      const ativo = btn.classList.contains('ativo');
      const contSpan = btn.querySelector('.curtidas-count');
      let count = parseInt(contSpan.textContent);

      if (ativo) {
        btn.classList.remove('ativo');
        contSpan.textContent = count - 1;
      } else {
        btn.classList.add('ativo');
        contSpan.textContent = count + 1;
        // Animação de pulsada
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = '', 200);
      }
    });
  }

  // ============================
  // COMENTÁRIOS
  // ============================
  function registrarComentar(btn) {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const area = document.getElementById('comentarios-' + id);
      if (!area) return;

      const visivel = area.style.display !== 'none';
      area.style.display = visivel ? 'none' : 'flex';
      if (!visivel) {
        const input = area.querySelector('.input-comentario');
        if (input) input.focus();
      }
    });
  }

  function registrarEnviarComentario(btnEnviar) {
    btnEnviar.addEventListener('click', () => {
      const area = btnEnviar.closest('.comentarios-area');
      const input = area.querySelector('.input-comentario');
      const texto = input.value.trim();
      if (!texto) return;

      const novoComentario = document.createElement('div');
      novoComentario.className = 'comentario';
      novoComentario.innerHTML = `
        <img src="imagens/user.png" alt="" class="comentario-avatar">
        <div class="comentario-corpo">
          <strong>Você</strong>
          <p>${texto}</p>
        </div>
      `;

      // Inserir antes do campo de novo comentário
      area.insertBefore(novoComentario, area.querySelector('.novo-comentario'));
      input.value = '';

      // Atualizar contador de comentários
      const postCard = area.closest('.post-card');
      const btnComentar = postCard.querySelector('.acao-btn.comentar span');
      if (btnComentar) {
        const match = btnComentar.textContent.match(/\d+/);
        const atual = match ? parseInt(match[0]) : 0;
        btnComentar.textContent = `${atual + 1} comentários`;
      }
    });

    // Enter para enviar
    const input = btnEnviar.closest('.novo-comentario').querySelector('.input-comentario');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btnEnviar.click();
      });
    }
  }

  // ============================
  // REGISTRAR EVENTOS EM UM POST
  // ============================
  function registrarEventosPost(postCard) {
    postCard.querySelectorAll('.acao-btn.curtir').forEach(registrarCurtida);
    postCard.querySelectorAll('.acao-btn.comentar').forEach(registrarComentar);
    postCard.querySelectorAll('.btn-enviar-comentario').forEach(registrarEnviarComentario);
  }

  // Registrar em todos os posts existentes
  document.querySelectorAll('.post-card').forEach(registrarEventosPost);

  // ============================
  // FILTROS DE TIPO
  // ============================
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtro = btn.dataset.filtro;
      filtrarFeed(filtro);
    });
  });

  function filtrarFeed(filtro) {
    const posts = document.querySelectorAll('.post-card');
    posts.forEach(post => {
      if (filtro === 'todos' || post.dataset.tipo === filtro) {
        post.style.display = '';
        post.style.animation = 'fadeInUp 0.3s ease both';
      } else {
        post.style.display = 'none';
      }
    });
  }

  // ============================
  // ORDENAÇÃO
  // ============================
  document.querySelectorAll('.ordem-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ordem-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ordenarFeed(btn.dataset.ordem);
    });
  });

  function ordenarFeed(ordem) {
    const feed = document.getElementById('feedPosts');
    const posts = Array.from(feed.querySelectorAll('.post-card'));

    if (ordem === 'curtidos') {
      posts.sort((a, b) => parseInt(b.dataset.curtidas) - parseInt(a.dataset.curtidas));
    }
    // 'recentes' já está na ordem padrão do DOM

    posts.forEach(p => feed.appendChild(p));
  }

  // ============================
  // SEGUIR PESSOAS
  // ============================
  document.querySelectorAll('.btn-seguir').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('seguindo')) {
        btn.classList.remove('seguindo');
        btn.textContent = 'Seguir';
      } else {
        btn.classList.add('seguindo');
        btn.textContent = 'Seguindo ✓';
      }
    });
  });

  // ============================
  // TOAST DE NOTIFICAÇÃO
  // ============================
  function mostrarToast(mensagem) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
      background: #111; color: #fff; padding: 12px 24px; border-radius: 100px;
      font-size: 0.9rem; font-weight: 600; z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ============================
  // COMPARTILHAR (Web Share API ou fallback)
  // ============================
  document.addEventListener('click', (e) => {
    if (e.target.closest('.acao-btn.compartilhar')) {
      if (navigator.share) {
        navigator.share({
          title: 'Mão Amiga — Comunidade',
          text: 'Veja essa publicação na comunidade Mão Amiga!',
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          mostrarToast('Link copiado! 🔗');
        }).catch(() => {
          mostrarToast('Link: ' + window.location.href);
        });
      }
    }
  });

});

// Função global para o onclick do HTML
function abrirModalComTipo(tipo) {
  document.getElementById('modalOverlay').classList.add('ativo');
  document.body.style.overflow = 'hidden';
  document.querySelectorAll('.modal-tipo-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tipo === tipo);
  });
  document.querySelector('.modal-textarea').focus();
}