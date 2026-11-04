# Frontend — Biblioteca API

Frontend React + Vite para o projeto de gerenciamento de biblioteca com Spring Boot.

## Requisitos
- Node.js 20 ou superior
- Backend Spring Boot rodando em `http://localhost:8080`

## Como executar

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`).

Para apontar para outro endereço do backend, crie um arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:8080
```

Depois reinicie o Vite.

## Funcionalidades
- Dashboard com totais e empréstimos recentes
- CRUD de livros e leitores
- Registro de empréstimo e devolução
- Busca e filtros de livros e leitores
- Paginação de livros
- Layout responsivo

## Endpoints esperados
- `GET/POST /api/livros`
- `GET/PUT/DELETE /api/livros/{id}`
- `GET/POST /api/leitores`
- `GET/PUT/DELETE /api/leitores/{id}`
- `GET/POST /api/emprestimos`
- `GET /api/emprestimos/ativos`
- `GET /api/emprestimos/leitor/{leitorId}`
- `GET /api/emprestimos/{id}`
- `PUT /api/emprestimos/{id}/devolucao`

## Campos usados nos DTOs
- Livro: `id`, `titulo`, `autor`, `isbn`, `anoPublicacao`, `disponivel`
- Leitor: `id`, `nome`, `email`
- Empréstimo: `id`, `livroId`, `tituloLivro`, `leitorId`, `nomeLeitor`, `dataEmprestimo`, `dataPrevistaDevolucao`, `dataDevolucao`, `ativo`

## CORS
Se o navegador bloquear as chamadas por CORS, configure o backend para permitir a origem `http://localhost:5173`.
