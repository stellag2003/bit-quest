/** Kid-friendly copy for each failure code produced by the engine (SPEC-001..004). */
export const FAILURES = {
  empty: { title: 'Seu programa está vazio', hint: 'Toque nos comandos lá embaixo para montar o caminho.' },
  empty_loop: { title: 'O Repetir está vazio', hint: 'Coloque pelo menos um comando dentro do Repetir.' },
  empty_function: { title: 'A função está vazia', hint: 'Coloque comandos dentro da ★ Função antes de usá-la.' },
  function_not_called: { title: 'A função não foi chamada', hint: 'A função só roda quando um bloco ★ chama ela. Coloque um ★ no programa.' },
  incomplete_rule: { title: 'Falta completar a regra', hint: 'Toda regra precisa de um SE e de um ENTÃO.' },
  too_many_blocks: { title: 'Blocos demais!', hint: 'Use o Repetir para escrever menos.' },
  // Same failure in challenges without the Repetir block: just remove what is extra.
  too_many_blocks_plain: { title: 'Comandos demais!', hint: 'Há comandos sobrando. Tire um e tente de novo.' },
  edge: { title: 'O Bit quase saiu do mapa!', hint: 'Conte os quadradinhos até a bandeira.' },
  hit_wall: { title: 'Bonk! O Bit bateu na parede.', hint: 'Antes da parede, experimente Virar.' },
  // In fases drawn with trees (the meadow), the blocking tiles are trees: same failure, tree words.
  hit_wall_tree: { title: 'Bonk! O Bit bateu na árvore.', hint: 'Antes da árvore, experimente Virar.' },
  hit_rock: { title: 'O Bit tropeçou na pedra!', hint: 'Pedras são baixinhas: use Pular.' },
  jump_wall: { title: 'Essa parede é alta demais!', hint: 'Só dá para pular pedras. Para paredes, vire.' },
  jump_wall_tree: { title: 'Essa árvore é alta demais!', hint: 'Só dá para pular pedras. Para árvores, vire.' },
  bad_landing: { title: 'Não dá para pousar ali.', hint: 'O Bit pula 2 casas. Veja onde ele vai cair.' },
  not_reached: { title: 'Os comandos acabaram antes da bandeira.', hint: 'Falta pouco! Adicione mais comandos.' },
  stuck_loop: { title: 'O Bit está andando em círculos!', hint: 'Será que a curva é para o outro lado?' },
  too_long: { title: 'O Bit andou demais e se perdeu.', hint: 'Confira as regras: ele chega na bandeira?' },
};

export const ENCOURAGEMENTS = [
  'Errar faz parte de aprender.',
  'Todo programador testa e conserta.',
  'Achou um bug? Agora é só corrigir!',
  'Quase lá. Tente de novo!',
];

export const PRAISE = ['Mandou bem!', 'Programa perfeito!', 'Uau, funcionou!', 'Que lógica afiada!'];
