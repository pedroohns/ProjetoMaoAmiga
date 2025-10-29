document.addEventListener('DOMContentLoaded', function () {

  const btn = document.getElementById('feedback-btn');
  const box = document.getElementById('feedback-box');
  const close = document.getElementById('close-box');
  const send = document.getElementById('send-feedback');

  if (!btn || !box || !close || !send) {
    console.error('Erro: Algum elemento não foi encontrado. Verifique os IDs no HTML.');
    return;
  }

  box.style.display = 'none';

  btn.addEventListener('click', () => {
    box.style.display = 'block';
  });

  close.addEventListener('click', () => {
    box.style.display = 'none';
  });

  send.addEventListener('click', () => {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const tipo = document.getElementById('tipo').value;
    const mensagem = document.getElementById('mensagem').value.trim();

    let erros = [];

    if (nome.length < 2) erros.push("Nome deve ter pelo menos 2 letras");
    if (!email.includes("@") || !email.includes(".")) erros.push("E-mail inválido");
    if (!tipo) erros.push("Selecione um tipo de mensagem");
    if (mensagem.length < 10) erros.push("Mensagem deve ter pelo menos 10 caracteres");

    if (erros.length > 0) {
      alert("Erros:\n\n" + erros.join("\n"));
      return;
    }

    alert(`Obrigado, ${nome}! Sua mensagem foi enviada. Responderemos em até 24 horas.`);

    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('tipo').value = '';
    document.getElementById('mensagem').value = '';
    box.style.display = 'none';
  });


  btn.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - btn.getBoundingClientRect().left;
    offsetY = touch.clientY - btn.getBoundingClientRect().top;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    btn.style.position = 'fixed';
    btn.style.left = (touch.clientX - offsetX) + 'px';
    btn.style.top = (touch.clientY - offsetY) + 'px';
  }, { passive: true });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
});