// removi o codigo da search-bar porque ela sera posteriormente removida, tambem removi a parte do HTML que continha a search-bar

  //codigo do botao entrar
  window.onload = function() {
  document.querySelector('.entrar').addEventListener('click', function() {
    window.location.href = 'tela-login.html';
  });
};