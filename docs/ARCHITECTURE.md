# Arquitetura

```
┌──────────────────────── presentation ────────────────────────┐
│ App (roteador) · Screens · Components · WorldView (canvas)    │
│ InputController + FocusNavigator (D-pad) · ThemeService       │
│ AudioDirector (eventos → sons)                                 │
└───────────────┬───────────────────────────────▲──────────────┘
                │ chama casos de uso             │ lê consultas
┌───────────────▼──────────── application ──────┴──────────────┐
│ CompleteLesson · StartChallenge → ChallengeSession            │
│ SubmitProgram · RefillEnergy · PurchasePalette · SelectMentor │
│ PlayerSummaryQuery · MapOverviewQuery · ProgressStore          │
└───────────────┬──────────────────────────────────────────────┘
                │ usa regras puras
┌───────────────▼────────────── domain ────────────────────────┐
│ World · commands (Registry) · sensors (Registry)              │
│ SequenceRunner · RuleRunner · ChallengeEvaluator               │
│ ProgressionRules · Curriculum · scoring · energy · streak      │
└──────────────────────────────────────────────────────────────┘
        ▲ dados                               ▲ portas
┌───────┴────── content ───────┐   ┌──────────┴──── infrastructure ─────────┐
│ fases · mentores · conquistas│   │ LocalStorageRepository · MemoryRepository│
│ paletas · textos de feedback │   │ SystemClock · ChiptuneAudio (Web Audio) │
└──────────────────────────────┘   └─────────────────────────────────────────┘
```

`src/main.js` é a **raiz de composição**: o único arquivo que conhece todas as camadas e escolhe as
implementações concretas (LocalStorage ou memória, relógio do sistema, sintetizador).

## Fluxo de uma execução

1. A criança monta blocos → o editor (`SequenceEditor` ou `RuleEditor`) mantém o programa como **dados**.
2. `ChallengeSession.submit(programa)` → `SubmitProgram` verifica energia e chama o `ChallengeEvaluator`.
3. O avaliador escolhe o *runner* pelo `kind` do desafio e roda o programa em cada mapa, produzindo um
   **trace** (lista de passos) e, se falhar, o código e o bloco culpado.
4. `SubmitProgram` aplica as consequências (energia, estrelas, XP, moedas, sequência, fase, mentor, medalhas)
   e devolve um *outcome*.
5. A tela só **reproduz** o trace no `WorldView` e mostra feedback. Ela nunca decide se o programa está certo.

## SOLID na prática

| Princípio | Onde |
|---|---|
| **S**ingle responsibility | Cada caso de uso é uma classe pequena; `WorldView` só desenha; `AudioDirector` só traduz eventos em sons. |
| **O**pen/closed | Comandos, sensores e runners vivem em registros; editores em `components/editors.js`; fases, mentores e medalhas são dados. Uma fase nova não altera código de tela nem de regra. |
| **L**iskov | Os runners (`SequenceRunner`, `RuleRunner`) e editores compartilham o mesmo contrato (`run/measure`, `getProgram/highlight/markError/...`) e são trocáveis. Todas as telas seguem `Screen`. |
| **I**nterface segregation | Telas recebem só o que usam via `ctx`; o domínio expõe funções puras pequenas (`energy.js`, `streak.js`, `scoring.js`). |
| **D**ependency inversion | Casos de uso dependem de portas (`repository.load/save`, `clock.now`, `bus.emit`). Os testes injetam `MemoryRepository` e um relógio falso. |

## Como adicionar uma fase

1. Escreva a spec em `docs/specs/` (objetivo, regras, critérios).
2. Crie `src/content/fases/faseN-*.js` com lição, desafios, `solution` e `reward`.
3. Registre no array de `src/content/fases/index.js`.
4. `npm test` prova automaticamente que cada desafio tem solução e respeita o limite de blocos.

Se a fase precisar de um comando novo (ex.: "pegar item"), registre-o em `domain/commands.js` e adicione o
rótulo/ícone em `presentation/ui/catalog.js`. O interpretador não muda.
