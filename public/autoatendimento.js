const messagesEl = document.getElementById('messages');
const input = document.getElementById('inputMsg');
const btn = document.getElementById('btnSend');

function appendMessage(text, cls = 'from-agent') {
    const d = document.createElement('div');
    d.className = 'msg ' + cls;
    if (cls === 'from-agent') {
        d.innerHTML = text;
    } else {
        d.textContent = text;
    }
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = new Date().toLocaleTimeString();
    d.appendChild(meta);
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return d;
}

function userSend(text) {
    if (!text || !text.trim()) return;
    appendMessage(text, 'from-user');
    input.value = '';
    const typing = appendMessage('O agente está digitando...', 'from-agent');

    sendToApi(text).then(reply => {
        typing.remove();
        appendMessage(reply, 'from-agent');
    }).catch(err => {
        typing.remove();
        appendMessage('Erro na resposta. Tente novamente.', 'from-agent');
        console.error(err);
    });
}

btn.addEventListener('click', () => userSend(input.value));
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') userSend(input.value); });

let conversationContext = {
    lastIntent: null,
    lastJokeIndex: -1,
    lastCuriosityIndex: -1,
    lastCrisis: false,
    emergencyFlow: false,
    addressProvided: false,
    aboutFlow: false,
    howHelpFlow: false
};

async function sendToApi(userText) {
    await new Promise(r => setTimeout(r, 800));
    const txt = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const piadas = [
        'Por que o computador foi ao médico? Porque ele estava com um vírus! 😄',
        'O que o zero disse para o oito? Belo cinto!',
        'Por que o livro foi ao médico? Porque ele tinha muitas páginas em branco!',
        'Qual é o cúmulo do eletricista? Não resistir à corrente!'
    ];
    const curiosidades = [
        'Você sabia? O cérebro humano tem cerca de 86 bilhões de neurônios!',
        'A solidariedade pode aumentar a sensação de bem-estar e felicidade.',
        'O CVV (Centro de Valorização da Vida) atende gratuitamente pelo número 188.',
        'A empatia é um dos valores fundamentais para a transformação social.'
    ];

    const wantsJoke = txt.includes('piada');
    const wantsCuriosity = txt.includes('curiosidade') || txt.includes('informacao') || txt.includes('me conte algo') || txt.includes('fato curioso');
    const wantsDonation = txt.includes('doacao') || txt.includes('doacoes') || txt.includes('doar') || txt.includes('preciso de doacao') || txt.includes('preciso de doacoes') || txt.includes('quero doar');
    const wantsSupport = txt.includes('apoio') || txt.includes('preciso de ajuda') || txt.includes('preciso conversar') || txt.includes('preciso de apoio');
    const wantsVolunteer = txt.includes('voluntario') || txt.includes('voluntariado') || txt.includes('quero ajudar');
    const wantsAbout = txt.includes('quem somos') || txt.includes('quem e voce') || txt.includes('quem sao voces') || txt.includes('sobre voce') || txt.includes('sobre voces') || txt.includes('quem é você') || txt.includes('quem são vocês') || txt.includes('quem é o site') || txt.includes('quem e o site');
    const isPositive = txt.includes('feliz') || txt.includes('alegre') || txt.includes('obrigado') || txt.includes('obrigada') || txt.includes('valeu') || txt.includes('agradecido') || txt.includes('gostei');
    const isGoodbye = txt.includes('tchau') || txt.includes('ate logo') || txt.includes('ate mais') || txt.includes('boa madrugada');
    const isNegative = txt.includes('triste') || txt.includes('deprimido') || txt.includes('ansioso') || txt.includes('sofrendo') || txt.includes('sozinho') || txt.includes('desanimado');
    const isCrisis = txt.includes('crise') || txt.includes('suic') || txt.includes('me matar');
    const isYes = txt === 'sim' || txt === 'quero' || txt === 'sim quero' || txt.includes('mais') || txt.includes('outra') || txt.includes('detalhe');
    const isHello = txt.includes('oi') || txt.includes('ola') || txt.includes('e ai');
    const isEmergency = txt.includes('emergencia') || txt.includes('socorro') || txt.includes('ajuda grave');
    const wantsPolice = txt.includes('policia') || txt.includes('ladrao') || txt.includes('roubo') || txt.includes('assalto');
    const wantsFirefighter = txt.includes('bombeiro') || txt.includes('fogo') || txt.includes('incendio') || txt.includes('desastre');
    const wantsSamu = txt.includes('samu') || txt.includes('medico') || txt.includes('ambulancia') || txt.includes('acidente') || txt.includes('doente');
    const wantsJobs = txt.includes('emprego') || txt.includes('vaga') || txt.includes('trabalho');
    // NOVO: Adiciona a intenção para o novo fluxo
    const wantsHowHelp = txt.includes('como ajuda') || txt.includes('como funciona') || txt.includes('como a mao amiga ajuda') || txt.includes('como o site ajuda');

    // PRIORIDADE 1: FLUXO DE EMERGÊNCIA
    if (conversationContext.emergencyFlow) {
        if (!conversationContext.addressProvided) {
            conversationContext.addressProvided = true;
            return `Obrigado por informar. Repassei o seu endereço para o serviço de emergência. Por favor, mantenha a calma.`;
        }
    }

    if (isEmergency || wantsPolice || wantsFirefighter || wantsSamu) {
        conversationContext.emergencyFlow = true;
        conversationContext.addressProvided = false;
        let response = `🚨 **Emergência detectada!** 🚨 Para quem devo ligar?`;

        const options = [];
        if (!wantsPolice) options.push('Polícia (190)');
        if (!wantsFirefighter) options.push('Bombeiro (193)');
        if (!wantsSamu) options.push('SAMU (192)');

        if (wantsPolice) {
            response = `🚨 **Emergência policial detectada!** 🚨 Por favor, digite seu endereço completo para que eu possa repassar para o serviço de emergência.`;
        } else if (wantsFirefighter) {
            response = `🚨 **Emergência de bombeiros detectada!** 🚨 Por favor, digite seu endereço completo para que eu possa repassar para o serviço de emergência.`;
        } else if (wantsSamu) {
            response = `🚨 **Emergência médica detectada!** 🚨 Por favor, digite seu endereço completo para que eu possa repassar para o serviço de emergência.`;
        } else {
            response += `<br><br>Você precisa de: ${options.join(', ')}? Ou outra situação?`;
        }

        return response;
    }

    // PRIORIDADE 2: FLUXO DE CRISE
    if (conversationContext.lastCrisis && isYes) {
        conversationContext.lastCrisis = false;
        conversationContext.lastIntent = null;
        return 'Aqui estão alguns contatos de apoio para você: **CVV - 188** (Centro de Valorização da Vida).<br><br>Lembre-se: você não está sozinho! Se quiser conversar mais, estou aqui. Precisa de doações ou quer ajudar alguém? <a href="doacoes.html" target="_blank" rel="noopener">Clique aqui</a>.';
    }
    if (isCrisis) {
        conversationContext.lastCrisis = true;
        conversationContext.lastIntent = 'support';
        return 'Sinto muito que esteja passando por isso. 🚨 Se for uma emergência, ligue para o CVV (188) ou procure ajuda imediatamente.<br><br>Quer que eu indique linhas de apoio próximas a você? (Responda "sim" para receber)';
    }

    // PRIORIDADE 3: FLUXO DE QUEM SOMOS NÓS
    if (conversationContext.aboutFlow) {
        if (txt.includes('missao') || txt.includes('missão')) {
            conversationContext.aboutFlow = false;
            return `Nossa missão é **oferecer apoio, dignidade e oportunidade** a quem mais precisa, por meio da união de voluntários e iniciativas sociais.<br><br>Quer saber nossa visão, valores ou como participar?`;
        }
        if (txt.includes('visao') || txt.includes('visão')) {
            conversationContext.aboutFlow = false;
            return `Nossa visão é **ser referência nacional em apoio comunitário**, promovendo inclusão, solidariedade e transformação social.<br><br>E nossos valores? Ou quer saber como participar?`;
        }
        if (txt.includes('valores')) {
            conversationContext.aboutFlow = false;
            return `Nossos valores são **Empatia, Respeito, Cooperação, Transparência e Comprometimento** com a mudança social.<br><br>Agora que você nos conhece um pouco mais, gostaria de saber como se juntar a nós?`;
        }
        if (txt.includes('participar') || txt.includes('ajudar')) {
            conversationContext.aboutFlow = false;
            return `Que ótimo! Você pode se cadastrar como voluntário ou fazer uma doação em nossa página. Juntos, fazemos a diferença!`;
        }
        return `Desculpe, não entendi. Você pode perguntar sobre nossa **missão**, **visão**, **valores** ou **como participar**.`;
    }

    // PRIORIDADE 4: FLUXO DE COMO AJUDA
    if (wantsHowHelp) {
        conversationContext.howHelpFlow = true;
        conversationContext.lastIntent = 'how-help';
        return `A Mão Amiga ajuda de duas formas principais:
        <br><br>
        **Para quem precisa:** Oferecemos um espaço seguro para você pedir doações ou buscar apoio, tudo de forma gratuita. Melhoramos a **visibilidade** do seu pedido para que mais pessoas possam te encontrar.
        <br><br>
        **Para quem quer ajudar:** Simplificamos o processo para você encontrar pessoas que precisam de ajuda, seja doando, oferecendo ajuda ou atuando como voluntário. Com a **facilidade** da nossa plataforma, você ajuda de maneira rápida e segura.
        <br><br>
        Ficou mais claro? Se quiser, posso te explicar como doar, procurar empregos ou buscar apoio emocional.`;
    }

    // PRIORIDADE 5: CONTINUIDADE DA CONVERSA
    if (isYes && conversationContext.lastIntent) {
        let reply = '';
        if (conversationContext.lastIntent === 'joke') {
            conversationContext.lastJokeIndex = (conversationContext.lastJokeIndex + 1) % piadas.length;
            reply = piadas[conversationContext.lastJokeIndex];
        }
        if (conversationContext.lastIntent === 'curiosity') {
            conversationContext.lastCuriosityIndex = (conversationContext.lastCuriosityIndex + 1) % curiosidades.length;
            reply = curiosidades[conversationContext.lastCuriosityIndex];
        }
        return reply + '<br><br>Que bom que gostou! Se quiser conversar sobre outro assunto, é só me dizer.';
    }

    // PRIORIDADE 6: INTENÇÕES ESPECÍFICAS
    if (isHello) {
        conversationContext.lastIntent = null;
        return 'Olá! 😊 Que bom te ver por aqui. Como posso ajudar você hoje? Se quiser, me conte como está se sentindo ou o que está procurando.';
    }
    if (txt.includes('bom dia')) {
        conversationContext.lastIntent = null;
        return 'Bom dia! 😊 Que seu dia seja ótimo. Precisa de apoio, quer doar, ouvir uma piada ou saber mais sobre a Mão Amiga?';
    }
    if (txt.includes('boa tarde')) {
        conversationContext.lastIntent = null;
        return 'Boa tarde! ☀️ Como posso ajudar? Conte comigo para o que precisar!';
    }
    if (txt.includes('boa noite')) {
        conversationContext.lastIntent = null;
        return `Boa noite! 🌙 Conte comigo para o que precisar. Você pode pedir uma piada, curiosidade ou falar sobre o que está sentindo.`;
    }
    if (isGoodbye) {
        conversationContext.lastIntent = null;
        return 'Foi um prazer conversar com você! Se precisar de algo, estarei sempre por aqui. Cuide-se!';
    }
    if (isPositive) {
        conversationContext.lastIntent = null;
        return 'Fico feliz que pude ajudar! 😊 Se precisar de algo mais, é só chamar.';
    }
    if (isNegative) {
        conversationContext.lastIntent = 'support';
        return `Sinto muito que esteja se sentindo assim. Lembre-se que você não está sozinho(a). Se quiser, posso apenas te ouvir, ou te direcionar para a nossa comunidade de apoio.`;
    }
    if (wantsAbout) {
        conversationContext.aboutFlow = true;
        conversationContext.lastIntent = 'about';
        return `A **Mão Amiga** é uma plataforma que conecta pessoas que precisam de ajuda com quem pode oferecer apoio. Nossa missão é promover a solidariedade e a dignidade.<br><br>Gostaria de saber mais sobre nossa **missão**, **visão**, **valores** ou **como participar**?`;
    }
    if (wantsVolunteer) {
        conversationContext.lastIntent = 'about';
        return 'Que ótimo saber do seu interesse em ajudar! Agradecemos o seu coração solidário. Você pode se cadastrar como voluntário ou fazer uma doação em nossa página. Juntos, podemos fazer a diferença!';
    }
    if (wantsSupport) {
        conversationContext.lastIntent = 'support';
        return `Você não está sozinho(a)! Conversar com amigos, familiares ou profissionais pode ajudar muito. Se quiser, posso te direcionar para a nossa comunidade de apoio. Quer compartilhar mais sobre sua situação?`;
    }
    if (wantsDonation) {
        conversationContext.lastIntent = 'donation';
        return `Sua solidariedade é muito importante para nós! Se você precisa de doações ou deseja ajudar, <a href="doaçoes.html" target="_blank" rel="noopener">clique aqui para acessar nossa página de doações</a>.
        <br><br>Se quiser saber mais sobre como a Mão Amiga ajuda, é só perguntar!`;
    }
    if (wantsJobs) {
        conversationContext.lastIntent = 'jobs';
        return `Para encontrar vagas de emprego, visite a nossa seção de Empregos no menu principal. Lá você pode filtrar por região e área de interesse para encontrar a oportunidade perfeita para você!`;
    }
    if (wantsJoke && wantsCuriosity) {
        conversationContext.lastIntent = 'joke';
        conversationContext.lastJokeIndex = Math.floor(Math.random() * piadas.length);
        conversationContext.lastCuriosityIndex = Math.floor(Math.random() * curiosidades.length);
        return piadas[conversationContext.lastJokeIndex] + '<br>' + curiosidades[conversationContext.lastCuriosityIndex] + '<br><br>Se quiser saber mais, peça "mais" ou "outra". Ou me conte como está se sentindo!';
    }
    if (wantsJoke) {
        conversationContext.lastIntent = 'joke';
        conversationContext.lastJokeIndex = Math.floor(Math.random() * piadas.length);
        return piadas[conversationContext.lastJokeIndex] + '<br><br>Se quiser ouvir outra piada, diga "mais" ou "outra".';
    }
    if (wantsCuriosity) {
        conversationContext.lastIntent = 'curiosity';
        conversationContext.lastCuriosityIndex = Math.floor(Math.random() * curiosidades.length);
        return curiosidades[conversationContext.lastCuriosityIndex] + '<br><br>Se quiser ouvir outra curiosidade, diga "mais" ou "outra".';
    }

    // PRIORIDADE 7: RESPOSTA PADRÃO
    conversationContext.lastIntent = null;
    return 'Desculpe, não entendi. Você pode pedir apoio, uma piada, uma curiosidade, saber sobre doações, voluntariado ou perguntar quem somos nós.<br><br>Se quiser, me conte como está se sentindo!';
}

window.addEventListener('load', () => input.focus());