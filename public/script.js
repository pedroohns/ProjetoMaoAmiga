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
});

//novo codigo para botao entrar
document.addEventListener('DOMContentLoaded', function () {
  const btnEntrar = document.querySelector('.entrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', function () {
      window.location.href = 'login.html';
    });
  }

  //novo codigo para botao criar conta
  const btnCriarConta = document.querySelector('.criar-conta');
  if (btnCriarConta) {
    btnCriarConta.addEventListener('click', function () {
      window.location.href = 'criar-conta.html';
    });
  }

  //codigo pro entrar do menu hamburger
  const btnMobileEntrar = document.querySelector('.mobile-entrar');
  if (btnMobileEntrar) {
    btnMobileEntrar.addEventListener('click', function () {
      window.location.href = 'login.html';
    });
  }

  //codigo do criar conta pro menu hamburger
  const btnMobileCriarConta = document.querySelector('.mobile-criar-conta');
  if (btnMobileCriarConta) {
    btnMobileCriarConta.addEventListener('click', function () {
      window.location.href = 'criar-conta.html';
    });
  }

});

/* //redirecionamento dos botoes da hero
document.addEventListener("DOMContentLoaded", function () {
  const btnReceber = document.getElementById("btn-receber");
  const btnDoar = document.getElementById("btn-doar");

  //redirecionamento do receber doaçoes
  if (btnReceber) {
    btnReceber.addEventListener("click", function () {
      window.location.href = "receber-doaçoes.html";
    });
  }

  //redirecionamento do quero doar
  if (btnDoar) {
    btnDoar.addEventListener("click", function () {
      window.location.href = "quero-doar.html";
    });
  }
}); */

//toda essa seção que está comentada, é algo que tinha no site antigamente, eu vou refazer os html e css com essa base, e a base do redirecionamento serão as mesmas.