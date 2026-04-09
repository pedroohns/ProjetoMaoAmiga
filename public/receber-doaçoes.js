const API     = 'https://projetomaoamiga-production.up.railway.app';
const usuario = JSON.parse(localStorage.getItem('usuario'));
const token   = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {

  // se nao estiver logado, redireciona pro login
  if (!usuario || !token) {
    window.location.href = 'tela-login.html';
    return;
  }

  // se nao for beneficiado, redireciona pra home
  if (usuario.tipo !== 'beneficiado') {
    window.location.href = 'index.html';
    return;
  }

  // preenche nome e email com dados do usuário logado
  const campoNome  = document.getElementById('nome');
  const campoEmail = document.getElementById('email');
  if (campoNome)  campoNome.value  = usuario.nome  || '';
  if (campoEmail) campoEmail.value = usuario.email || '';

  // tenta carregar cadastro existente pra preencher
  carregarCadastroExistente();

  // busca de CEP
  const campoCep = document.getElementById('cep');
  if (campoCep) {
    campoCep.addEventListener('blur', buscarCep);
  }

  // envio de formulario
  const form = document.getElementById('cadastroForm');
  if (form) {
    form.addEventListener('submit', enviarCadastro);
  }
});

// ============================
// CARREGAR CADASTRO EXISTENTE
// ============================
async function carregarCadastroExistente() {
  try {
    const resposta = await fetch(`${API}/api/beneficiados/meu-cadastro`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!resposta.ok) return;

    const dados = await resposta.json();
    if (!dados.cadastro) return;

    const c = dados.cadastro;

    // preenche os campos com dados existentes
    preencherCampo('cpf',           c.cpf);
    preencherCampo('nascimento',    c.nascimento?.split('T')[0]);
    preencherCampo('estado_civil',  c.estado_civil);
    preencherCampo('telefone',      c.telefone);
    preencherCampo('cep',           c.cep);
    preencherCampo('cidade',        c.cidade);
    preencherCampo('endereco',      c.endereco);
    preencherCampo('renda_familiar', c.renda_familiar);
    preencherCampo('pessoas_casa',  c.pessoas_casa);
    preencherCampo('situacao_atual', c.situacao_atual);

    // marca checkboxes
    if (c.tipos_doacao?.length) {
      c.tipos_doacao.forEach(tipo => {
        const checkbox = document.getElementById(tipo);
        if (checkbox) checkbox.checked = true;
      });
    }

  } catch (err) {
    // silencioso pq pode ser que nao tenha cadastro ainda
  }
}

function preencherCampo(id, valor) {
  const campo = document.getElementById(id);
  if (campo && valor != null) campo.value = valor;
}

// ============================
// BUSCA DE CEP
// ============================
async function buscarCep() {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados    = await resposta.json();
    if (dados.erro) return;

    const campoCidade  = document.getElementById('cidade');
    const campoEndereco = document.getElementById('endereco');

    if (campoCidade && !campoCidade.value)   campoCidade.value  = dados.localidade || '';
    if (campoEndereco && !campoEndereco.value) campoEndereco.value = `${dados.logradouro || ''}, ${dados.bairro || ''}`.replace(/^, |, $/, '');

  } catch (err) {
    // silencioso pq falha na busca de CEP nao é critica, o usuario pode preencher manualmente
  }
}

// ============================
// ENVIAR CADASTRO
// ============================
async function enviarCadastro(e) {
  e.preventDefault();

  const form = e.target;
  const btnSubmit = form.querySelector('.submit-btn');

  // coleta checkboxes de tipo de doaçao
  const tiposDoacao = Array.from(
    form.querySelectorAll('input[name="tipo_doacao[]"]:checked')
  ).map(cb => cb.value);

  const dados = {
    cpf:            form.cpf?.value.trim() || null,
    nascimento:     form.nascimento?.value || null,
    estado_civil:   form.estado_civil?.value || null,
    telefone:       form.telefone?.value.trim(),
    cep:            form.cep?.value.trim(),
    cidade:         form.cidade?.value.trim(),
    endereco:       form.endereco?.value.trim(),
    renda_familiar: form.renda_familiar?.value || null,
    pessoas_casa:   form.pessoas_casa?.value || null,
    situacao_atual: form.situacao_atual?.value.trim() || null,
    tipos_doacao:   tiposDoacao
  };

  // validaçao basica 
  if (!dados.telefone || !dados.cep || !dados.cidade || !dados.endereco) {
    mostrarMensagem('Preencha todos os campos obrigatórios (*).', 'error');
    return;
  }

  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Enviando...';

  try {
    const resposta = await fetch(`${API}/api/beneficiados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagem(resultado.erro || 'Erro ao enviar cadastro.', 'error');
      return;
    }

    // atualiza o localstorage com cadastro_completo = true
    const usuarioAtualizado = { ...usuario, cadastro_completo: true };
    localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

    mostrarMensagem('Cadastro concluído! Bem-vindo à comunidade Mão Amiga! 💙', 'success');

    // redireciona pra home apos 2 segundos
    setTimeout(() => window.location.href = 'index.html', 2000);

  } catch (err) {
    mostrarMensagem('Erro de conexão. Tente novamente.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Finalizar Cadastro';
  }
}

// ============================
// MENSAGEM DE FEEDBACK
// ============================
function mostrarMensagem(texto, tipo) {
  let msg = document.getElementById('msg-feedback');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'msg-feedback';
    msg.style.cssText = `
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      text-align: center;
      margin-top: 16px;
    `;
    const btnSubmit = document.querySelector('.submit-btn');
    btnSubmit.insertAdjacentElement('afterend', msg);
  }

  if (tipo === 'success') {
    msg.style.background = 'rgba(52, 211, 153, 0.15)';
    msg.style.color = '#065f46';
    msg.style.border = '1px solid rgba(52, 211, 153, 0.3)';
  } else {
    msg.style.background = 'rgba(244, 114, 182, 0.12)';
    msg.style.color = '#be185d';
    msg.style.border = '1px solid rgba(244, 114, 182, 0.3)';
  }

  msg.textContent = texto;
  msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}