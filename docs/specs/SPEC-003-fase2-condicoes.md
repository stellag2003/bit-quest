# SPEC-003 — Fase 2: Decisões SE / ENTÃO (mentora: Grace Hopper)

## Objetivo
Mostrar que programas **tomam decisões olhando o ambiente**.

## Modelo
Nesta fase o Bit anda sozinho. O jogador escreve **regras**: `SE <sensor> ENTÃO <ação>`.

A cada passo (tick):
1. As regras são testadas em ordem; a primeira cujo sensor for verdadeiro dispara sua ação.
2. Se nenhuma regra disparar, o Bit faz a ação padrão: **Andar**.
3. Para ao chegar na bandeira (sucesso) ou ao errar (falha).

Sensores: `rockAhead` (pedra à frente), `wallAhead` (parede ou borda à frente).
Ações: Pular, Virar ↺, Virar ↻.

## Proteções
- Se o Bit repetir exatamente a mesma posição+direção, ele está andando em círculos → falha `stuck_loop`
  (detectado na hora, sem esperar o limite).
- Limite de segurança de 60 ticks → `too_long`.
- Regra pela metade (só SE ou só ENTÃO) ou nenhuma regra → `incomplete_rule` (sem gastar energia).

## Desafios
| Id | Nome | Regras | Mapas |
|---|---|---|---|
| f2-c1 | Pule as pedras | SE pedra → Pular | 1 |
| f2-c2 | Desvie das paredes | SE parede → Virar ↻ | 1 |
| f2-c3 | Dois mapas | SE pedra → Pular; SE parede → Virar ↻ | **2** (o mesmo programa precisa vencer os dois) |

O desafio com dois mapas mostra o poder da decisão: o programa não sabe o mapa, ele **reage** a ele.

## Critérios de aceitação
- AC-3.1 A carta da regra que disparou acende durante a animação; o passo padrão acende o indicador "Senão, o Bit anda".
- AC-3.2 Virar para o lado errado em f2-c2 resulta em `stuck_loop` com dica sobre o lado da curva.
- AC-3.3 Em desafios multi-mapa, o jogador vê abas "Mapa 1 / Mapa 2"; a execução roda os dois em sequência e
  a falha informa qual mapa falhou.
