# Verificação local

## 23/11/2026 - API de oportunidades

- npm run typecheck: aprovado.
- npm test: 43 testes aprovados em dois arquivos, sem falhas.
- Testes HTTP executam aplicação Express com bancos SQLite isolados; não alteram a base de demonstração.
- Cobertos: saúde, CRUD, validação, ids inválidos, 404, filtro combinado, busca Unicode/literal, proteção contra interpretação SQL, JSON inválido, limite de corpo e totais.
- Três testes de banco cobrem seed, ausência de duplicação e persistência ao reabrir arquivo temporário.
- GET real /api/opportunities: três registros, total 400000 centavos, um aberto de 100000 centavos.
- GET real com status=aberta: um registro e 100000 centavos.
- Consultas reais somente de leitura; base fictícia preservada.
- Sem interface conectada, teste de navegador do CRUD ou publicação externa nesta etapa.

## 23/11/2026 - Consulta na interface React

- Lista conectada à API real pelo proxy Vite /api -> 127.0.0.1:3001.
- Pesquisa por empresa/descrição, filtro por situação e limpeza de filtros.
- Quatro cartões de resumo usam o conjunto filtrado retornado pela API.
- Estados de carregamento, resultado vazio, erro e nova tentativa.
- Requisições anteriores canceladas/ignoradas ao trocar filtros.
- Layout conferido em 1366 e 390 pixels; capturas em docs/images.
- TypeScript/build aprovados; lint final sem avisos de código.
- Três testes de navegador aprovados: consulta/filtro/vazio/limpeza com API real; celular sem expansão horizontal; erro 503 simulado com recuperação para API real.
- Testes de navegador não cadastram, editam ou excluem registros.
- Aviso de ambiente do executor: NO_COLOR ignorado quando FORCE_COLOR está definido; não é falha da aplicação.
- Ainda sem formulário e ações de cadastro, edição ou exclusão na interface.
- Testes de navegador exigem frontend e API ligados e os três registros fictícios originais; comando em web: npm run test:e2e. Usa Edge instalado.

## 23/11/2026 - Cadastro, edição e exclusão pela interface

- OpportunityForm reutilizado para cadastro e edição, com validação de campos e conversão reais/centavos.
- Cliente HTTP acrescenta POST, PUT e DELETE; erro da API preserva os campos preenchidos.
- Salvar e Cancelar bloqueados durante envio; trava adicional impede submissão duplicada.
- Exclusão usa confirmação explícita com nome da empresa.
- Lista e totais recarregados após sucesso, mantendo os filtros atuais.
- Cancelar edição não envia alteração.
- TypeScript/build e lint aprovados, sem avisos de código.
- Seis testes de navegador aprovados: três de consulta existentes e três de CRUD/erro/mobile.
- CRUD real de interface usou registro temporário criado pelo teste, apagado ao final; lista e totais finais comparados integralmente aos anteriores.
- Falha 503 no cadastro simulada para verificar preservação dos campos, bloqueio durante envio e nova tentativa.
- Capturas desktop e celular em docs/images, incluindo formulario-celular.png.
- API e banco não tiveram alteração de implementação nesta etapa; os 43 testes do servidor correspondem à execução anterior registrada.
- Ainda sem README final, instalação limpa, CI publicada ou publicação do repositório.

## 23/11/2026 - Documentação, CI e instalação limpa

- README completo com instalação, execução, testes, capturas, estrutura, autoria e limitações.
- docs/decisoes.md documenta as escolhas técnicas.
- Workflow .github/workflows/ci.yml preparado para tipos, testes, lint, build e navegador em Linux/Chromium.
- Configuração de testes pode iniciar serviços próprios, sem reutilizar processos existentes.
- Portas alternativas configuráveis: PORT na API e PORTFOLIO_API_URL no proxy Vite.
- Cópia limpa sem node_modules, banco, dist ou runtime portátil.
- npm ci em server e web, seed, TypeScript, 43 testes de banco/API, lint, build e seis testes de navegador aprovados nessa cópia.
- Testes da cópia usaram portas 3002/5174 e Edge local; serviços do usuário preservados nas portas originais.
- CI ainda não executada no GitHub nem validada em Linux/Chromium; confirmação depende da publicação.
- Mantidos avisos de ambiente: NO_COLOR/FORCE_COLOR e postinstall do esbuild não autorizado automaticamente pelo npm. A instalação, a execução tsx e o build funcionaram sem liberar o script.
- Licença pública ainda pendente; removida a indicação ISC herdada do template. Pacote server marcado privado/UNLICENSED até definição.
- Sem commits, publicação de repositório ou envio de dados ao GitHub nesta etapa.
