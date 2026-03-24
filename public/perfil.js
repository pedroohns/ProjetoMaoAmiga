const API      = 'https://projetomaoamiga-production.up.railway.app';
const usuario  = JSON.parse(localStorage.getItem('usuario'));
const token    = localStorage.getItem('token');

// pega o ID do perfil pela URL: perfil.html?id=3 
const params   = new URLSearchParams(window.location.search);
const perfilId = params.get('id') || usuario?.id;

document.addEventListener('DOMContentLoaded', () => {
  if (!perfilId) {
    document.getElementById('perfil-conteudo').innerHTML = `
      <div class="perfil-erro">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p>Perfil não encontrado. <a href="index.html">Voltar ao início</a></p>
      </div>
    `;
    return;
  }

  carregarPerfil();
  iniciarModalEditar();
});

// CARREGAR O PERFIL 
async function carregarPerfil() {
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const resposta = await fetch(`${API}/api/usuarios/${perfilId}`, { headers });
    const dados    = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro);
    }

    renderizarPerfil(dados.usuario, dados.posts);

  } catch (err) {
    document.getElementById('perfil-conteudo').innerHTML = `
      <div class="perfil-erro">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p>Erro ao carregar perfil. Tente novamente.</p>
      </div>
    `;
  }
}

// RENDERIZAÇAO DO PERFIL
function renderizarPerfil(perfil, posts) {
  const ehMeuPerfil = usuario && usuario.id === perfil.id;

  const tipoBadge = {
    doador:      'Doador',
    beneficiado: 'Beneficiado',
    voluntario:  'Voluntário'
  };

  const tipoLabels = {
    historia:   'História',
    pedido:     'Pedido',
    doacao:     'Doação',
    voluntario: 'Voluntário'
  };

  // montagem dos posts
  const postsHTML = posts.length === 0
    ? `<div class="perfil-posts-vazio">
         <i class="fa-solid fa-pen-to-square"></i>
         <p>${ehMeuPerfil ? 'Você ainda não publicou nada.' : 'Nenhuma publicação ainda.'}</p>
       </div>`
    : posts.map(post => `
        <div class="perfil-post-card" onclick="window.location.href='comunidade.html'">
          <div class="perfil-post-header">
            <span class="post-tipo-tag ${post.tipo}">${tipoLabels[post.tipo]}</span>
            <span class="perfil-post-tempo">${calcularTempo(post.criado_em)}</span>
          </div>
          <p class="perfil-post-conteudo">${post.conteudo.replace(/\n/g, '<br>')}</p>
          <div class="perfil-post-stats">
            <span><i class="fa-solid fa-heart"></i> ${post.total_curtidas}</span>
            <span><i class="fa-solid fa-comment"></i> ${post.total_comentarios}</span>
          </div>
        </div>
      `).join('');

  // monta botao de açao (editar se for meu perfil, seguir se for de outro)
  const btnAcao = ehMeuPerfil
    ? `<button class="btn-editar-perfil" id="btnAbrirEditar">
         <i class="fa-solid fa-pen"></i> Editar perfil
       </button>`
    : usuario
      ? `<button class="btn-seguir-perfil ${perfil.seguindo ? 'seguindo' : ''}" id="btnSeguirPerfil">
           <i class="fa-solid fa-${perfil.seguindo ? 'check' : 'user-plus'}"></i>
           ${perfil.seguindo ? 'Seguindo' : 'Seguir'}
         </button>`
      : '';

  const dataEntrada = new Date(perfil.criado_em).toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric'
  });

  document.getElementById('perfil-conteudo').innerHTML = `
    <div class="perfil-card">
      <div class="perfil-topo">
        <img src="${perfil.foto_url || 'imagens/user.png'}"
             alt="${perfil.nome}"
             class="perfil-avatar-grande"
             onerror="this.src='imagens/user.png'">
        <div class="perfil-info">
          <div class="perfil-nome-linha">
            <h1>${perfil.nome}</h1>
            <span class="perfil-badge ${perfil.tipo}">${tipoBadge[perfil.tipo] || 'Membro'}</span>
          </div>
          ${perfil.localidade
            ? `<p class="perfil-localidade"><i class="fa-solid fa-location-dot"></i> ${perfil.localidade}</p>`
            : ''}
          ${perfil.bio
            ? `<p class="perfil-bio">${perfil.bio}</p>`
            : ehMeuPerfil ? `<p class="perfil-bio" style="color:#bbb;font-style:italic">Adicione uma bio no seu perfil.</p>` : ''}
          <p class="perfil-membro"><i class="fa-regular fa-calendar"></i> Membro desde ${dataEntrada}</p>
          <div class="perfil-acoes">${btnAcao}</div>
        </div>
      </div>

      <div class="perfil-contadores">
        <div class="contador">
          <strong>${perfil.total_posts}</strong>
          <span>publicações</span>
        </div>
        <div class="contador">
          <strong>${perfil.total_seguidores}</strong>
          <span>seguidores</span>
        </div>
        <div class="contador">
          <strong>${perfil.total_seguindo}</strong>
          <span>seguindo</span>
        </div>
      </div>
    </div>

    <div class="perfil-posts-titulo">
      <i class="fa-solid fa-grid-2"></i>
      Publicações
    </div>
    ${postsHTML}
  `;

  // registra eventos apos renderizar
  const btnEditar = document.getElementById('btnAbrirEditar');
  if (btnEditar) {
    btnEditar.addEventListener('click', () => abrirModalEditar(perfil));
  }

  const btnSeguir = document.getElementById('btnSeguirPerfil');
  if (btnSeguir) {
    btnSeguir.addEventListener('click', () => seguirUsuario(btnSeguir, perfil.id));
  }
}

// SEGUIR/DEIXAR DE SEGUIR
async function seguirUsuario(btn, idAlvo) {
  if (!token) {
    window.location.href = 'tela-login.html';
    return;
  }

  try {
    const resposta = await fetch(`${API}/api/usuarios/${idAlvo}/seguir`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const dados = await resposta.json();

    if (dados.seguindo) {
      btn.classList.add('seguindo');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Seguindo';
    } else {
      btn.classList.remove('seguindo');
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Seguir';
    }

  } catch (err) {
    console.error('Erro ao seguir:', err);
  }
}

// MODAL DE EDIÇAO
function iniciarModalEditar() {
  const modal    = document.getElementById('modalEditar');
  const btnFechar = document.getElementById('fecharModalEditar');

  if (btnFechar) {
    btnFechar.addEventListener('click', () => {
      modal.classList.remove('ativo');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('ativo');
        document.body.style.overflow = '';
      }
    });
  }

  const btnSalvar = document.getElementById('btnSalvarPerfil');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', salvarPerfil);
  }
}

function abrirModalEditar(perfil) {
  document.getElementById('editar-nome').value       = perfil.nome || '';
  document.getElementById('editar-localidade').value = perfil.localidade || '';
  document.getElementById('editar-bio').value        = perfil.bio || '';

  document.getElementById('modalEditar').classList.add('ativo');
  document.body.style.overflow = 'hidden';
}

async function salvarPerfil() {
  const nome       = document.getElementById('editar-nome').value.trim();
  const localidade = document.getElementById('editar-localidade').value.trim();
  const bio        = document.getElementById('editar-bio').value.trim();

  if (!nome) {
    document.getElementById('editar-nome').style.borderColor = '#f472b6';
    return;
  }

  const btnSalvar = document.getElementById('btnSalvarPerfil');
  btnSalvar.disabled = true;
  btnSalvar.textContent = 'Salvando...';

  try {
    const resposta = await fetch(`${API}/api/usuarios/${usuario.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nome, localidade, bio })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || 'Erro ao salvar.');
      return;
    }

    // atualiza o localstorage com os novos dados 
    const usuarioAtualizado = { ...usuario, ...dados.usuario };
    localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

    // fecha o modal e recarrega o perfil
    document.getElementById('modalEditar').classList.remove('ativo');
    document.body.style.overflow = '';
    carregarPerfil();

  } catch (err) {
    alert('Erro de conexão. Tente novamente.');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = 'Salvar';
  }
}

// UTILITARIOS 
function calcularTempo(dataISO) {
  const agora    = new Date();
  const data     = new Date(dataISO);
  const diffSeg  = Math.floor((agora - data) / 1000);
  const diffMin  = Math.floor(diffSeg / 60);
  const diffHora = Math.floor(diffMin / 60);
  const diffDia  = Math.floor(diffHora / 24);

  if (diffSeg < 60)  return 'agora mesmo';
  if (diffMin < 60)  return `${diffMin} min atrás`;
  if (diffHora < 24) return `${diffHora}h atrás`;
  if (diffDia < 7)   return `${diffDia} dias atrás`;
  return data.toLocaleDateString('pt-BR');
}