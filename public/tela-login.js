document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const senha = form.senha.value.trim();

    removerErros(form);
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

    if (valido) {
      alert("Login realizado com sucesso!");
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
    input.insertAdjacentElement("afterend", erro);
  }

  function removerErros(form) {
    form.querySelectorAll(".erro").forEach(el => el.remove());
  }
});