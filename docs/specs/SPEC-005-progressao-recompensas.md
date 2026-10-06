# SPEC-005 — Progressão, recompensas, energia e sequência de dias

## Mapa de aprendizado
Ordem linear: `Fase 1 [Lição → D1 → D2 → D3] → Fase 2 [...] → Fase 3 [...]`.

| Nó | Disponível quando |
|---|---|
| Lição da fase N | fase N desbloqueada (N=1 sempre; N>1 quando a fase N-1 está completa) |
| Desafio 1 | lição feita |
| Desafio k | desafio k-1 concluído |

Fase completa = todos os desafios com ≥1 estrela. Nós bloqueados explicam **como** abrir
("Complete a fase Sequências para abrir").

## Estrelas
- 3 ★ — sem nenhuma execução com falha.
- 2 ★ — 1 ou 2 falhas.
- 1 ★ — 3 ou mais falhas.
- Usar mais blocos que a solução ideal limita a 2 ★ ("dá para fazer com menos").
- Guardamos sempre a melhor nota.

## Recompensas
| Evento | XP | Moedas |
|---|---|---|
| 1ª conclusão de desafio | 10 + 5×★ | 2×★ |
| Repetir desafio | 5 + 5×(★ ganhas a mais) | 2×(★ a mais) |
| Fase completa (1ª vez) | +50 | +20 + mentor desbloqueado |

Nível do jogador = `floor(XP / 100) + 1`.

## Energia (vidas)
- Máximo 5. Execução com falha gasta 1. Falhas de validação não gastam.
- Recupera 1 a cada 2 min; concluir um desafio devolve 1.
- Sem energia: modal com o tempo até a próxima e opção de recarregar por 15 moedas.

## Sequência de dias
- Concluir um desafio marca o dia. Dia seguinte consecutivo = +1; pular um dia zera para 1.
- A tela inicial mostra 0 se o último dia ativo foi antes de ontem.

## Conquistas (medalhas)
Definidas como dados com um predicado (`test(progress, ctx)`); avaliadas após cada vitória.

## Critérios de aceitação
- AC-5.1 Desafio 2 fica bloqueado até o desafio 1 ter estrela.
- AC-5.2 Concluir o último desafio da fase 1 marca a fase, dá bônus e desbloqueia Grace Hopper exatamente uma vez.
- AC-5.3 Energia nunca passa de 5 nem fica negativa; regenera com o relógio injetado.
- AC-5.4 Streak: ontem→hoje soma; anteontem→hoje reinicia.
