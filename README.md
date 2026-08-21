# Ulbra Gym

Sistema completo de gestão para academias: cadastro de alunos, montagem de treinos com demonstração em vídeo, controle financeiro de planos e pagamentos, e ficha de anamnese. Multi-papel (aluno, professor, administrador), com aplicativo mobile via Capacitor.

## Funcionalidades

**Aluno**
- Login e área própria com resumo de treinos e situação financeira
- Visualização dos treinos da semana, com carga, repetições e demonstração em vídeo de cada exercício
- Acompanhamento do próprio plano (ativo, vencendo ou vencido)

**Professor**
- Cadastro e gestão de alunos
- Montagem e edição de treinos por dia da semana, com exercícios do catálogo
- Vínculo de plano e registro de pagamentos
- Preenchimento da ficha de anamnese (saúde e contato de emergência) — visível apenas para professor/admin, nunca para o aluno

**Administrador**
- Tudo que o professor tem acesso, mais:
- Cadastro e gestão de professores
- Cadastro do catálogo de exercícios, com busca e vínculo automático de gif demonstrativo via [WorkoutX API](https://workoutxapp.com/)
- Gestão de planos (criação, edição, remoção)

## Regras de negócio

- **Plano ativo controla o acesso**: um plano é considerado ativo enquanto `valido_ate` (data do pagamento + duração do plano em dias) não passou. Isso trava dois pontos diferentes:
  - O professor não consegue **montar um treino novo** pra um aluno sem plano ativo (mas continua livre pra **editar** um treino já existente, mesmo com o plano vencido).
  - O aluno não consegue **ver os treinos já montados** enquanto o plano estiver vencido ou nunca tiver sido confirmado — recebe uma tela orientando a renovar, em vez dos treinos.
- **Plano sem duração fixa** (`duracao_dias = 0`) é uma opção válida — o pagamento fica com validade igual à própria data de confirmação, tratado à parte de um plano sem duração cadastrada (`null`), que fica sem data de validade.
- **Valor do pagamento**: quando o próprio aluno solicita um plano, o valor vem sempre do cadastro do plano (não pode ser manipulado pelo aluno); quando é o professor/admin que registra na recepção, o valor pode ser ajustado manualmente (desconto, por exemplo).
- **Papéis com permissão isolada por endpoint e por tela**: aluno, professor e admin são tabelas separadas com IDs independentes — toda rota da API confere explicitamente o papel de quem está logado antes de agir, pra não confundir registros de tabelas diferentes que coincidentemente têm o mesmo ID. O front reforça isso: cada rota do app declara quais papéis podem acessá-la, e um guard de navegação barra e redireciona pro login antes mesmo da tela carregar — mesmo digitando a URL direto, um aluno não abre uma tela de admin/professor (e vice-versa).
- **Anamnese é dado restrito**: fica visível e editável só por professor/admin. O próprio aluno não tem acesso a essa informação em nenhuma tela ou rota da API.
- **Catálogo de exercícios sem vídeo vinculado** continua editável — um exercício cadastrado antes de ter uma demonstração do WorkoutX associada não fica bloqueado por isso.
- **Cadastro de aluno** dispara o e-mail com a senha de acesso de forma assíncrona — se o envio falhar, o cadastro em si não é desfeito nem trava a resposta.

## Tecnologias

**Frontend** (`front/`)
- [Angular 20](https://angular.dev/) (standalone components) + [Ionic 8](https://ionicframework.com/)
- [Capacitor 8](https://capacitorjs.com/) — build para Android/iOS a partir do mesmo código
- Deploy: [Vercel](https://vercel.com/)

**Backend** (`back/`)
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Knex.js](https://knexjs.org/) + PostgreSQL (hospedado no [Supabase](https://supabase.com/))
- Autenticação via [JWT](https://jwt.io/) + senhas com [bcrypt](https://www.npmjs.com/package/bcryptjs)
- [Helmet](https://helmetjs.github.io/) (headers de segurança) e [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) (proteção contra força bruta no login)
- Deploy: Vercel (serverless functions)

## Estrutura do projeto

```
academia ulbra/
├── back/                   # API REST (Node/Express)
│   ├── controllers/        # regras de negócio por recurso
│   ├── middlewares/        # autenticação (JWT) e validação de entrada
│   ├── database/
│   │   └── migrations/     # versionamento do schema (Knex)
│   ├── seeds/               # dados iniciais (admin, exercícios)
│   ├── routes.js
│   └── server.js
└── front/                  # App Ionic/Angular
    └── src/app/
        ├── pages/           # uma pasta por tela
        └── services/        # autenticação, interceptor HTTP
```

## Como rodar localmente

Pré-requisitos: Node.js 20+, uma instância PostgreSQL (ex: um projeto gratuito no [Supabase](https://supabase.com/)) e uma chave de API do [WorkoutX](https://workoutxapp.com/) (opcional — só necessária pra buscar/vincular gifs de exercícios).

### Backend

```bash
cd back
npm install
cp .env.example .env   # preencha com suas credenciais (veja abaixo)
npx knex migrate:latest
npx knex seed:run       # cria o admin inicial e alguns exercícios de exemplo
node server.js
```

Variáveis de ambiente (`back/.env`):

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta do servidor local (padrão: 3000) |
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `APP_SECRET` | Chave secreta usada pra assinar os tokens JWT — gere uma string aleatória grande |
| `FRONT_URL` | URL(s) do front autorizadas no CORS, separadas por vírgula |
| `EMAIL_USER` / `EMAIL_PASS` | Credenciais do serviço de e-mail (envio de senha no cadastro do aluno) |
| `WORKOUTX_API_KEY` | Chave da API do WorkoutX, usada pra buscar/exibir gifs de exercícios |

### Frontend

```bash
cd front
npm install
npm start   # abre em http://localhost:8100
```

Ajuste a URL da API em `front/src/environments/environment.ts` (desenvolvimento) e `environment.prod.ts` (produção).

### Gerando o app mobile

```bash
cd front
npm run build
npx cap sync
npx cap open android   # ou: npx cap open ios
```

## Segurança

- Autenticação por token JWT (expira em 7 dias) com papéis (`aluno`, `professor`, `admin`) checados em cada endpoint
- Senhas nunca armazenadas em texto puro (bcrypt)
- Rotas do frontend protegidas por guard de autenticação e de papel — usuário não autorizado é redirecionado antes de a página carregar
- Rate limiting no login (10 tentativas / 15 min) contra força bruta
- Dados de anamnese (saúde) restritos a professor/admin — o próprio aluno não tem acesso a essa informação
- Chave da API do WorkoutX nunca é exposta ao navegador (o backend atua como proxy)

## Licença

Projeto proprietário — todos os direitos reservados.
