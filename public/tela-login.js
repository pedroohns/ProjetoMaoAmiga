const API = 'https://projetomaoamiga-production.up.railway.app';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");
  const mensagemEl = document.getElementById("mensagem");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const senha = form.senha.value.trim();

    removerErros(form);
    mensagemEl.textContent = '';
    mensagemEl.className = '';

    let valido = true;

    if (!email) {
      mostrarErro(form.email, "Digite seu e-mail.");
      valido = false;
    } else if (!validarEmail(email)) {
      mostrarErro(form.email, "Digite um e-mail válido.");
      valido = false;
    }

    if (!senha) {
      mostrarErro(form.senha, "Digite sua senha.");
      valido = false;
    } else if (senha.length < 6) {
      mostrarErro(form.senha, "A senha deve ter no mínimo 6 caracteres.");
      valido = false;
    }

    if (!valido) return;

    // Desabilita o botão durante a requisição
    const btnLogin = form.querySelector('.btn-login');
    btnLogin.disabled = true;
    btnLogin.textContent = 'Entrando...';

    try {
      const resposta = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        // Erro vindo da API (ex: senha errada)
        mensagemEl.textContent = dados.erro || 'Erro ao fazer login.';
        mensagemEl.style.color = 'red';
        mensagemEl.style.marginTop = '12px';
        mensagemEl.style.textAlign = 'center';
        return;
      }

      // Salva o token e dados do usuário no localStorage
      localStorage.setItem('token', dados.token);
      localStorage.setItem('usuario', JSON.stringify(dados.usuario));

      // Redireciona para a página inicial
      window.location.href = 'index.html';

    } catch (err) {
      mensagemEl.textContent = 'Erro de conexão. Tente novamente.';
      mensagemEl.style.color = 'red';
      mensagemEl.style.marginTop = '12px';
      mensagemEl.style.textAlign = 'center';
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Entrar';
    }
  });

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function mostrarErro(input, mensagem) {
    let erro = document.createElement("small");
    erro.classList.add("erro");
    erro.textContent = mensagem;
    erro.style.color = "red";
    erro.style.display = "block";
    erro.style.marginTop = "4px";
    input.insertAdjacentElement("afterend", erro);
  }

  function removerErros(form) {
    form.querySelectorAll(".erro").forEach(el => el.remove());
  }
});