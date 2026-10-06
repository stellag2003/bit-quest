# SPEC-007 — Console, controles, áudio e persistência

## Console
- Casca do console com tela LCD de 4 tons, D-pad, A, B, SELECT, START e alto-falante.
- A legenda impressa abaixo da tela muda conforme a tela atual ("A escolher · B voltar · START executar").
- Paletas da tela (Clássico, Bolso, Pôr do sol, Oceano) são itens compráveis com moedas.

## Controles
| Entrada | Ação |
|---|---|
| Toque na tela | ação direta (principal para crianças) |
| D-pad / setas | move o cursor ▶ entre os botões da tela (navegação espacial) |
| A / Z / Enter | ativa o item sob o cursor |
| B / X / Esc | voltar; no editor, apaga o último bloco |
| START / Espaço | executar programa (nos desafios) |
| SELECT / Shift | pedir dica |

## Telas
Boot → Início → Mapa → Lição → Desafio → Recompensa → (Mentor desbloqueado) → Mapa.
Início também leva a Aprender (mentores, conceitos, medalhas) e Ajustes (som, música, paletas, apagar progresso).

## Áudio (Web Audio, sem arquivos)
Sons sintetizados em onda quadrada/triângulo: botão, cursor, bloco colocado/removido, passo, pulo, batida,
acerto, erro, estrela, XP, moeda, desbloqueio de mentor, conquista, jingle de vitória de fase, chime de boot
e uma música-tema em loop (desligável). O áudio é liberado no primeiro toque (política dos navegadores).
Os sons reagem a **eventos do jogo** via `EventBus` — as regras não conhecem o áudio.

## Persistência
- Chave `bitquest.save.v1` no LocalStorage; leitura tolerante (save corrompido → progresso novo).
- `migrateProgress` completa campos novos com padrões (saves antigos continuam válidos).
- Sem LocalStorage disponível (modo privado), o jogo roda em memória.

## Critérios de aceitação
- AC-7.1 Desligar "Sons" silencia efeitos; desligar "Música" para a música na hora.
- AC-7.2 Apagar progresso exige confirmação em dois toques.
- AC-7.3 Trocar a paleta redesenha sprites e tela imediatamente.
