//novo codigo para botao entrar
document.addEventListener('DOMContentLoaded', function () {
  const btnEntrar = document.querySelector('.entrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', function () {
      window.location.href = 'tela-login.html';
    });
  }

  //novo codigo para botao criar conta
  const btnCriarConta = document.querySelector('.criar-conta');
  if (btnCriarConta) {
    btnCriarConta.addEventListener('click', function () {
      window.location.href = 'tela-criar-conta.html';
    });
  }

  //codigo pro entrar do menu hamburger
  const btnMobileEntrar = document.querySelector('.mobile-entrar');
  if (btnMobileEntrar) {
    btnMobileEntrar.addEventListener('click', function () {
      window.location.href = 'tela-login.html';
    });
  }

  //codigo do criar conta pro menu hamburger
  const btnMobileCriarConta = document.querySelector('.mobile-criar-conta');
  if (btnMobileCriarConta) {
    btnMobileCriarConta.addEventListener('click', function () {
      window.location.href = 'tela-criar-conta.html';
    });
  }

});

//apenas um teste, "validaçao" para os cards de doação
function selectAmount(button, amount) {
  const card = button.closest('.donation-card');
  const buttons = card.querySelectorAll('.amount-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));

  button.classList.add('selected');

  const customInput = card.querySelector('.custom-amount');
  customInput.value = '';
}

function donate(type) {
  let cardIndex;
  switch (type) {
    case 'unica': cardIndex = 0; break;
    case 'mensal': cardIndex = 1; break;
    case 'projeto': cardIndex = 2; break;
  }

  const card = document.querySelectorAll('.donation-card')[cardIndex];
  const selectedBtn = card.querySelector('.amount-btn.selected');
  const customAmount = card.querySelector('.custom-amount').value;

  let amount;
  if (customAmount) {
    amount = customAmount;
  } else if (selectedBtn) {
    amount = selectedBtn.textContent.replace('R$ ', '');
  }
  if (amount) {
    alert(`Obrigado por escolher doar R$ ${amount} - ${type}!`);
  } else {
    alert('Por favor, selecione um valor para doar.');
  }
}
