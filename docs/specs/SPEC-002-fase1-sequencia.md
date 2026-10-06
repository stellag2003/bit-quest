# SPEC-002 — Fase 1: Sequências (mentora: Ada Lovelace)

## Objetivo
Ensinar que um programa é uma **lista de comandos executados em ordem**.

## Comportamento
1. O jogador vê o mapa, o objetivo ("Leve o Bit até a bandeira") e a paleta: Andar, Virar ↺, Virar ↻, Pular.
2. Tocar num comando o adiciona ao fim do programa. Tocar num bloco do programa o remove. B remove o último.
3. Executar (botão na tela ou START) anima o Bit passo a passo, destacando o bloco atual.
4. Chegou na bandeira → desafio concluído → tela de recompensa.
5. Falhou → o Bit para onde errou, o bloco culpado pisca, aparece mensagem amigável + dica + "Tentar de novo".
6. Tentar de novo devolve o Bit ao início **mantendo o programa** (corrigir, não recomeçar).

## Desafios
| Id | Nome | Ideia | Solução mínima |
|---|---|---|---|
| f1-c1 | Primeiros passos | linha reta | Andar ×3 (3 blocos) |
| f1-c2 | A curva | Andar, Andar, Virar ↻, Andar, Andar (exemplo do briefing) | 5 blocos |
| f1-c3 | Pedra no caminho | introduz Pular | Andar, Pular, Virar ↺, Andar, Andar (5) |

## Estados da tela
`editando` → `executando` → (`sucesso` | `falha`) → `editando`; `sem-energia` (modal).

## Critérios de aceitação
- AC-2.1 Cada desafio tem solução que o motor aceita (teste automático).
- AC-2.2 Programa vazio mostra "Seu programa está vazio" sem gastar energia.
- AC-2.3 Programa máximo de 12 blocos; paleta desabilita quando cheio.
- AC-2.4 A falha indica o passo ("no passo 3") e destaca o bloco.

## Casos de erro
`empty`, `edge`, `hit_wall`, `hit_rock`, `jump_wall`, `bad_landing`, `not_reached` — textos em `src/content/feedback.js`.
