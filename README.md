# Bit Quest

**Jogue agora:** https://stellag2003.github.io/bit-quest/

Jogo mobile educativo (8–12 anos) que ensina **lógica de programação** dentro de um console portátil retrô.
A criança programa o robô **Bit** em três fases: **Sequências → Decisões (SE/ENTÃO) → Repetição (loops)**,
guiada por mentores reais da computação: Ada Lovelace, Grace Hopper, Alan Turing e Katherine Johnson.

HTML, CSS e JavaScript puros. Canvas 2D para o mundo em pixel art, Web Audio para os sons 8-bit e
LocalStorage para salvar o progresso. Sem backend e sem dependências.

## Como jogar

| Opção | Como |
|---|---|
| **Mais simples** | Abra `dist/bitquest.html` com duplo clique (arquivo único, funciona offline*). |
| Código-fonte | `npm start` → abra http://localhost:5173 (módulos ES precisam de um servidor). |
| Celular | Rode `npm start` no computador e acesse `http://<ip-do-computador>:5173` no celular, na mesma rede. |

\* Sem internet, as fontes pixel caem para uma fonte monoespaçada do sistema; o resto funciona igual.

**Controles:** toque na tela (principal) · D-pad/setas movem o cursor · **A**/Z/Enter confirma ·
**B**/X/Esc volta ou apaga o último bloco · **START**/Espaço executa · **SELECT**/Shift pede dica.

## Comandos

```bash
npm test        # 43 testes: motor, regras, progressão e prova de que todo desafio tem solução
npm run build   # gera dist/bitquest.html (bundle de arquivo único, sem dependências)
npm start       # servidor estático local
```

Requer Node 20+ apenas para testes, build e servidor; o jogo em si roda em qualquer navegador moderno.

## O que tem no jogo

- **9 desafios** em 3 fases, cada fase com uma lição curta e um exemplo animado.
- **Fase 1:** montar a sequência de comandos (Andar, Virar, Pular).
- **Fase 2:** o Bit anda sozinho; a criança escreve regras SE/ENTÃO. O último desafio exige que as
  **mesmas regras vençam dois mapas diferentes**: o programa reage ao ambiente.
- **Fase 3:** o bloco Repetir com **limite de blocos**; a recompensa mostra quanto o loop economizou.
- Feedback que não pune: o Bit para onde errou, o bloco culpado ganha um "!", aparece uma dica e
  "Tentar de novo" mantém o programa. Erros de montagem (programa vazio, regra incompleta) não gastam energia.
- Progressão: XP e níveis, estrelas, moedas, energia que recarrega, sequência de dias, 7 medalhas,
  mentores desbloqueáveis e **paletas de tela compráveis** (Clássico, Bolso, Pôr do sol, Oceano).
- Áudio sintetizado na hora: efeitos para cada ação, jingle de vitória e música-tema desligável.
- Acessibilidade: navegação completa por teclado/D-pad, rótulos ARIA, `prefers-reduced-motion`.
- Responsivo: de 320 px a desktop; com o celular deitado o console vira horizontal e o desafio
  passa para duas colunas.

## Mentores e fatos

As curiosidades usam fatos amplamente documentados (o algoritmo de Ada em 1843, a mariposa no Mark II
em 1947, a máquina de Turing de 1936, os cálculos de Katherine Johnson para os voos de 1961 e 1962).
As frases dos mentores são **originais do jogo** e a interface diz isso explicitamente: nenhuma citação
histórica foi atribuída a eles.

## Estrutura

```
docs/specs/        Especificações (fonte da verdade, escritas antes do código)
docs/ARCHITECTURE  Camadas, SOLID e como adicionar fases
src/domain/        Regras puras: mundo, comandos, sensores, interpretadores, progressão
src/application/   Casos de uso e consultas (sem DOM)
src/content/       Fases, mentores, medalhas, paletas e textos (dados)
src/infrastructure Persistência, relógio e sintetizador Web Audio
src/presentation/  Telas, componentes, pixel art, entrada (D-pad) e tema
styles/            Casca do console, componentes do LCD e telas
tests/             Testes com node:test, mapeados aos critérios das specs
tools/             Servidor estático e bundler de arquivo único
```

Detalhes em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e nas specs em [docs/specs/](docs/specs/).
