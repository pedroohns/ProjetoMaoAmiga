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
