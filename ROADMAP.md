# Roadmap e Mapa do Projeto

Este documento consolida o status atual do projeto, o roadmap com próximos passos e o mapeamento da estrutura do repositório.

## Visão geral

Aplicativo de lista de compras com backend Node.js/Express e PostgreSQL, frontend web responsivo (HTML/CSS/JS) e base para PWA. Possui multi-tenant por dispositivo (deviceId), CRUD de listas/itens, filtros, categorias, sumário e interações por gesto (swipe) com desfazer.

---

## Mapa da estrutura do projeto

Estrutura atual e propósito de cada parte:

```
.
├─ app.js                         # Servidor Express: API REST, conexão PostgreSQL, serve arquivos estáticos
├─ package.json                   # Metadados do projeto, scripts, dependências
├─ README.md                      # Documentação principal (instalação, uso, deploy)
├─ LICENSE                        # Licença do projeto
├─ copilot-tasks.js               # Rascunho/TO-Dos de melhorias e ideias
├─ db/
│  └─ banco_de_dados.sql         # Script SQL de criação/migração do banco (tabelas listas, itens, etc.)
├─ public/
│  ├─ index.html                  # UI principal da aplicação
│  ├─ 404.html                    # Página 404
│  ├─ manifest.json               # Manifest PWA (ícones, nome, cores)
│  ├─ service-worker.js           # Service Worker (base para cache/offline)
│  ├─ assets/
│  │  └─ icons/
│  │     └─ icon-192.png         # Ícone PWA (exemplo)
│  ├─ css/
│  │  └─ style.css               # Estilos da aplicação (layout, responsivo, swipe, notificações)
│  └─ js/
│     └─ script.js               # Lógica de frontend: CRUD, UI, swipe, notificações, deviceId, fetch API
```

Notas:
- O backend expõe endpoints REST para listas e itens (com escopo por deviceId), além de servir o frontend estático (pasta `public/`).
- O frontend utiliza localStorage para `deviceId`, Font Awesome para ícones e `fetch` para comunicação com a API.
- O banco usa PostgreSQL (Neon compatível). As exclusões de listas removem itens via CASCADE, e há suporte à tabela de palavras aprendidas (upsert em operações de itens).

---

## Status atual por área (com porcentagens)

Legenda: [✅ 100%] concluído, valores menores indicam progresso parcial.

### Backend (API/DB)
- [✅ 100%] Estrutura Express + rotas REST básicas (listas/itens)
- [✅ 100%] Escopo por dispositivo (deviceId) em todas as rotas de listas (GET/POST/PUT/DELETE)
- [✅ 100%] Validação e proteção contra `req.body` indefinido (desestruturação segura + mensagens de erro claras)
- [✅ 100%] CRUD de itens (inclui limpa concluídos/limpa todos)
- [✅ 85%] Integração com tabela de palavras aprendidas (upsert em add/update de item) — base pronta; explorar uso no frontend
- [✅ 90%] Conexão PostgreSQL via `DATABASE_URL` (.env/Render/Neon) — robustez adicional (retries/backoff/healthcheck) sugerida
- [✅ 80%] Tratamento de erros (500 handler e 404) — padronizar payloads e códigos por caso comum
- [✅ 0%] Observabilidade (logs estruturados, correlação por request, métricas) — sugerido

### Frontend (UI/UX)
- [✅ 100%] Geração e persistência de deviceId no localStorage
- [✅ 100%] CRUD de listas com deviceId propagado (create/rename/delete)
- [✅ 100%] CRUD de itens (nome, categoria, quantidade, preço)
- [✅ 100%] Notificações com botão fechar e transição suave
- [✅ 90%] UI responsiva (layouts, tipografia, cards, grids)
- [✅ 92%] Gestos de swipe: revelar ações (editar/Excluir), apagar com deslize completo e opção de Desfazer; ícones atrás do item e visíveis apenas quando ativados
- [✅ 85%] Edição via deslize à direita — agora abre o modo edição com foco automático e scroll de baixo para cima até o formulário
- [✅ 80%] Filtros e sumário (contagens, totais) — funcional; possível evoluir UI/UX
- [✅ 80%] Modal de categorias e seleção assistida — pode ganhar autocomplete/sugestões

### PWA e Entrega
- [✅ 50%] Manifest PWA e ícones básicos
- [✅ 30%] Service Worker — base presente, faltam estratégias de cache e modo offline/fila
- [✅ 80%] Deploy Render (docs e env) — operacional; automações CI/CD podem evoluir

### Qualidade, DevEx e Segurança
- [✅ 0%] Testes unitários (backend e frontend)
- [✅ 0%] Testes E2E (fluxos críticos)
- [✅ 0%] Lint/Format (ESLint, Prettier) com checagem em CI
- [✅ 0%] Tipagem (TypeScript/JSDoc) — iniciar pelos módulos públicos
- [✅ 0%] CI (GitHub Actions): build, lint, testes, deploy
- [✅ 20%] Documentação — README profissional e este ROADMAP; adicionar guias de contribuição
- [✅ 0%] Segurança: validação de input adicional, rate-limit, helmet, CORS restritivo por ambiente

---

## Roadmap proposto (próximos passos)

Curto prazo (1–2 sprints)
- Frontend/UX
  - [ ] Refinar thresholds/animações do swipe; micro bounce no parcial e highlight do ícone ativo [✅ 0%]
  - [ ] Paridade/ajustes finos no gesto para desktop (mouse drag) [✅ 50%]
  - [ ] Acessibilidade: foco/aria-labels, contraste e navegação por teclado [✅ 0%]
  - [ ] Ajustes de performance (evitar reflows/repinturas desnecessárias no swipe) [✅ 0%]
- Backend
  - [ ] Padronização de erros (códigos e mensagens), DTOs de resposta [✅ 0%]
  - [ ] Retries/backoff na conexão com DB e healthcheck endpoint [✅ 0%]
- PWA
  - [ ] Service Worker: cache-first para estáticos e network-first com fallback para API [✅ 0%]
  - [ ] Modo offline com fila (Background Sync) e replay de requisições [✅ 0%]
- Qualidade/DevEx
  - [ ] Configurar ESLint + Prettier e script de lint [✅ 0%]
  - [ ] Testes unitários mínimos (2-3 casos por camada) [✅ 0%]
  - [ ] GitHub Actions: CI para lint e testes [✅ 0%]

Médio prazo (3–5 sprints)
- Funcionalidades
  - [ ] Autocomplete de categorias (com base em “palavras aprendidas”) [✅ 0%]
  - [ ] Importação/exportação de listas (CSV/JSON) [✅ 0%]
  - [ ] Multi-listas com compartilhamento (link/token) [✅ 0%]
  - [ ] Histórico e duplicação de listas [✅ 0%]
- Observabilidade e Segurança
  - [ ] Logs estruturados (pino/winston) e correlação por request [✅ 0%]
  - [ ] Rate limiting, Helmet e CORS por ambiente [✅ 0%]
- PWA
  - [ ] Prompt “Adicionar à tela inicial” customizado [✅ 0%]
  - [ ] Ícones adicionais (512px) e splash screens [✅ 0%]

Longo prazo
- [ ] Tipagem gradual (TypeScript ou JSDoc com verificação) [✅ 0%]
- [ ] E2E (Playwright/Cypress) cobrindo fluxos principais (criar lista, adicionar item, swipe, desfazer) [✅ 0%]
- [ ] i18n (pt-BR/en) [✅ 0%]
- [ ] Analytics opcional e anônimo (consentimento) [✅ 0%]

---

## Métricas de conclusão (resumo)

- Backend/API: [✅ 90%]
- Frontend/UI/UX: [✅ 88%]
- PWA/Offline: [✅ 40%]
- Qualidade/DevEx: [✅ 10%]
- Documentação: [✅ 70%]

Observação: valores estimados com base no estado atual e nas melhorias listadas.

---

## Riscos e pontos de atenção
- Confiabilidade de rede: melhorar resiliência a falhas de DB e latência (retries/backoff/timeout).
- Consistência de UI/UX entre touch e mouse: alinhar comportamentos e thresholds.
- Evolução de schema: planejar migrações versionadas (ferramenta de migrations) e backups.
- Segurança: sanitização e limites em inputs; proteção contra abuso; segredos apenas via env.

---

## Tarefas técnicas sugeridas (checklist rápido)
- [ ] Adicionar ESLint/Prettier e padronizar estilo
- [ ] Configurar Actions de CI (lint/test) e CD (Render) por branch
- [ ] Testes unitários mínimos (services/handlers de itens e listas)
- [ ] Playwright para 2–3 cenários críticos E2E
- [ ] Service Worker com estratégias de cache e modo offline
- [ ] Telemetria básica (logs estruturados) e rate-limiting
- [ ] Melhorias de acessibilidade e performance (Lighthouse)

---

## Como contribuir
- Issues: priorize bugs e UX
- PRs: pequenos, com descrição clara e, quando aplicável, passos de teste
- Padrões: seguir lint/format (após configuração) e cobrir casos principais

---

Atualizado em: 2025-08-17 (swipe refinado: ícones só quando ativados; edição com foco + scroll para cima)
