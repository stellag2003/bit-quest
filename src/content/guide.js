import { ENERGY_MAX, ENERGY_REGEN_MS } from '../domain/energy.js';
import { REWARDS } from '../domain/scoring.js';
import { ECONOMY } from './palettes.js';

/**
 * "Como jogar": the welcome tour shown on the first launch (and from the "?"
 * on the home screen). Each item is [icon, label, detail]; `key` items show a
 * button name instead of an icon.
 */
export const GUIDE = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Bit Quest!',
    text: 'Você joga com a Mary! Juntas, ensinem o robô Bit a chegar à bandeira.',
    robot: true,
    items: [
      ['flag', 'Objetivo', 'levar o Bit até a bandeira'],
      ['map', '6 fases', 'de Sequências até Tudo junto'],
    ],
  },
  {
    id: 'sequence',
    title: 'Fase 1 · Sequências',
    text: 'Toque nos comandos para montar o caminho. O Bit faz tudo na ordem.',
    items: [
      ['walk', 'Andar', 'um quadradinho para a frente'],
      ['turnLeft', 'Virar esq.', 'gira para a esquerda'],
      ['turnRight', 'Virar dir.', 'gira para a direita'],
      ['jump', 'Pular', 'passa por cima de pedras'],
    ],
  },
  {
    id: 'rules',
    title: 'Fase 2 · Decisões',
    text: 'Agora o Bit anda sozinho. Você escreve regras SE/ENTÃO para ele decidir o que fazer no caminho.',
    items: [
      ['rock', 'SE pedra à frente', 'ENTÃO pular'],
      ['wall', 'SE parede à frente', 'ENTÃO virar'],
      ['map', 'Dois mapas', 'as mesmas regras precisam vencer os dois'],
    ],
  },
  {
    id: 'repeat',
    title: 'Fase 3 · Repetição',
    text: 'O bloco Repetir faz os comandos de dentro várias vezes. Com ele você escreve menos e faz mais.',
    items: [
      ['repeat', 'Repetir', 'coloque comandos dentro dele'],
      ['trophy', 'Limite de blocos', 'cada desafio tem um máximo'],
    ],
  },
  {
    id: 'debug',
    title: 'Fase 4 · Depuração',
    text: 'Aqui o programa já vem com um bug. Rode, veja onde o Bit erra e conserte.',
    items: [
      ['bug', 'Ache o bug', 'rode e veja onde o Bit para'],
      ['trash', 'Tire um bloco', 'toque no bloco errado'],
      ['repeat', 'Mude um número', 'toque no × do Repetir'],
    ],
  },
  {
    id: 'functions',
    title: 'Fase 5 · Funções',
    text: 'Monte a ★ Função uma vez e use o bloco ★ quantas vezes quiser.',
    items: [
      ['star', '★ Função', 'junte até 4 blocos nela'],
      ['play', 'Bloco ★', 'faz tudo o que está na função'],
      ['trophy', 'Fase 6 · Tudo junto', 'mistura tudo o que você aprendeu'],
    ],
  },
  {
    id: 'run',
    title: 'Executar e consertar',
    text: 'Quando o programa estiver pronto, execute e veja o Bit andar. Errar faz parte de programar!',
    items: [
      ['play', 'Executar', 'roda o seu programa'],
      ['bug', 'Bloco com "!"', 'mostra onde o Bit errou'],
      ['hint', 'Dica', 'peça ajuda quando travar'],
      ['back', 'Tentar de novo', 'seu programa continua lá'],
    ],
  },
  {
    id: 'energy',
    title: 'Energia',
    text: `Você tem até ${ENERGY_MAX} de energia. Cada execução que dá errado gasta 1. Programa vazio ou regra incompleta não gasta.`,
    items: [
      ['energy', 'Recarrega sozinha', `+1 a cada ${ENERGY_REGEN_MS / 60000} minutos`],
      ['check', 'Vencer devolve', '+1 energia por desafio concluído'],
      ['coin', 'Recarga rápida', `${ECONOMY.energyRefillPrice} moedas enchem tudo`],
      ['star', 'Nível Fácil', 'errar não gasta energia'],
    ],
  },
  {
    id: 'rewards',
    title: 'Recompensas',
    text: 'Quanto menos erros e blocos, mais estrelas. Cada desafio vencido dá XP e moedas.',
    items: [
      ['star', 'Estrelas', 'até 3 por desafio'],
      ['coin', 'Moedas', `${REWARDS.coinsPerStar} por estrela, +${REWARDS.faseBonusCoins} por fase`],
      ['flame', 'Sequência', 'jogue todo dia para aumentar'],
      ['trophy', 'Medalhas', 'conquistas especiais'],
    ],
  },
  {
    id: 'mentors',
    title: 'Mentores e Aprender',
    text: 'Pessoas reais da computação acompanham você. Complete fases para desbloquear novos mentores.',
    items: [
      ['person', 'Mentores', 'Ada, Grace, Alan, Katherine, Sonja, Liane e Steve'],
      ['book', 'Aprender', 'mentores, conceitos e medalhas'],
      ['palette', 'Cores da tela', 'cada cor nova traz uma música nova'],
    ],
  },
  {
    id: 'controls',
    title: 'Controles',
    text: 'Toque na tela para jogar. Também dá para usar o direcional, os botões A e B ou o teclado.',
    items: [
      ['key', 'Setas', 'mover o cursor'],
      ['key', 'A', 'confirmar (Z ou Enter)'],
      ['key', 'B', 'voltar ou apagar (X ou Esc)'],
    ],
  },
];
