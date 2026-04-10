// ============================================
// SCRIPT.JS - Mão Amiga
// ============================================
// agora ele vai mostrar se voce ta logado ou nao na tela,
// ele vai aparecer seu nome e um botao de sair caso voce esteja logado, se nao, vai aparecer normalmente os botoes de entrar e criar conta
// tambem tem o redirecionamento dos botoes do hero, para as paginas de receber doaçoes e doar
// e o script do menu mobile, que mostra o menu quando clica no icone e esconde quando clica fora ou no icone novamente
// vamos ver se vai dar certo, se nao der, conserto depois, o importante é ter um script basico pra trabalhar e ir melhorando aos poucos
// antes tinha dado certo, entao vamos ver como vai se sair agora 

document.addEventListener('DOMContentLoaded', function () {

  // NAV ATIVO - marca o link da página atual
  const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const nomePagina = href.split('/').pop();
    if (nomePagina === paginaAtual) {
      link.classList.add('active');
    }
  });

  // HEADER DINAMICO
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token   = localStorage.getItem('token');

  const authButtons       = document.querySelector('.auth-buttons');
  const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');

  if (usuario && token) {
    // USUARIO LOGADO
    const primeiroNome = usuario.nome.split(' ')[0];
    const fotoUrl      = usuario.foto_url || null;
    const perfilHref   = `perfil.html`;

    // avatar: foto real ou inicial do nome
    const avatarHTML  = fotoUrl ? `<img src="${fotoUrl}" alt="${primeiroNome}" class="header-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : '';
    const inicialHTML = `<span class="header-avatar-inicial" ${fotoUrl ? 'style="display:none"' : ''}>${primeiroNome.charAt(0).toUpperCase()}</span>`;

    // desktop
    if (authButtons) {
      authButtons.innerHTML = `
        <div class="usuario-logado">
          <a href="${perfilHref}" class="usuario-perfil-link">
            <div class="header-avatar">
              ${avatarHTML}
              ${inicialHTML}
            </div>
            <span class="usuario-nome">${primeiroNome}</span>
          </a>
          <button class="btn-sair" id="btnSair">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            Sair
          </button>
        </div>
      `;
    }

    // mobile
    if (mobileAuthButtons) {
      mobileAuthButtons.innerHTML = `
        <a href="${perfilHref}" class="mobile-usuario-link">
          <div class="header-avatar header-avatar-sm">
            ${fotoUrl ? `<img src="${fotoUrl}" alt="${primeiroNome}" class="header-avatar-img">` : ''}
            <span class="header-avatar-inicial" ${fotoUrl ? 'style="display:none"' : ''}>${primeiroNome.charAt(0).toUpperCase()}</span>
          </div>
          <span>${primeiroNome}</span>
        </a>
        <button class="mobile-sair" id="btnSairMobile">Sair</button>
      `;
    }

    // logout
    document.addEventListener('click', function (e) {
      if (e.target.closest('#btnSair') || e.target.closest('#btnSairMobile')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
      }
    });

  } else {
    // USUARIO DESLOGADO - login inline + modal de cadastro
    const btnEntrar = document.querySelector('.entrar');
    if (btnEntrar) btnEntrar.addEventListener('click', (e) => { e.stopPropagation(); toggleLoginPopover(); });

    const btnCriarConta = document.querySelector('.criar-conta');
    if (btnCriarConta) btnCriarConta.addEventListener('click', (e) => { e.stopPropagation(); abrirModalCadastro(); });

    const btnMobileEntrar = document.querySelector('.mobile-entrar');
    if (btnMobileEntrar) btnMobileEntrar.addEventListener('click', () => window.location.href = 'tela-login.html');

    const btnMobileCriarConta = document.querySelector('.mobile-criar-conta');
    if (btnMobileCriarConta) btnMobileCriarConta.addEventListener('click', () => abrirModalCadastro());

    // fecha o popover ao clicar fora
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('login-popover');
      if (popover && !popover.contains(e.target) && !e.target.closest('.entrar')) {
        fecharLoginPopover();
      }
    });
  }

  // REDIRECIONAMENTO BOTOES HERO
  const btnReceber = document.getElementById('btn-receber');
  const btnDoar    = document.getElementById('btn-doar');

  if (btnReceber) btnReceber.addEventListener('click', () => window.location.href = 'receber-doa%C3%A7oes.html');
  if (btnDoar)    btnDoar.addEventListener('click',    () => window.location.href = 'quero-doar.html');

  // BANNER do beneficiado com cadastro incompleto
  if (usuario && token && usuario.tipo === 'beneficiado' && !usuario.cadastro_completo) {
    const paginaAtual = window.location.pathname.split('/').pop();
    const paginasIgnoradas = ['receber-doa%C3%A7oes.html', 'tela-login.html', 'tela-criar-conta.html'];

    if (!paginasIgnoradas.includes(paginaAtual)) {
      const banner = document.createElement('div');
      banner.id = 'banner-cadastro';
      banner.innerHTML = `
        <i class="fa-solid fa-circle-info"></i>
        <span>Complete seu cadastro para ter acesso às doações disponíveis para você!</span>
        <a href="receber-doa%C3%A7oes.html">Completar agora</a>
        <button onclick="document.getElementById('banner-cadastro').remove()" title="Fechar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      document.body.appendChild(banner);
    }
  }
});
// ============================================
// LOGIN POPOVER (inline no header)
// ============================================
const API = 'https://projetomaoamiga-production.up.railway.app';

function toggleLoginPopover() {
  const existente = document.getElementById('login-popover');
  if (existente) { fecharLoginPopover(); return; }

  const btnEntrar = document.querySelector('.entrar');
  if (!btnEntrar) return;

  const rect = btnEntrar.getBoundingClientRect();

  const popover = document.createElement('div');
  popover.id = 'login-popover';
  popover.innerHTML = `
    <p class="popover-titulo">Entrar na sua conta</p>
    <input type="email" id="pop-email" placeholder="E-mail" autocomplete="email">
    <input type="password" id="pop-senha" placeholder="Senha" autocomplete="current-password">
    <div id="pop-erro"></div>
    <button id="pop-btn-entrar">Entrar</button>
    <div class="popover-links">
      <a href="tela-criar-conta.html">Criar conta</a>
      <span>·</span>
      <a href="#">Esqueci a senha</a>
    </div>
  `;

  document.body.appendChild(popover);

  // posicionado abaixo do botao
  const top  = rect.bottom + window.scrollY + 10;
  const left = rect.right  + window.scrollX - popover.offsetWidth;
  popover.style.top  = `${top}px`;
  popover.style.left = `${Math.max(12, left)}px`;

  // reposiciona apos render (offsetWidth so tem valor depois de renderizado)
  requestAnimationFrame(() => {
    const l = rect.right + window.scrollX - popover.offsetWidth;
    popover.style.left = `${Math.max(12, l)}px`;
  });

  document.getElementById('pop-email').focus();

  // enter para submeter
  popover.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') fazerLoginPopover(); });
  });

  document.getElementById('pop-btn-entrar').addEventListener('click', fazerLoginPopover);
}

function fecharLoginPopover() {
  const p = document.getElementById('login-popover');
  if (p) { p.style.opacity = '0'; p.style.transform = 'translateY(-8px)'; setTimeout(() => p.remove(), 180); }
}

async function fazerLoginPopover() {
  const email = document.getElementById('pop-email').value.trim();
  const senha = document.getElementById('pop-senha').value.trim();
  const erroEl = document.getElementById('pop-erro');
  const btn    = document.getElementById('pop-btn-entrar');

  if (!email || !senha) { erroEl.textContent = 'Preencha e-mail e senha.'; return; }

  btn.disabled = true;
  btn.textContent = 'Entrando...';
  erroEl.textContent = '';

  try {
    const resposta = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      erroEl.textContent = dados.erro || 'E-mail ou senha incorretos.';
      btn.disabled = false;
      btn.textContent = 'Entrar';
      return;
    }

    localStorage.setItem('token', dados.token);
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
    window.location.reload();

  } catch {
    erroEl.textContent = 'Erro de conexão.';
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

// ============================================
// MODAL DE CADASTRO
// ============================================
function abrirModalCadastro() {
  if (document.getElementById('modal-cadastro')) return;

  const overlay = document.createElement('div');
  overlay.id = 'modal-cadastro';
  overlay.innerHTML = `
    <div class="modal-cadastro-card" id="modal-cadastro-card">
      <div class="modal-cadastro-header">
        <img src="imagens/logo-blue.png" alt="Mão Amiga" class="modal-logo">
        <button class="modal-cadastro-fechar" id="fechar-modal-cadastro">&times;</button>
      </div>
      <h2>Criar sua conta</h2>
      <p class="modal-cadastro-sub">Faça parte da comunidade Mão Amiga</p>
      <form id="form-cadastro-modal">
        <input type="text" name="nome" placeholder="Nome completo" required>
        <input type="email" name="email" placeholder="E-mail" required>
        <input type="password" name="senha" placeholder="Senha (mín. 6 caracteres)" required>
        <input type="password" name="confirmarSenha" placeholder="Confirmar senha" required>
        <select name="tipo" required>
          <option value="" disabled selected>Como você quer participar?</option>
          <option value="beneficiado">Preciso de ajuda</option>
          <option value="doador">Quero doar</option>
          <option value="voluntario">Quero ser voluntário</option>
        </select>
        <div id="modal-cadastro-erro"></div>
        <button type="submit" class="modal-cadastro-btn">Criar Conta</button>
      </form>
      <p class="modal-cadastro-login">Já tem conta? <a href="#" id="ir-para-login">Entrar</a></p>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('ativo'));

  document.getElementById('fechar-modal-cadastro').addEventListener('click', fecharModalCadastro);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModalCadastro(); });

  document.getElementById('ir-para-login').addEventListener('click', (e) => {
    e.preventDefault();
    fecharModalCadastro();
    setTimeout(toggleLoginPopover, 200);
  });

  document.getElementById('form-cadastro-modal').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form    = e.target;
    const nome    = form.nome.value.trim();
    const email   = form.email.value.trim();
    const senha   = form.senha.value.trim();
    const confirmar = form.confirmarSenha.value.trim();
    const tipo    = form.tipo.value;
    const erroEl  = document.getElementById('modal-cadastro-erro');
    const btn     = form.querySelector('.modal-cadastro-btn');

    erroEl.textContent = '';

    if (!nome || nome.length < 3 || !nome.includes(' ')) {
      erroEl.textContent = 'Digite seu nome completo (nome e sobrenome).'; return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      erroEl.textContent = 'Digite um e-mail válido.'; return;
    }
    if (!senha || senha.length < 6) {
      erroEl.textContent = 'A senha deve ter pelo menos 6 caracteres.'; return;
    }
    if (senha !== confirmar) {
      erroEl.textContent = 'As senhas não coincidem.'; return;
    }
    if (!tipo) {
      erroEl.textContent = 'Selecione como você quer participar.'; return;
    }

    btn.disabled = true;
    btn.textContent = 'Criando conta...';

    try {
      const resposta = await fetch(`${API}/api/auth/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        erroEl.textContent = dados.erro || 'Erro ao criar conta.';
        btn.disabled = false;
        btn.textContent = 'Criar Conta';
        return;
      }

      localStorage.setItem('token', dados.token);
      localStorage.setItem('usuario', JSON.stringify(dados.usuario));

      if (tipo === 'beneficiado') {
        window.location.href = 'receber-doa%C3%A7oes.html';
      } else {
        window.location.reload();
      }

    } catch {
      erroEl.textContent = 'Erro de conexão. Tente novamente.';
      btn.disabled = false;
      btn.textContent = 'Criar Conta';
    }
  });
}

function fecharModalCadastro() {
  const overlay = document.getElementById('modal-cadastro');
  if (!overlay) return;
  overlay.classList.remove('ativo');
  setTimeout(() => overlay.remove(), 250);
  document.body.style.overflow = '';
}