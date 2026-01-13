# Backend App - Gerenciador de Finanças Pessoais

Bem-vindo ao **Gerenciador de Finanças Pessoais**! Criei esta aplicação backend robusta para ajudar você a assumir o controle da sua vida financeira. Construída com uma stack moderna e tipada, ela fornece todas as ferramentas necessárias para rastrear despesas, gerenciamento de orçamentos, definição de metas financeiras ambiciosas e até mesmo a automação daqueles pagamentos recorrentes chatos.

Meu foco foi criar uma API RESTful segura, escalável e de fácil manutenção, que sirva como uma fundação sólida para qualquer interface frontend, seja um aplicativo móvel ou um painel web.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Como Funciona](#-como-funciona)
- [Começando](#-começando)
- [Arquitetura e Design](#-arquitetura-e-design)
- [Fluxo de Trabalho](#-fluxo-de-trabalho)

---

## 💡 Sobre o Projeto

Gerenciar dinheiro não deveria ser uma tarefa árdua. Desenvolvi este projeto para simplificar o rastreamento financeiro, oferecendo um conjunto completo de funcionalidades:

- **Rastreamento Inteligente de Transações**: Registre cada receita e despesa com detalhes. Implementei suporte a múltiplas **carteiras** (como Dinheiro, Conta Bancária ou Poupança) para que você possa separar os fundos, mas ainda visualizar seu patrimônio líquido total na sua moeda preferida (padrão BRL).
- **Transações Recorrentes Automatizadas**: Pare de lançar manualmente sua assinatura da Netflix ou o aluguel todo mês. Com o agendador baseado em CRON que configurei, você define as transações uma vez — mensalmente, semanalmente ou em horários personalizados — e o sistema cuida do resto automaticamente.
- **Orçamentos e Metas**: Mantenha seus gastos sob controle definindo **Orçamentos** mensais para categorias específicas. Planejando as férias dos sonhos? Cries **Metas** com prazos e acompanhe seu progresso enquanto economiza.
- **Segurança e Privacidade**: Protegi seus dados com criptografia de senha padrão da indústria (BCrypt) e autenticação JWT (JSON Web Token), garantindo que apenas você tenha acesso aos seus detalhes financeiros.

### Tecnologias Utilizadas

Utilizei o poder do **TypeScript** e **Node.js** para garantir um tempo de execução confiável. Escolhi o **Express** para lidar com requisições de forma eficiente, enquanto o **Prisma** serve como ORM moderno, tornando as interações com o banco de dados **PostgreSQL** intuitivas e seguras. Para garantir desempenho, implementei **Redis** para cache e gerenciamento de tarefas distribuídas, assegurando que o app permaneça rápido mesmo sob carga.

---

## 🏗 Arquitetura e Design

Acredito em código limpo, fácil de manter e escalar. Por isso, este projeto segue uma **Arquitetura em Camadas** estrita, separando responsabilidades em componentes lógicos distintos:

1. **Controllers**: O ponto de entrada para todas as requisições. Eles lidam com o "o quê" — validando a entrada e decidindo qual serviço chamar.
2. **Services**: O coração da aplicação. É aqui que coloquei a regra de negócio. Seja calculando o novo saldo de uma carteira ou processando um pagamento recorrente, a camada de Serviço lida com o "como".
3. **Repositories & Prisma**: Usam o Prisma para interagir profundamente com o banco de dados PostgreSQL, garantindo integridade dos dados sem riscos de injeção de SQL.

Também empreguei **Middlewares** para lidar com preocupações transversais como segurança. Antes de uma requisição chegar a um controller, ela passa pelos portões de autenticação e verificações de validação (impulsionadas pelo **Zod**) que configurei, para que dados inválidos nunca toquem a lógica principal.

---

## 🚀 Começando

Pronto para rodar o projeto? Facilitei tudo usando Docker.

### Pré-requisitos

Você precisará do **Node.js** (v18+) e **Docker** instalados na sua máquina. O Docker permite subir o banco de dados e o Redis sem que você precise instalá-los manualmente.

### Instalação

1. **Clone o código**:

    ```bash
    git clone <url-do-repositorio>
    cd backend-app
    ```

2. **Instale as dependências**:
    Baixe todas as bibliotecas necessárias.

    ```bash
    npm install
    ```

3. **Suba a infraestrutura**:
    Use o Docker Compose para iniciar o PostgreSQL e o Redis em segundo plano.

    ```bash
    docker-compose up -d
    ```

4. **Configure seu ambiente**:
    Crie um arquivo `.env` na raiz do projeto. Você precisará definir seu `DATABASE_URL`, `REDIS_URL` e uma `JWT_SECRET` segura. Verifique o `prisma/schema.prisma` ou o arquivo de exemplo para orientação.

5. **Inicialize o Banco de Dados**:
    Aplique o schema ao seu novo banco de dados local.

    ```bash
    npx prisma migrate dev
    ```

6. **Rode o App**:
    Inicie o servidor de desenvolvimento.

    ```bash
    npm run dev
    ```

    Sua API agora está viva em `http://localhost:3000`!

---

## 🔄 Fluxo de Trabalho (Gitflow)

Utilizo um processo estruturado de **Gitflow** para manter a base de código limpa e estável.

- **Main Branch**: É o estado pronto para produção. Se está na `main`, está estável.
- **Develop Branch**: O hub de integração. Todas as novas funcionalidades que desenvolvo pousam aqui primeiro para testes.
- **Feature Branches**: Trabalhando em algo novo? Eu crio uma branch como `feature/minha-nova-funcionalidade` a partir da `develop`. Quando termino, abro um Pull Request para mesclar de volta.

Isso garante que eu possa experimentar e construir rapidamente sem quebrar a aplicação principal.

---

## 🧪 Testes

Qualidade é a chave. Utilizo **Jest** para rodar uma suíte abrangente de testes. Você pode rodar `npm test` para verificar tudo, desde lógicas unitárias simples até fluxos de usuário completos (como criar uma transação recorrente e garantir que ela seja processada corretamente).
