# SPEC-000 — Visão geral e regras transversais

## Objetivo
Bit Quest é um jogo mobile educativo (8–12 anos) que ensina **sequência → condições → repetição**
fazendo a criança programar o robô **Bit** dentro de um console portátil retrô.

## Glossário (linguagem do domínio)
| Termo | Significado |
|---|---|
| Fase | Unidade do mapa que ensina um conceito (Sequências, Decisões, Repetição). |
| Lição | Primeiro nó de cada fase: explicação curta + exemplo animado. |
| Desafio | Puzzle jogável dentro de uma fase. Cada fase tem 3. |
| Programa | O que a criança monta: lista de blocos (sequência/loop) ou lista de regras (SE/ENTÃO). |
| Execução (run) | Interpretação do programa sobre um ou mais mapas, gerando um *trace* de passos. |
| Energia | "Vidas" do Bit. Gasta 1 por execução que falha. Recarrega com o tempo. |
| Mentor | Personagem histórico da computação desbloqueado ao concluir fases. |

## Regras transversais
1. Toda regra de jogo vive na camada **domain** e é testável sem navegador.
2. Conteúdo (fases, mentores, conquistas, paletas, textos de feedback) é **dado**, não código de tela.
   Criar uma fase nova = adicionar um arquivo em `src/content/fases/` e registrá-lo no índice.
3. A interface nunca decide se o programa está certo; ela só exibe o *trace* produzido pelo domínio.
4. Erros nunca bloqueiam a criança: sempre existe "Tentar de novo", uma dica e uma frase de incentivo.
5. Textos curtos: no máximo ~2 frases por caixa de diálogo.

## Critérios de aceitação globais
- AC-0.1 O jogo abre de um único `index.html` (ou `dist/bitquest.html`) sem backend.
- AC-0.2 Todo progresso sobrevive a recarregar a página (LocalStorage).
- AC-0.3 Jogável só com toque, só com teclado, ou só com os botões virtuais (D-pad/A/B/START/SELECT).
- AC-0.4 Funciona de 320 px de largura até desktop; em celular deitado o console vira horizontal.
- AC-0.5 `prefers-reduced-motion` desliga partículas, tremidas e máquina de escrever.

## Validação
`npm test` executa as specs automatizadas (`tests/*.test.js`), incluindo a prova de que **todo desafio
tem solução válida** e respeita seu limite de blocos.
