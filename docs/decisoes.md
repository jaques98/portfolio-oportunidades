# Decisões do demonstrador

1. Projeto separado dos produtos comerciais, com base e regras didáticas próprias.
2. React/TypeScript e Express para mostrar a integração frontend/backend.
3. SQLite nativo de Node 24 para instalação simples, sem servidor de banco.
4. Dinheiro em centavos inteiros: soma consistente e moeda formatada só na interface.
5. SQL preparado; pesquisa literal com instr e normalização Unicode, sem interpretar curingas.
6. Aplicação recebe a conexão: testes usam memória ou arquivo temporário e não a base local.
7. Seed transacional apenas em tabela vazia, sem sobrescrever trabalho existente.
8. GET e totais usam os mesmos filtros; resposta vazia tem totais zero.
9. PUT exige os quatro campos editáveis; preserva id e createdAt.
10. DELETE pede confirmação no navegador; exclusão física somente nesta amostra local.
11. Requisições de leitura anteriores são canceladas/ignoradas para evitar resposta atrasada.
12. Interface preserva campos na falha; bloqueia operações durante envio; mantém filtros após salvar.
13. Sem autenticação ou API externa: não publicar o servidor como serviço público nesta versão.
14. CI testa uma instalação nova e inicia serviços próprios; não reutiliza banco de produção.
15. A licença permanece pendente de definição pelo autor antes da publicação pública.
