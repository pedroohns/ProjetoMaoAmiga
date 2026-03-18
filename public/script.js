// ============================================
// SCRIPT.JS — Mão Amiga
// ============================================
// agora ele vai mostrar se voce ta logado ou nao na tela,
// ele vai aparecer seu nome e um botao de sair caso voce esteja logado, se nao, vai aparecer normalmente os botoes
// de entrar e criar conta

document.addEventListener('DOMContentLoaded', function () {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token   = localStorage.getItem('token');

  const authButtons       = document.querySelector('.auth-buttons');
  const mobileAuthButtons = document.querySelector('.mobile-auth-buttons');

  if (usuario && token) {
    // --- USUARIO LOGADO ---

    // desktop
    if (authButtons) {
      authButtons.innerHTML = `
        <div class="usuario-logado">
          <span class="usuario-nome">
            <i class="fa-solid fa-circle-user"></i>
            ${usuario.nome.split(' ')[0]}
          </span>
          <button class="btn-sair" id="btnSair">Sair</button>
        </div>
      `;
    }

    // mobile
    if (mobileAuthButtons) {
      mobileAuthButtons.innerHTML = `
        <span class="mobile-usuario-nome">
          <i class="fa-solid fa-circle-user"></i>
          ${usuario.nome.split(' ')[0]}
        </span>
        <button class="mobile-sair" id="btnSairMobile">Sair</button>
      `;
    }

    // evento de logout desktop e mobile
    document.addEventListener('click', function (e) {
      if (e.target.id === 'btnSair' || e.target.id === 'btnSairMobile') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
      }
    });

  } else {
    // --- USUARIO DESLOGADO ---

    // botao entrar desktop
    const btnEntrar = document.querySelector('.entrar');
    if (btnEntrar) {
      btnEntrar.addEventListener('click', function () {
        window.location.href = 'tela-login.html';
      });
    }

    // botao criar conta desktop
    const btnCriarConta = document.querySelector('.criar-conta');
    if (btnCriarConta) {
      btnCriarConta.addEventListener('click', function () {
        window.location.href = 'tela-criar-conta.html';
      });
    }

    // botao entrar mobile
    const btnMobileEntrar = document.querySelector('.mobile-entrar');
    if (btnMobileEntrar) {
      btnMobileEntrar.addEventListener('click', function () {
        window.location.href = 'tela-login.html';
      });
    }

    // botao criar conta mobile
    const btnMobileCriarConta = document.querySelector('.mobile-criar-conta');
    if (btnMobileCriarConta) {
      btnMobileCriarConta.addEventListener('click', function () {
        window.location.href = 'tela-criar-conta.html';
      });
    }
  }

  // ============================
  // REDIRECIONAMENTO BOTOES DA HERO
  // ============================
  const btnReceber = document.getElementById('btn-receber');
  const btnDoar    = document.getElementById('btn-doar');

  if (btnReceber) {
    btnReceber.addEventListener('click', function () {
      window.location.href = 'receber-doaçoes.html';
    });
  }

  if (btnDoar) {
    btnDoar.addEventListener('click', function () {
      window.location.href = 'quero-doar.html';
    });
  }

});