// removi o codigo da search-bar porque ela sera posteriormente removida, tambem removi a parte do HTML que continha a search-bar

//novo codigo para botao entrar
document.addEventListener('DOMContentLoaded', function() {
  const btnEntrar = document.querySelector('.entrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', function() {
      window.location.href = 'tela-login.html';
    });
  }

  //novo codigo para botao criar conta
  const btnCriarConta = document.querySelector('.criar-conta');
  if (btnCriarConta) {
    btnCriarConta.addEventListener('click', function() {
      window.location.href = 'tela-criar-conta.html';
    });
  }

  //codigo pro entrar do menu hamburger
  const btnMobileEntrar = document.querySelector('.mobile-entrar');
  if (btnMobileEntrar) {
    btnMobileEntrar.addEventListener('click', function() {
      window.location.href = 'tela-login.html';
    });
  }

  //codigo do criar conta pro menu hamburger
  const btnMobileCriarConta = document.querySelector('.mobile-criar-conta');
  if (btnMobileCriarConta) {
    btnMobileCriarConta.addEventListener('click', function() {
      window.location.href = 'tela-criar-conta.html';
    });
  }

});

//redirecionamento dos botoes da hero
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
});
