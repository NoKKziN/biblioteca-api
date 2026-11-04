# Biblioteca API

Sistema de gerenciamento de biblioteca desenvolvido com **Java 21, Spring Boot, PostgreSQL e React**. A aplicação permite cadastrar livros e leitores, realizar empréstimos e registrar devoluções.

## Tecnologias utilizadas

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Swagger / OpenAPI

### Frontend
- React
- Vite
- JavaScript
- CSS

---

## Pré-requisitos

Antes de executar o projeto, instale:

- Java 21
- PostgreSQL
- pgAdmin 4
- Node.js (versão LTS)
- npm
- Git (opcional)

---

## 1. Configuração do banco de dados

Abra o pgAdmin 4 e crie um banco de dados chamado:

```sql
CREATE DATABASE biblioteca;
```

Configure a conexão com o PostgreSQL no arquivo:

`backend/src/main/resources/application.properties`

Exemplo:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/biblioteca
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Substitua `SUA_SENHA` pela senha configurada no PostgreSQL.

O Hibernate criará as tabelas automaticamente quando o backend for iniciado, desde que as entidades JPA estejam configuradas corretamente.

---

## 2. Executando o Backend

O backend deve ser iniciado primeiro.

Abra um terminal na pasta do projeto Spring Boot e execute:

```bash
./mvnw spring-boot:run
```

No Windows, utilize:

```bash
mvnw.cmd spring-boot:run
```

Aguarde até que a aplicação seja inicializada com sucesso.

O backend estará disponível em:

```text
http://localhost:8080
```

### Swagger

A documentação da API pode ser acessada em:

```text
http://localhost:8080/swagger-ui/index.html
```

Mantenha o backend em execução enquanto utiliza o frontend.

---

## 3. Executando o Frontend

Após iniciar o backend, abra **um segundo terminal**.

Navegue até a pasta do frontend:

```bash
cd biblioteca-frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá um endereço semelhante a:

```text
http://localhost:5173
```

Abra esse endereço no navegador para utilizar o sistema.

**Importante:** mantenha os dois terminais abertos enquanto estiver utilizando a aplicação.

---

## 4. Estrutura da aplicação

A aplicação está dividida em duas partes:

```text
biblioteca/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
│
└── biblioteca-frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

O backend é responsável pelas regras de negócio, persistência e comunicação com o PostgreSQL.

O frontend é responsável pela interface gráfica e envia requisições HTTP para a API REST.

---

## 5. Funcionalidades

- Cadastro, consulta, atualização e exclusão de livros.
- Cadastro, consulta, atualização e exclusão de leitores.
- Registro de empréstimos.
- Registro de devoluções.
- Consulta de empréstimos ativos.
- Validação das regras de negócio.
- Persistência dos dados no PostgreSQL.

---

## 6. Portas utilizadas

| Serviço | Porta |
|---|---|
| PostgreSQL | 5432 |
| Backend Spring Boot | 8080 |
| Frontend React/Vite | 5173 |

---

## 7. Problemas comuns

### Erro `command not found: npm`

Instale o Node.js LTS pelo site oficial:

https://nodejs.org/

Depois, feche e abra novamente o terminal.

### Erro de conexão com PostgreSQL

Verifique:
- Se o PostgreSQL está iniciado.
- Se o banco `biblioteca` foi criado.
- Se usuário e senha estão corretos.
- Se a porta configurada é `5432`.

### Frontend não consegue acessar o backend

Verifique se o backend está rodando na porta `8080` e se o CORS está configurado para permitir requisições de:

```text
http://localhost:5173
```

---

## Ordem correta de execução

1. Iniciar o PostgreSQL.
2. Executar o backend com `./mvnw spring-boot:run`.
3. Abrir outro terminal.
4. Entrar na pasta `biblioteca-frontend`.
5. Executar `npm install` (na primeira execução).
6. Executar `npm run dev`.
7. Abrir `http://localhost:5173` no navegador.
