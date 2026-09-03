const PAGE_ROUTES = [
  { label: 'Página inicial', url: 'index.html', terms: ['inicio', 'home', 'mão amiga'] },
  { label: 'Doações', url: 'doaçoes.html', terms: ['doacao', 'doações', 'ajuda', 'projetos'] },
  { label: 'Comunidade', url: 'comunidade.html', terms: ['comunidade', 'historias', 'histórias', 'pessoas'] },
  { label: 'Fale Conosco', url: 'fale-conosco.html', terms: ['contato', 'fale conosco', 'mensagem'] },
  { label: 'Autoatendimento', url: 'autoatendimento.html', terms: ['duvida', 'dúvida', 'faq', 'ajuda', 'autoatendimento'] },
  { label: 'Quero doar', url: 'quero-doar.html', terms: ['quero doar', 'oferecer doação', 'doador'] },
  { label: 'Receber doações', url: 'receber-doaçoes.html', terms: ['receber', 'preciso de ajuda', 'pedido'] }
];

const COMMUNITY_SEED = [
  { name: 'Marina', type: 'historia', text: 'Recebi ajuda com alimentos em um momento muito difícil. Hoje tento devolver um pouco desse carinho ajudando outras pessoas.', time: 'Hoje' },
  { name: 'Carlos', type: 'pedido', text: 'Estou arrecadando roupas infantis para duas famílias do meu bairro. Qualquer ajuda é muito bem-vinda.', time: 'Ontem' },
  { name: 'Ana', type: 'voluntario', text: 'Posso ajudar com reforço escolar de matemática aos sábados. Se alguém conhecer uma família que precise, pode me chamar.', time: '2 dias atrás' }
];

function qs(selector, root = document) { return root.querySelector(selector); }
function qsa(selector, root = document) { return [...root.querySelectorAll(selector)]; }

function showToast(message) {
  let toast = qs('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function setupNavigation() {
  const toggle = qs('.mobile-toggle');
  const mobileNav = qs('.mobile-nav');
  toggle?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  qsa('.mobile-nav a').forEach(link => link.addEventListener('click', () => mobileNav?.classList.remove('open')));

  const current = document.body.dataset.page;
  qsa('[data-nav]').forEach(link => {
    if (link.dataset.nav === current) link.classList.add('active');
  });
}

function setupAuthNotice() {
  const buttons = qsa('[data-auth-action]');
  if (!buttons.length) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <span class="card-tag">Frontend em refatoração</span>
      <h3 id="auth-title">Área de conta temporariamente indisponível</h3>
      <p>O back-end antigo foi removido para simplificar o projeto. Entrar e criar conta voltarão quando uma nova solução de autenticação for implementada.</p>
      <div class="modal-actions">
        <button class="secondary-btn" data-close-modal>Fechar</button>
        <a class="primary-btn" href="fale-conosco.html">Fale conosco</a>
      </div>
    </section>`;
  document.body.appendChild(backdrop);

  buttons.forEach(btn => btn.addEventListener('click', () => backdrop.classList.add('open')));
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop || event.target.closest('[data-close-modal]')) backdrop.classList.remove('open');
  });
}

function setupHomeSearch() {
  const input = qs('#site-search');
  const results = qs('#site-search-results');
  const button = qs('#site-search-btn');
  if (!input || !results) return;

  const render = () => {
    const term = input.value.trim().toLowerCase();
    if (!term) {
      results.classList.remove('open');
      results.innerHTML = '';
      return;
    }
    const matches = PAGE_ROUTES.filter(item => [item.label, ...item.terms].some(value => value.toLowerCase().includes(term)));
    results.innerHTML = matches.length
      ? matches.map(item => `<li><a href="${item.url}">${item.label}</a></li>`).join('')
      : '<li><a href="autoatendimento.html">Não encontrou? Abrir autoatendimento</a></li>';
    results.classList.add('open');
  };

  input.addEventListener('input', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const first = qs('a', results);
      if (first) window.location.href = first.href;
    }
  });
  button?.addEventListener('click', () => qs('a', results)?.click());
  document.addEventListener('click', event => {
    if (!event.target.closest('.access-search')) results.classList.remove('open');
  });
}

function setupDonationFilters() {
  const search = qs('#donation-search');
  const cards = qsa('[data-donation-card]');
  const filters = qsa('[data-donation-filter]');
  if (!cards.length) return;

  let active = 'all';
  const apply = () => {
    const term = (search?.value || '').trim().toLowerCase();
    cards.forEach(card => {
      const matchesType = active === 'all' || card.dataset.type === active;
      const matchesText = !term || card.textContent.toLowerCase().includes(term);
      card.style.display = matchesType && matchesText ? '' : 'none';
    });
  };

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    active = btn.dataset.donationFilter;
    apply();
  }));
  search?.addEventListener('input', apply);
}

function readCommunityPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem('maoAmigaCommunityPosts') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

function renderCommunity() {
  const feed = qs('#community-feed');
  if (!feed) return;
  const selected = qs('[data-community-filter].active')?.dataset.communityFilter || 'all';
  const items = [...readCommunityPosts(), ...COMMUNITY_SEED]
    .filter(item => selected === 'all' || item.type === selected);

  feed.innerHTML = items.map((item, index) => `
    <article class="card post-card">
      <div class="post-head">
        <div class="user-line">
          <div class="avatar">${item.name.charAt(0).toUpperCase()}</div>
          <div><strong>${item.name}</strong><small>${item.time || 'Agora'}</small></div>
        </div>
        <span class="card-tag">${({historia:'História',pedido:'Pedido',doacao:'Doação',voluntario:'Voluntário'})[item.type] || 'Comunidade'}</span>
      </div>
      <div class="body">${item.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <div class="post-actions">
        <button type="button" data-like><i class="fa-regular fa-heart"></i> Apoiar</button>
        <button type="button" data-share><i class="fa-solid fa-share-nodes"></i> Compartilhar</button>
      </div>
    </article>`).join('');

  qsa('[data-like]', feed).forEach(btn => btn.addEventListener('click', () => {
    btn.innerHTML = '<i class="fa-solid fa-heart"></i> Apoiado';
    btn.style.color = '#6677ff';
  }));
  qsa('[data-share]', feed).forEach(btn => btn.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Comunidade Mão Amiga', url: location.href });
      else await navigator.clipboard.writeText(location.href);
      showToast('Link da comunidade copiado.');
    } catch {}
  }));
}

function setupCommunity() {
  if (!qs('#community-feed')) return;
  renderCommunity();

  const filters = qsa('[data-community-filter]');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    renderCommunity();
  }));

  qs('#community-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const text = qs('#community-text')?.value.trim();
    const type = qs('#community-type')?.value || 'historia';
    if (!text || text.length < 10) {
      showToast('Escreva pelo menos 10 caracteres.');
      return;
    }
    const saved = readCommunityPosts();
    saved.unshift({ name: 'Visitante', type, text, time: 'Agora' });
    localStorage.setItem('maoAmigaCommunityPosts', JSON.stringify(saved.slice(0, 12)));
    event.currentTarget.reset();
    renderCommunity();
    showToast('Publicação salva neste navegador.');
  });
}

function setupDemoForms() {
  qsa('[data-demo-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.reset();
    showToast('Tudo certo! Este protótipo não envia dados para um servidor.');
  }));
}

function setupFaq() {
  qsa('.faq-card button').forEach(button => button.addEventListener('click', () => {
    button.closest('.faq-card')?.classList.toggle('open');
  }));
}

function chatbotReply(text) {
  const msg = text.toLowerCase();
  if (msg.includes('doar') || msg.includes('doação')) return 'Para oferecer ajuda, abra a página “Quero doar”. Para pedir apoio, use “Receber doações”.';
  if (msg.includes('conta') || msg.includes('login') || msg.includes('entrar')) return 'A área de conta está temporariamente desativada enquanto o back-end é reconstruído.';
  if (msg.includes('comunidade') || msg.includes('publicar')) return 'A Comunidade funciona neste protótipo usando apenas o armazenamento local do navegador.';
  if (msg.includes('contato') || msg.includes('falar')) return 'Você pode usar a página Fale Conosco. O formulário é demonstrativo e não envia dados para um servidor.';
  return 'Posso ajudar com dúvidas sobre doações, comunidade, conta, contato e navegação do site.';
}

function setupChat() {
  const form = qs('#chat-form');
  const input = qs('#chat-input');
  const log = qs('#chat-log');
  if (!form || !input || !log) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    log.insertAdjacentHTML('beforeend', `<div class="chat-message user">${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`);
    input.value = '';
    setTimeout(() => {
      log.insertAdjacentHTML('beforeend', `<div class="chat-message bot">${chatbotReply(text)}</div>`);
      log.scrollTop = log.scrollHeight;
    }, 250);
  });
}

function setupFeedback() {
  const btn = qs('.feedback-btn');
  if (!btn) return;
  btn.addEventListener('click', () => window.location.href = 'fale-conosco.html');
}

function setupHeroButtons() {
  qs('#btn-receber')?.addEventListener('click', () => location.href = 'receber-doaçoes.html');
  qs('#btn-doar')?.addEventListener('click', () => location.href = 'quero-doar.html');
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupAuthNotice();
  setupHomeSearch();
  setupDonationFilters();
  setupCommunity();
  setupDemoForms();
  setupFaq();
  setupChat();
  setupFeedback();
  setupHeroButtons();
});
