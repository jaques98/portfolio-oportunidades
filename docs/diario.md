# Diário de desenvolvimento

## 23/11/2026 - Preparação do projeto

- Node portátil 24.22.3 e npm 11.19.1, sem alteração da instalação global.
- Arquivo oficial do Node conferido por SHA-256.
- Git inicializado na branch main, sem commits nesta etapa.
- Pastas server, docs e web criadas.
- Interface inicial React/TypeScript gerada pelo create-vite.
- npm install concluído: nenhuma vulnerabilidade reportada nessa instalação.
- npm run build aprovado: TypeScript e compilação Vite.
- .tools e dependências excluídos do versionamento pelo .gitignore.
- Nenhuma regra de oportunidades implementada ainda.
- Próxima conferência: abrir a interface local no navegador.

## 23/11/2026 - API mínima

- Interface inicial conferida pelo usuário no navegador.
- Express, TypeScript, tsx, Vitest e Supertest instalados.
- app.ts monta a aplicação; index.ts abre a porta local 3001.
- GET /api/health retorna HTTP 200 e {"ok":true}.
- npm run typecheck aprovado.
- Resposta HTTP verificada localmente; servidor temporário encerrado ao final.
- Ainda sem banco, seed, CRUD ou testes automatizados de regras.
- Aviso do npm: postinstall do esbuild não autorizado automaticamente; execução via tsx funcionou no teste HTTP.
- Próximo passo: usuário iniciar API em segundo terminal e conferir a rota.

## 23/11/2026 - Banco SQLite e carga fictícia

- types.ts define Opportunity e suas três situações.
- db.ts cria data/portfolio.db com schema próprio do demonstrador.
- seed-data.ts carrega exemplos somente em base vazia, em transação.
- seed.ts executa a carga e mostra resumo em centavos; fecha a conexão.
- Carga executada duas vezes: três registros mantidos, sem duplicação.
- Total: 400000 centavos (R$ 4.000,00); em aberto: um registro de 100000 centavos (R$ 1.000,00).
- TypeScript aprovado; três testes aprovados: totais, repetição preservando alterações e persistência ao reabrir arquivo temporário.
- Ainda sem API de oportunidades e sem interface conectada ao banco.
- Próximo marco: rotas de consulta e cadastro com validações.

## 23/11/2026 - Rotas de oportunidades

- validation.ts valida campos, filtros e identificadores.
- repository.ts centraliza SQL preparado e mapeamento de registros.
- routes.ts implementa GET, POST, PUT e DELETE.
- app.ts recebe conexão e trata erros JSON; index.ts abre e fecha a base local.
- TypeScript aprovado e 43 testes aprovados; consultas HTTP locais de leitura confirmadas.
- Contrato e resultados registrados em docs/api.md e docs/verificacao.md.
- Próximo marco: conectar lista, filtros e resumo na interface React.

## 23/11/2026 - Interface de consulta

- Componentes Filters, Summary e OpportunityList implementados.
- Cliente HTTP em api.ts e contratos em types.ts; conversão de moeda em format.ts.
- Interface React conectada aos registros fictícios do SQLite por meio da API.
- Build, lint e três testes de integração em navegador aprovados.
- Próximo marco: formulário de cadastro/edição e confirmação de exclusão.

## 23/11/2026 - Formulário completo

- Cadastro, edição e exclusão com confirmação implementados na interface.
- Validações e mensagens acessíveis; foco inicial e retorno ao botão principal.
- Build, lint e seis testes de navegador aprovados.
- Registro temporário do teste removido; exemplos originais preservados.
- Próximo marco: conferência manual do usuário e documentação de execução.

## 23/11/2026 - Preparação para publicação

- README, decisões técnicas e workflow CI preparados.
- Instalação em cópia limpa aprovada: 43 testes de servidor e seis testes de navegador, tipos, lint e build.
- CI remota e licença pública permanecem pendentes; repositório não publicado.
- Próximo marco: revisão do material e definição do repositório no GitHub.

## 23/11/2026 - Repositório público

- Publicado em jaques98/portfolio-oportunidades.
- Primeiro commit criado com autoria correta e e-mail privado.
- Acesso público e CI remota confirmados.
- Próximo marco: incluir o repositório em Projetos/Em destaque e preparar as demonstrações em vídeo.
