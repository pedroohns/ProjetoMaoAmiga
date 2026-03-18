const API = 'https://projetomaoamiga-production.up.railway.app';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-criar-conta");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome          = form.nome.value.trim();
    const email         = form.email.value.trim();
    const senha         = form.senha.value.trim();
    const confirmarSenha = form.confirmarSenha.value.trim();
    const tipo          = form.tipo ? form.tipo.value : 'beneficiado';

    removerErros(form);

    let valido = true;

    if (!nome) {
      mostrarErro(form.nome, "Digite seu nome completo.");
      valido = false;
    } else if (nome.length < 3 || !nome.includes(" ")) {
      mostrarErro(form.nome, "Digite seu nome completo (nome e sobrenome).");
      valido = false;
    }

    if (!email) {
      mostrarErro(form.email, "Digite seu e-mail.");
      valido = false;
    } else if (!validarEmail(email)) {
      mostrarErro(form.email, "Digite um e-mail válido.");
      valido = false;
    }

    if (!senha) {
      mostrarErro(form.senha, "Digite uma senha.");
      valido = false;
    } else if (senha.length < 6) {
      mostrarErro(form.senha, "A senha deve ter pelo menos 6 caracteres.");
      valido = false;
    }

    if (!confirmarSenha) {
      mostrarErro(form.confirmarSenha, "Confirme sua senha.");
      valido = false;
    } else if (senha !== confirmarSenha) {
      mostrarErro(form.confirmarSenha, "As senhas não coincidem.");
      valido = false;
    }

    if (!valido) return;

    // Desabilita o botão durante a requisição
    const btnCriar = form.querySelector('.btn-register');
    btnCriar.disabled = true;
    btnCriar.textContent = 'Criando conta...';

    try {
      const resposta = await fetch(`${API}/api/auth/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        // Erro vindo da API (ex: e-mail já cadastrado)
        mostrarMensagem(dados.erro || 'Erro ao criar conta.', 'red');
        return;
      }

      // Salva o token e dados do usuário no localStorage
      localStorage.setItem('token', dados.token);
      localStorage.setItem('usuario', JSON.stringify(dados.usuario));

      // Redireciona para a página inicial
      window.location.href = 'index.html';

    } catch (err) {
      mostrarMensagem('Erro de conexão. Tente novamente.', 'red');
    } finally {
      btnCriar.disabled = false;
      btnCriar.textContent = 'Criar Conta';
    }
  });

  function mostrarMensagem(texto, cor) {
    let msg = document.getElementById('mensagem-cadastro');
    if (!msg) {
      msg = document.createElement('p');
      msg.id = 'mensagem-cadastro';
      form.appendChild(msg);
    }
    msg.textContent = texto;
    msg.style.color = cor;
    msg.style.marginTop = '12px';
    msg.style.textAlign = 'center';
    msg.style.fontSize = '14px';
  }

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