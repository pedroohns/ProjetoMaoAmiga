//máscara para telefone
document.getElementById('telefone').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        e.target.value = value;
    }
});

//envio do formulário
document.getElementById('contatoForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const dados = Object.fromEntries(formData);

    // Aqui você pode adicionar a lógica para enviar os dados para o servidor
    console.log('Dados do contato:', dados);

    alert('Mensagem enviada com sucesso! 🤝\n\nEntraremos em contato em breve. Obrigado por fazer parte da nossa comunidade solidária!');

    // Limpar o formulário
    this.reset();
});

//animação de entrada suave
document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('.contact-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'all 0.5s ease';

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        }, index * 150);
    });
});