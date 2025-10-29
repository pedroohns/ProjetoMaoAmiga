document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-criar-conta");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const senha = form.senha.value.trim();
    const confirmarSenha = form.confirmarSenha.value.trim();

    //remove mensagens antigas
    removerErros(form);

    let valido = true;

    if (!nome) {
      mostrarErro(form.nome, "Digite seu nome completo.");
      valido = false;
    } else if (nome.lenght < 3 || !nome.includes(" ")) {
      mostrarErro(form.nome, "Digite seu nome completo (nome e sobrenome).");
      valido = false
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

    if (valido) {
      alert("Conta criada com sucesso!");
      form.reset();
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
