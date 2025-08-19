
document.getElementById('formLogin').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.querySelector('input[name="email"]').value.trim();
    const senha = document.querySelector('input[name="senha"]').value.trim();
    const mensagem = document.getElementById('mensagem');

    mensagem.style.color = 'red';
    mensagem.innerHTML = '';

    // Validação de campos vazios
    if (email === '') {
        mensagem.innerHTML = 'Por favor, preencha o email.';
        return;
    }

    // Regex simples para validar email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        mensagem.innerHTML = 'Por favor, insira um email válido.';
        return;
    }

    if (senha === '') {
        mensagem.innerHTML = 'Por favor, preencha a senha.';
        return;
    }

    if (senha.length < 6) {
        mensagem.innerHTML = 'A senha deve ter no mínimo 6 caracteres.';
        return;
    }

    // Se passou na validação
    mensagem.style.color = 'green';
    mensagem.innerHTML = 'Login realizado com sucesso!';

    // Aqui você pode prosseguir, como redirecionar:
    // window.location.href = "pagina-inicial.html";
});