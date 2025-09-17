

document.getElementById('form-criar-conta').addEventListener('submit', function(e) {
    const senha = this.senha.value;
    const confirmar = this.confirmarSenha.value;
    if (senha !== confirmar) {
        alert('As senhas não coincidem!');
        e.preventDefault();
    }
});