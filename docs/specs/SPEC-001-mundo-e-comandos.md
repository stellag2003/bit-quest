# SPEC-001 — Mundo, comandos e execução

## Objetivo
Um motor determinístico que recebe um mapa e um programa e devolve **o que aconteceu, passo a passo**.

## Mapa (World)
Mapas são linhas de texto do mesmo tamanho:

| Glifo | Significado |
|---|---|
| `.` | chão (pode andar) |
| `#` | parede/árvore/caixa — alta, não dá para pular |
| `R` | pedra — baixa, dá para pular por cima |
| `G` | bandeira (objetivo) |
| `> < ^ v` | posição inicial do Bit e direção (leste, oeste, norte, sul) |

Regras: exatamente um início e uma bandeira; linhas com a mesma largura; fora do mapa = `void`.

## Comandos
| Comando | Efeito | Erros possíveis |
|---|---|---|
| `walk` (Andar) | 1 casa para frente | `edge` (sai do mapa), `hit_wall`, `hit_rock` |
| `turnLeft` / `turnRight` | gira 90° no lugar | — |
| `jump` (Pular) | 2 casas para frente, passando por cima de 1 | `edge`, `jump_wall` (parede é alta), `bad_landing` (pousaria em pedra/parede) |

Comandos ficam num `Registry`: adicionar um comando novo não altera o interpretador (Open/Closed).

## Resultado de execução (trace)
```
{ success, steps: [{ nodeId, command, from, to, motion, ok, error, target, loops }], failure, finalState }
failure = { code, stepIndex, nodeId, mapIndex? }
```
- O Bit **vence assim que pisa na bandeira** (comandos restantes são ignorados).
- Se os comandos acabarem antes: `not_reached`.
- Falhas de validação (antes de mover) têm `stepIndex = -1` e **não gastam energia**.

## Critérios de aceitação
- AC-1.1 Andar em chão move 1 casa; andar contra parede/pedra/borda falha com o código correto e o Bit não se move.
- AC-1.2 Virar não muda a posição.
- AC-1.3 Pular sobre pedra pousa 2 casas à frente; pular parede falha com `jump_wall`.
- AC-1.4 O passo com erro aponta o `nodeId` do bloco culpado (para a interface destacar).
- AC-1.5 Mapas inválidos (sem início, sem bandeira, glifo desconhecido, largura irregular) lançam erro na carga.

## Validação
`tests/world.test.js`, `tests/commands.test.js`.
