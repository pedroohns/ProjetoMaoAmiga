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
});