//codigo da search bar

  document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll('.btn');
    const searchBar = document.querySelector('.search-bar');

    buttons.forEach(button => {
      button.addEventListener('click', function () {
        // remove o active de todos
        buttons.forEach(b => b.classList.remove('active'));

        // quando clicar, ele mantem 
        this.classList.add('active');

        // se for o verde, mostra a search bar (tera de ser feito para outros botoes posteriormente - como? n sei ainda)
        if (this.classList.contains('green')) {
          searchBar.style.display = 'flex';
        } else {
          searchBar.style.display = 'none';
        }
        
      });
    });
  });

  //codigo do botao entrar
  window.onload = function() {
  document.querySelector('.entrar').addEventListener('click', function() {
    window.location.href = 'tela-login.html';
  });
};


//remover esse arquivo de JS caso nao seja permitido o uso de JS nessa parte do projeto ainda... esse JS nao faz nada de mais, ele so faz com que o botao verde mostre a search bar que ja esta pronta (no caso, terao outras search bars para os outros botoes, mas isso sera feito depois)

// caso seja permitido apenas a fins de demonstraç~ao, a homepage vai ficar levemente "fiel" ao prototipo, ja que no prototipo a search bar verde aparece quando o botao verde esta selecionado.

// IMPORTANTE: o que ta nesse JS nao foi ensinado em sala de aula ainda nas aulas do CADU, entao SIM, eu USEI IA pra fazer esse JS e implementar no html/css, as partes referentes ao JS estao marcadas com comentarios pra serem possivelmente apagadas depois, caso nao seja permitido o uso de JS nessa parte do projeto ainda.
  
// caso seja removido, alterar o display da search bar no CSS para FLEX, assim ja vai aparecer a searchbar verde no bgl, sem selecionar nada

//tudo que precisa ser removido caso nao seja permitido o uso de JS, esta marcado com um comentario especificando, tanto no HTML, quanto no CSS