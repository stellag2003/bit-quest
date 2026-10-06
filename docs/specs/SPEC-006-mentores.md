# SPEC-006 — Mentores

## Objetivo
Apresentar pessoas reais da computação como guias, com fatos verificáveis e **frases originais do jogo**.

## Dados de cada mentor
`id, name, years, area, intro, fact, message, unlockedBy, sprite`.

- `message` é **sempre criada para o jogo**. A interface mostra o selo
  "Frase criada para o jogo. Não é uma citação histórica.".
- `fact` usa apenas fatos amplamente documentados (ex.: a mariposa no Mark II em 1947).

| Mentor | Desbloqueio | Guia da fase |
|---|---|---|
| Ada Lovelace | início | Sequências |
| Grace Hopper | completar Sequências | Decisões |
| Alan Turing | completar Decisões | Repetição |
| Katherine Johnson | completar Repetição | — (recompensa final) |

## Comportamento
- Desbloqueio dispara a tela de revelação: silhueta → pixels surgindo em ordem aleatória → nome + som.
- Na biblioteca ("Aprender"), mentores bloqueados aparecem como silhueta com a condição de desbloqueio.
- O jogador escolhe o "mentor atual", que aparece na tela inicial.

## Critérios de aceitação
- AC-6.1 Mentor só pode ser escolhido como guia se estiver desbloqueado.
- AC-6.2 Desbloquear duas vezes o mesmo mentor não duplica a lista.
