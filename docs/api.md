# Contrato da API do demonstrador

Base local: http://127.0.0.1:3001/api
Valores monetários são inteiros em centavos. Dados exclusivamente fictícios.

## Rotas

- GET /health: 200 com {"ok":true}.
- GET /opportunities: 200 com items e summary (count, amountCents, openCount, openAmountCents).
- Filtros opcionais: q pesquisa empresa/descrição literalmente, sem distinguir maiúsculas (incluindo acentos); status aceita aberta, ganha ou perdida.
- Totais calculados sobre o mesmo conjunto filtrado. Lista vazia tem quatro totais zero; ordem de id decrescente.
- POST /opportunities: 201 com o registro e cabeçalho Location. Corpo com company, description, amountCents e status.
- PUT /opportunities/:id: 200; exige os quatro campos editáveis e preserva id/createdAt.
- DELETE /opportunities/:id: 204 sem corpo.

Exemplo de corpo:

    {"company":"Clínica Exemplo Demo","description":"Exemplo fictício","amountCents":123450,"status":"aberta"}

## Validação e erros

- Empresa: trim, 2 a 100 caracteres; descrição: trim, 3 a 300.
- Valor: número inteiro de 0 a 1000000000 centavos. Identificador: inteiro positivo seguro.
- 400: dados, filtro, identificador ou JSON inválido; erros de campos em errors.
- 404: registro ou rota inexistente.
- 413: corpo acima de 50 KB.
- 500: falha interna, detalhes apenas no servidor.

API local sem autenticação: não preparada para exposição pública. Regras próprias do demonstrador, independentes dos produtos comerciais.
