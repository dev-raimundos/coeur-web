# Coeur

Aplicação web para gestão doméstica — hoje focada em controle de acesso e na casca (shell) da aplicação, com o módulo de gastos financeiros como próximo passo. É um projeto de uso pessoal (eu e minha esposa usamos pra organizar as contas de casa), mas escrito e documentado como **peça de portfólio**: o objetivo aqui é mostrar como eu estruturo um frontend Angular do zero — arquitetura, decisões técnicas e testes — não só entregar a funcionalidade.

Por isso este README fala mais de **como o projeto é construído** do que do que ele faz.

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Angular 21, standalone components | Sem `NgModule`; cada componente declara suas próprias dependências via `imports`. |
| Reatividade | Signals (`signal`, `computed`, `effect`) | Estado local e de serviços é 100% signal-based — nenhum `BehaviorSubject` pra guardar estado de UI. |
| Change detection | Zoneless (sem `zone.js`) | O pacote nem está nas dependências; a detecção de mudanças roda pelos signals e pelo scheduler nativo do Angular. |
| UI | Angular Material 3 (M3) | Tema gerado a partir de cores/tipografia customizadas (ver [`styles.scss`](src/styles.scss)), com tema claro/escuro alternável em runtime. |
| HTTP | `HttpClient` funcional + interceptors | Sem serviços "fachada" por módulo: cada feature chama a API diretamente. |
| Testes | Vitest + Angular `TestBed` | `ng test` já roda em Vitest (builder `@angular/build:unit-test`), sem Karma/Jasmine. |
| Build/deploy | Docker multi-stage + Nginx | Ver [`Dockerfile`](Dockerfile) e [`nginx.conf`](nginx.conf). |

## Arquitetura

```
src/app/
├── core/                    # Tudo que é transversal à aplicação
│   ├── guards/               # authGuard / guestGuard (CanActivateFn)
│   ├── interceptors/         # injeta baseUrl da API + toast de erro global
│   ├── layout/shell/         # casca autenticada: sidenav, toolbar, menu de usuário
│   ├── screens/               # 404 / erro interno
│   └── services/
│       ├── authentication/   # sessão via cookie HttpOnly
│       ├── notification/      # toasts (MatSnackBar)
│       └── theme/             # tema claro/escuro
├── modules/                  # Features, uma pasta por tela (dashboard, login, usuários, config)
└── shared/models/            # interfaces/DTOs compartilhados
```

A ideia por trás dessa divisão: `core` é código de infraestrutura que qualquer feature pode depender (guards, interceptors, serviços transversais), `modules` é onde a regra de negócio de cada tela vive, e nada em `modules` deveria precisar ser importado por outro módulo — se precisar, o candidato certo é subir pra `shared` ou `core`.

### Autenticação sem token no client

O backend (uma API separada, fora deste repo) devolve a sessão num cookie `HttpOnly` — o client nunca vê nem guarda um token. Isso significa:

- **[`AuthService`](src/app/core/services/authentication/auth.service.ts)** não tem `getToken()`; ele só expõe signals (`isLoggedIn`, `currentUser`) alimentados por `POST /auth/login`, `POST /auth/logout` e `GET /auth/me`.
- **[`ApiUrlInterceptor`](src/app/core/interceptors/api-url.interceptor.ts)** prefixa toda chamada relativa (`/api/...`) com a URL da API e força `withCredentials: true`, pra garantir que o cookie sempre é enviado.
- **[`app.config.ts`](src/app/app.config.ts)** roda `AuthService.fetchCurrentUser()` como `provideAppInitializer`, resolvendo a sessão *antes* da primeira navegação — assim os guards abaixo nunca decidem com estado desatualizado.
- **[`authGuard`](src/app/core/guards/auth.guard.ts)** e **[`guestGuard`](src/app/core/guards/guest.guard.ts)** são `CanActivateFn` simples, sem herança de classe — o padrão funcional que o Angular recomenda desde a v15.

### Erros como Problem Details

A API segue [RFC 9110 §15.5.2](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.2) (Problem Details) e manda, em toda resposta de erro, uma extensão `toast` com `type` e `message` já prontos pra exibição. O **[`HttpErrorInterceptor`](src/app/core/interceptors/http-error-toast.interceptor.ts)** lê essa extensão e dispara o toast global — nenhum componente precisa tratar erro de HTTP manualmente, a menos que queira um comportamento diferente do padrão.

### Tema em runtime

O tema (claro/escuro) não é decidido em build time: **[`ThemeService`](src/app/core/services/theme/theme.service.ts)** guarda a preferência num signal, persiste em `localStorage` e aplica alternando a classe `.dark` na raiz do documento — o resto é CSS puro (`mat.theme-overrides` com os tokens M3 de cada tema, ver [`styles.scss`](src/styles.scss)). Ele é registrado como `provideAppInitializer` pra aplicar a preferência salva antes do primeiro paint, evitando flash do tema errado.

## Testes

Todo serviço, guard e componente com lógica não trivial tem `*.spec.ts` ao lado (co-localizado, não numa pasta `__tests__` separada). A convenção usada:

- **Serviços**: `TestBed.inject`, sem mocks de framework — dependências externas (`HttpClient`, `Router`) são substituídas via `useValue`/`useClass` no próprio `TestBed.configureTestingModule`.
- **Componentes com signals de dependências**: o mock é o próprio `signal()` (ex. `{ provide: AuthService, useValue: { currentUser: signal(null), logout: vi.fn() } }`), o que permite simular mudanças de estado no teste chamando `.set()` diretamente — sem precisar de `Subject`/`BehaviorSubject` fake.
- **`effect()` em serviços**: como a app é zoneless, um `effect()` só é executado de fato depois de um flush explícito — os testes chamam `TestBed.tick()` antes de checar o efeito colateral (ex. classe `dark` no DOM).
- **Guards funcionais**: chamados dentro de `TestBed.runInInjectionContext(() => guard(...))`, já que são funções puras que dependem de `inject()`.

Rodar a suíte:

```bash
npm test        # ou: ng test
```

## Rodando localmente

```bash
npm install
npm start        # ng serve — http://localhost:4200
```

A app espera uma API em `environment.apiUrl` (`src/environments/environment.development.ts`, hoje `http://localhost:8000`) que fale o protocolo de cookie HttpOnly + Problem Details descrito acima.

### Build e Docker

```bash
npm run build                       # build de produção em dist/coeur-web/browser
docker build -t coeur-web .          # build multi-stage: Angular -> Nginx
docker run -p 8080:80 coeur-web
```

O [`nginx.conf`](nginx.conf) já resolve o fallback de SPA (`try_files ... /index.html`) e cache de assets estáticos.

## Estado atual

- ✅ Autenticação (login/logout/sessão), shell com navegação, guards, tema claro/escuro, toasts de erro globais.
- 🚧 Dashboard, Usuários e as telas de gestão financeira em si ainda são placeholders — é o próximo passo.

## Convenções de código

- 4 espaços, aspas simples, `printWidth` 100 — tudo via Prettier (`.prettierrc`), sem configuração manual de estilo.
- Path aliases (`@core/*`, `@shared/*`, `@app/*`, `@env`) em vez de `../../../` — ver `tsconfig.json`.
- Comentários só quando explicam o *porquê* de uma decisão não óbvia (ex. por que um interceptor faz algo do jeito que faz); nome de variável/função é a documentação do *o quê*.
