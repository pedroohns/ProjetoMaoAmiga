//dados das doações
const donations = [
  { id: 1, type: 'donation', title: 'Cestas Básicas - Centro', qty: 12, desc: 'Cestas com alimentos básicos, prontas para retirada no centro.', tags: ['Alimentação', 'Urgente'], img: 'imagens/cesta-basica.jpeg' },
  { id: 2, type: 'donation', title: 'Roupas Infantis', qty: 34, desc: 'Doação de roupas para crianças de 0-6 anos. Muitas peças novas.', tags: ['Roupas', 'Infantil'], img: 'imagens/roupas.jpeg' },
  { id: 3, type: 'donation', title: 'Produtos de Higiene', qty: 48, desc: 'Sabonetes, shampoo e itens de higiene pessoal.', tags: ['Higiene'], img: 'imagens/limpeza.jpeg' }
];

//dados dos projetos sociais 
const projects = [
  { id: 101, type: 'project', title: 'Refeição Solidária', location: 'Bairro São José', desc: 'Projeto que oferece jantares comunitários 3x por semana.', tags: ['Alimentação', 'Voluntariado'], img: 'imagens/marmita.jpeg' },
  { id: 102, type: 'project', title: 'Oficina de Alfabetização', location: 'Comunidade Vale Verde', desc: 'Aulas para crianças e adultos que não tiveram acesso à escola.', tags: ['Educação', 'Comunidade'], img: 'imagens/alfabetizaçao.jpeg' },
  { id: 103, type: 'project', title: 'Escola de Judo', location: 'Unidade Volta Redonda', desc: 'Escola de judo 3x por semana com Professor Renato.', tags: ['Arte Marcial', 'Defesa Pessoal'], img: 'imagens/judo.jpeg' }
];

function makeCard(item) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
      <div class="media">
        ${item.img ? `<img src="${escapeHtml(item.img)}" alt="imagem">` : placeholderSVG(item)}
      </div>
      <div class="body">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.desc)}</p>
        <div class="tags">${item.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>
      <div class="card-footer">
        <div class="small">${item.type === 'donation' ? ('Quantidade: ' + (item.qty || 0)) : (item.location || '—')}</div>
        <button class="primary-action" onclick="openModal(${item.id})">Ver</button>
      </div>
    `;
  el.dataset.type = item.type;
  el.dataset.id = item.id;
  return el;
}

function placeholderSVG(item) {
  if (item.type === 'donation') {
    return `<svg width=120 height=80 viewBox='0 0 120 80' xmlns='http://www.w3.org/2000/svg'><rect rx='8' width='120' height='80' fill='rgba(91,109,240,0.06)'></rect><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='rgba(11,20,40,0.5)'>Doação</text></svg>`;
  }
  return `<svg width=120 height=80 viewBox='0 0 120 80' xmlns='http://www.w3.org/2000/svg'><rect rx='8' width='120' height='80' fill='rgba(246,196,66,0.06)'></rect><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='rgba(11,20,40,0.5)'>Projeto</text></svg>`;
}

function escapeHtml(str) {
  return (str || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const dGrid = document.getElementById('donation-grid');
donations.forEach(d => dGrid.appendChild(makeCard(d)));
const pGrid = document.getElementById('project-grid');
projects.forEach(p => pGrid.appendChild(makeCard(p)));

document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  
  btn.classList.add('active');

  const f = btn.dataset.filter;
  filterGrid(f);
}));

function filterGrid(filter) {
  const allCards = document.querySelectorAll('.card');
  allCards.forEach(c => {
    if (filter === 'all') { c.style.display = 'block'; return }
    if (filter === 'near') { c.style.display = 'block'; return } 
    if (c.dataset.type === filter) c.style.display = 'block'; else c.style.display = 'none';
  });
}


document.getElementById('search').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  document.querySelectorAll('.card').forEach(c => {
    const title = c.querySelector('h3').textContent.toLowerCase();
    const desc = c.querySelector('p').textContent.toLowerCase();
    c.style.display = (title.includes(q) || desc.includes(q)) ? 'block' : 'none';
  });
});


function openModal(id) {
  const all = donations.concat(projects);
  const item = all.find(x => x.id == id);
  if (!item) return;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-content').innerHTML = `
      <p><strong>Descrição:</strong> ${escapeHtml(item.desc)}</p>
      ${item.location ? `<p><strong>Local:</strong> ${escapeHtml(item.location)}</p>` : ''}
      ${item.qty ? `<p><strong>Quantidade disponível:</strong> ${item.qty}</p>` : ''}
      <p style='margin-top:16px'><button class='primary-action' onclick='confirmSupport(${item.id})'>Quero me inscrever</button></p>
    `;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal(e) {
  if (e && e.target && e.target.id !== 'modal') return;
  document.getElementById('modal').style.display = 'none';
}

function confirmSupport(id) {
  alert('Obrigado! Entraremos em contato para passar mais informações. ID=' + id);
  closeModal();
}