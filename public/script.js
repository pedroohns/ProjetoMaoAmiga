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
    // USUARIO DESLOGADO
    const btnEntrar = document.querySelector('.entrar');
    if (btnEntrar) btnEntrar.addEventListener('click', () => window.location.href = 'tela-login.html');

    const btnCriarConta = document.querySelector('.criar-conta');
    if (btnCriarConta) btnCriarConta.addEventListener('click', () => window.location.href = 'tela-criar-conta.html');

    const btnMobileEntrar = document.querySelector('.mobile-entrar');
    if (btnMobileEntrar) btnMobileEntrar.addEventListener('click', () => window.location.href = 'tela-login.html');

    const btnMobileCriarConta = document.querySelector('.mobile-criar-conta');
    if (btnMobileCriarConta) btnMobileCriarConta.addEventListener('click', () => window.location.href = 'tela-criar-conta.html');
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