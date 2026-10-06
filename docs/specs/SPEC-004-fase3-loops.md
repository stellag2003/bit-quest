# SPEC-004 — Fase 3: Repetição / loops (mentor: Alan Turing)

## Objetivo
Ensinar que `REPETIR N× [blocos]` executa os blocos N vezes, **economizando comandos**.

## Comportamento
1. A paleta ganha o bloco **Repetir**. Ao adicioná-lo, o cursor entra automaticamente dentro dele:
   os próximos comandos vão para o corpo do loop.
2. Tocar no contador `×N` alterna entre 2 e 9.
3. Tocar em "fechar loop" (ou adicionar quando o corpo está cheio) volta o cursor para fora.
4. Cada desafio tem **limite de blocos** que só é atingível com loop. O contador "Blocos 2/3" fica visível.
5. Durante a execução, o bloco atual acende e o loop mostra a volta atual ("2/5").
6. Ao vencer, a recompensa compara: "Sem loop: 9 comandos · Com loop: 3 blocos".

## Regras de contagem
- Cada bloco conta 1 (o Repetir também). Corpo do loop: no máximo 4 blocos. Não há loop dentro de loop nesta fase.
- `REPETIR` vazio → `empty_loop` (sem gastar energia). Acima do limite → `too_many_blocks`.

## Desafios
| Id | Nome | Solução | Limite |
|---|---|---|---|
| f3-c1 | Corredor longo | Repetir 5× [Andar] | 2 |
| f3-c2 | Escada | Repetir 3× [Andar, Virar ↺, Andar, Virar ↻] | 5 |
| f3-c3 | Saltos no ritmo | Repetir 3× [Andar, Pular] | 3 |

Mensagem ao concluir o primeiro loop:
> "Você acabou de criar um loop! Ele permite repetir uma ação várias vezes sem precisar escrever o mesmo comando."

## Critérios de aceitação
- AC-4.1 `expandedLength(Repetir 5× [Andar]) = 5` e `countBlocks = 2`.
- AC-4.2 A solução de cada desafio cabe no limite; a versão sem loop **não** cabe.
