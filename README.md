# Mão Amiga - Plataforma de Apoio Social

O **Mão Amiga** é uma plataforma de apoio social criada para aproximar pessoas que precisam de ajuda de pessoas dispostas a colaborar.

## Estado atual

O projeto está passando por uma refatoração estrutural e visual. O back-end antigo foi removido integralmente para permitir uma reconstrução futura com uma arquitetura mais simples e bem definida.

Neste momento o repositório é um **protótipo front-end**, construído com HTML, CSS e JavaScript puro.

## Estrutura

- `public/index.html` — página inicial e referência principal da identidade visual.
- `public/style.css` — design system e estilos compartilhados entre as páginas.
- `public/script.js` — comportamentos compartilhados e demonstrações front-end.
- Demais arquivos `.html` em `public/` — páginas e fluxos específicos.
- `public/imagens/` — recursos visuais do projeto.

## Funcionalidades do protótipo

- Navegação responsiva.
- Página inicial com busca de páginas e recursos.
- Catálogo demonstrativo de doações e projetos.
- Comunidade demonstrativa com publicações salvas localmente no navegador (`localStorage`).
- Formulários de contato, doação e pedido de ajuda com validação local.
- Autoatendimento e assistente local baseado em respostas pré-definidas.

> Formulários, autenticação e publicações não são enviados para um servidor nesta versão.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Font Awesome

## Objetivo da refatoração

A página inicial define a linguagem visual do Mão Amiga: gradientes suaves, glassmorphism no cabeçalho, tipografia forte, azul/lilás como cor de identidade e componentes claros e acolhedores. As páginas internas seguem a mesma linguagem sem simplesmente repetir a hero da homepage.

## Autores

Pedro Henrique de Souza Silva (mantenedor atual)  
Maria Clara Mendonça  
João Gabriel Iost  
Pedro Henrique Carvalho  
Gabriel Trindade  
Renan Alves

## Observação

O projeto foi inicialmente desenvolvido em contexto acadêmico e posteriormente passou a ser mantido como projeto pessoal.
