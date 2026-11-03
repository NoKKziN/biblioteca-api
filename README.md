# Biblioteca API

API REST desenvolvida com Java e Spring Boot para gerenciamento de biblioteca, permitindo o cadastro de livros e leitores, realização de empréstimos e registro de devoluções.

## Tecnologias utilizadas

- Java 25 (LTS)
- Spring Boot 4
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Swagger / OpenAPI
- Bean Validation

## Funcionalidades

- CRUD de livros
- CRUD de leitores
- Cadastro de empréstimos
- Registro de devoluções
- Consulta de empréstimos ativos
- Filtros por título, autor e disponibilidade
- Paginação e ordenação
- Validação de dados
- Tratamento centralizado de exceções

## Regras de negócio

- Um livro não pode possuir dois empréstimos ativos.
- Um leitor pode possuir no máximo três empréstimos ativos.
- Não é permitido devolver um empréstimo mais de uma vez.
- Livros e leitores com histórico de empréstimos não podem ser excluídos.
- O prazo padrão de empréstimo é de 14 dias.

## Configuração

1. Instale Java 25 (LTS).
2. Instale PostgreSQL.
3. Crie o banco `biblioteca_db`.
4. Configure as credenciais no arquivo `application.properties`.
5. Execute o projeto com Maven.

## Executar

```bash
./mvnw spring-boot:run
```

No Windows:

```bash
mvnw.cmd spring-boot:run
```

## Swagger

Após iniciar a aplicação:

http://localhost:8080/swagger-ui.html

## Principais endpoints

| Método | Endpoint |
|---|---|
| POST | `/api/livros` |
| GET | `/api/livros` |
| GET | `/api/livros/{id}` |
| PUT | `/api/livros/{id}` |
| DELETE | `/api/livros/{id}` |
| POST | `/api/leitores` |
| GET | `/api/leitores` |
| POST | `/api/emprestimos` |
| GET | `/api/emprestimos` |
| GET | `/api/emprestimos/ativos` |
| PUT | `/api/emprestimos/{id}/devolucao` |

## Exemplo de empréstimo

```json
{
  "livroId": 1,
  "leitorId": 1
}
```

## Desenvolvido para

Projeto acadêmico de Desenvolvimento Backend com Spring Boot.