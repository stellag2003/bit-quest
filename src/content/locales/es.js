import { ENERGY_MAX, ENERGY_REGEN_MS } from '../../domain/energy.js';
import { REWARDS } from '../../domain/scoring.js';
import { ECONOMY } from '../palettes.js';

/** Spanish translation of the game content. Ids mirror the Portuguese source. */
export const ES = {
  fases: {
    f1: {
      title: 'Secuencias',
      concept: {
        title: 'Secuencia',
        summary: 'Un programa es una lista de comandos. La computadora hace uno a la vez, del primero al último.',
      },
      lesson: [
        '¡Hola! Soy Ada. Este es Bit, un robot al que le encanta seguir instrucciones.',
        'Un programa es una lista de comandos. Bit hace uno a la vez, en orden.',
        'Si cambia el orden, cambia el camino. ¿Armamos tu primer programa?',
      ],
      challenges: {
        'f1-c1': {
          title: 'Primeros pasos',
          goal: 'Lleva a Bit hasta la bandera.',
          hints: ['Cuenta los cuadritos entre Bit y la bandera.', 'Son 3 pasos hacia adelante: Caminar, Caminar, Caminar.'],
        },
        'f1-c2': {
          title: 'La curva',
          goal: 'La bandera está después de la curva.',
          hints: ['Bit tiene que girar antes del árbol.', 'Camina 2, gira a la derecha y camina 2 más.'],
        },
        'f1-c3': {
          title: 'Piedra en el camino',
          goal: 'Pasa la piedra y llega a la bandera.',
          hints: ['Las piedras son bajitas: puedes Saltar por encima.', 'Camina, salta la piedra, gira a la izquierda y camina 2.'],
        },
      },
    },
    f2: {
      title: 'Decisiones',
      concept: {
        title: 'Condición',
        summary: 'SI pasa algo, ENTONCES haz una acción. Así el programa decide solo qué hacer.',
      },
      lesson: [
        '¡Hola, soy Grace! Ahora Bit camina solo... pero el camino tiene sorpresas.',
        'Los programas toman decisiones. SI hay una piedra adelante, ENTONCES Bit salta.',
        'Cuando ninguna regla coincide, Bit simplemente camina hacia adelante.',
      ],
      challenges: {
        'f2-c1': {
          title: 'Salta las piedras',
          goal: 'Crea una regla para pasar las piedras.',
          hints: ['Elige el SI: ¿qué ve Bit adelante?', 'SI piedra adelante, ENTONCES saltar.'],
        },
        'f2-c2': {
          title: 'Esquiva las paredes',
          goal: 'Enséñale a Bit a tomar las curvas solo.',
          hints: ['¿Qué hacer cuando aparece una pared?', 'Mira hacia dónde sigue el camino: la curva es a la derecha.'],
        },
        'f2-c3': {
          title: 'Dos mapas',
          goal: 'Las mismas reglas tienen que ganar en los 2 mapas.',
          hints: ['Vas a necesitar dos reglas: una para piedras y otra para paredes.', 'SI piedra → saltar. SI pared → girar a la derecha.'],
        },
      },
    },
    f3: {
      title: 'Repetición',
      concept: {
        title: 'Repetición (loop)',
        summary: 'En vez de escribir el mismo comando muchas veces, usa Repetir y di cuántas veces.',
      },
      lesson: [
        'Soy Alan. Mira: Caminar, Caminar, Caminar, Caminar, Caminar... ¡qué cansado!',
        'Con Repetir 5× Caminar, lo escribes una vez y Bit lo repite solo.',
        'Esto se llama loop. Ahora cada desafío tiene un límite de bloques. ¡Ahorra!',
      ],
      challenges: {
        'f3-c1': {
          title: 'Pasillo largo',
          goal: 'Llega a la bandera usando solo 2 bloques.',
          hints: ['Pon el bloque Repetir y un Caminar dentro de él.', 'Toca el ×2 para cambiar cuántas veces repetir. ¡Cuenta las casillas!'],
          successMessage: '¡Acabas de crear un loop! Te permite repetir una acción muchas veces sin tener que escribir el mismo comando.',
        },
        'f3-c2': {
          title: 'Escalera',
          goal: 'Sube la escalera con 5 bloques como máximo.',
          hints: ['Cada escalón es igual: caminar, girar, caminar, girar.', 'Repetir 3× [Caminar, Girar ↺, Caminar, Girar ↻].'],
        },
        'f3-c3': {
          title: 'Saltos con ritmo',
          goal: 'Encuentra el patrón y usa solo 3 bloques.',
          hints: ['Antes de cada piedra hay un suelo libre. ¿Cuál es el patrón?', 'Repetir 3× [Caminar, Saltar].'],
        },
      },
    },
  },
  mentors: {
    ada: {
      area: 'Matemáticas y los primeros programas',
      intro: 'Matemática inglesa. En 1843 escribió uno de los primeros algoritmos pensados para una máquina de calcular.',
      fact: 'Ada imaginó que esas máquinas un día podrían hasta componer música, mucho antes de que existieran las computadoras.',
      message: 'Una máquina sigue pasos. ¡Y quien elige los pasos eres tú!',
      unlockText: 'Ya empieza contigo.',
    },
    grace: {
      area: 'Lenguajes de programación',
      intro: 'Científica de la computación y almirante de la Marina de EE. UU. Creó uno de los primeros compiladores, que traduce palabras a instrucciones para la computadora.',
      fact: 'En 1947, el equipo de la computadora Mark II encontró una polilla atrapada en la máquina y la pegó en el cuaderno de registro: ¡un “bug” de verdad!',
      message: '¿Encontraste un error? ¡Genial! Cada bug que encuentras hace tu programa más fuerte.',
      unlockText: 'Completa la fase Secuencias.',
    },
    turing: {
      area: 'Lógica y ciencias de la computación',
      intro: 'Matemático británico. En 1936 imaginó una máquina sencilla que lee símbolos y sigue reglas: la idea detrás de las computadoras.',
      fact: 'A Turing le encantaba correr. Corría maratones tan rápido como los atletas de competición.',
      message: '¿Un problema grande? Divídelo en partes pequeñas y repite lo que funciona.',
      unlockText: 'Completa la fase Decisiones.',
    },
    katherine: {
      area: 'Matemáticas y exploración espacial',
      intro: 'Matemática de la NASA. Calculó trayectorias de vuelos espaciales, como la del primer astronauta estadounidense, en 1961.',
      fact: 'En 1962, antes de dar la vuelta a la Tierra, el astronauta John Glenn pidió que ella revisara los cálculos de la computadora.',
      message: 'Revisa, prueba y vuelve a revisar. Cuidar los detalles también es valentía.',
      unlockText: 'Completa la fase Repetición.',
    },
  },
  achievements: {
    'first-program': { title: 'Primer programa', description: 'Completa tu primer desafío.' },
    flawless: { title: '¡A la primera!', description: 'Gana 3 estrellas en un desafío.' },
    debugger: { title: 'Cazador de bugs', description: 'Arregla un programa después de equivocarte.' },
    'loop-master': { title: 'Maestro de los loops', description: 'Completa la fase Repetición.' },
    'streak-3': { title: 'Tres días seguidos', description: 'Juega 3 días seguidos.' },
    'all-mentors': { title: 'Sala de mentores', description: 'Desbloquea a todos los mentores.' },
    'star-sky': { title: 'Cielo estrellado', description: 'Reúne todas las estrellas del juego.' },
  },
  palettes: {
    classic: { name: 'Clásico', songName: 'Aventura' },
    pocket: { name: 'Bolsillo', songName: 'Paseo' },
    sunset: { name: 'Atardecer', songName: 'Ocaso' },
    ocean: { name: 'Océano', songName: 'Marea' },
  },
  guide: {
    welcome: {
      title: '¡Bienvenido a Bit Quest!',
      text: '¡Ella es Mary y juegas con ella! Juntas van a enseñarle al robot Bit a llegar hasta la bandera armando programas con bloques de comando.',
      items: [
        ['Objetivo', 'llevar a Bit hasta la bandera'],
        ['3 fases', 'Secuencias, Decisiones y Repetición'],
      ],
    },
    sequence: {
      title: 'Fase 1 · Secuencias',
      text: 'Toca los comandos para armar el camino, paso a paso. Bit hace todo en el orden en que lo armes.',
      items: [
        ['Caminar', 'un cuadrito hacia adelante'],
        ['Girar izq.', 'gira a la izquierda'],
        ['Girar der.', 'gira a la derecha'],
        ['Saltar', 'pasa por encima de las piedras'],
      ],
    },
    rules: {
      title: 'Fase 2 · Decisiones',
      text: 'Ahora Bit camina solo. Tú escribes reglas SI/ENTONCES para que decida qué hacer en el camino.',
      items: [
        ['SI piedra adelante', 'ENTONCES saltar'],
        ['SI pared adelante', 'ENTONCES girar'],
        ['Dos mapas', 'las mismas reglas tienen que ganar en los dos'],
      ],
    },
    repeat: {
      title: 'Fase 3 · Repetición',
      text: 'El bloque Repetir hace los comandos de adentro varias veces. Con él escribes menos y haces más.',
      items: [
        ['Repetir', 'pon comandos dentro de él'],
        ['Límite de bloques', 'cada desafío tiene un máximo'],
      ],
    },
    run: {
      title: 'Ejecutar y arreglar',
      text: 'Cuando el programa esté listo, ejecútalo y mira a Bit caminar. ¡Equivocarse es parte de programar!',
      items: [
        ['Ejecutar', 'pone en marcha tu programa'],
        ['Bloque con "!"', 'muestra dónde se equivocó Bit'],
        ['Pista', 'pide ayuda cuando te trabes'],
        ['Intentar de nuevo', 'tu programa sigue ahí'],
      ],
    },
    energy: {
      title: 'Energía',
      text: `Tienes hasta ${ENERGY_MAX} de energía. Cada ejecución que sale mal gasta 1. Un programa vacío o una regla incompleta no gastan.`,
      items: [
        ['Se recarga sola', `+1 cada ${ENERGY_REGEN_MS / 60000} minutos`],
        ['Ganar te devuelve', '+1 de energía por desafío completado'],
        ['Recarga rápida', `${ECONOMY.energyRefillPrice} monedas la llenan toda`],
        ['Nivel Fácil', 'equivocarte no gasta energía'],
      ],
    },
    rewards: {
      title: 'Recompensas',
      text: 'Menos errores y menos bloques, más estrellas. Cada desafío ganado da XP y monedas.',
      items: [
        ['Estrellas', 'hasta 3 por desafío'],
        ['Monedas', `${REWARDS.coinsPerStar} por estrella, +${REWARDS.faseBonusCoins} por fase`],
        ['Racha', 'juega todos los días para aumentarla'],
        ['Medallas', 'logros especiales'],
      ],
    },
    mentors: {
      title: 'Mentores y Aprender',
      text: 'Personas reales de la computación te acompañan. Completa fases para desbloquear nuevos mentores.',
      items: [
        ['Mentores', 'Ada, Grace, Alan y Katherine'],
        ['Aprender', 'mentores, conceptos y medallas'],
        ['Colores de pantalla', 'cada color nuevo trae una música nueva'],
      ],
    },
    controls: {
      title: 'Controles',
      text: 'Toca la pantalla para jugar. También puedes usar la cruceta, los botones A y B o el teclado.',
      items: [
        ['Flechas', 'mover el cursor'],
        ['A', 'confirmar (Z o Enter)'],
        ['B', 'volver o borrar (X o Esc)'],
      ],
    },
  },
  feedback: {
    failures: {
      empty: { title: 'Tu programa está vacío', hint: 'Toca los comandos de abajo para armar el camino.' },
      empty_loop: { title: 'El Repetir está vacío', hint: 'Pon al menos un comando dentro del Repetir.' },
      incomplete_rule: { title: 'Falta completar la regla', hint: 'Cada regla necesita un SI y un ENTONCES.' },
      too_many_blocks: { title: '¡Demasiados bloques!', hint: 'Usa Repetir para escribir menos.' },
      edge: { title: '¡Bit casi se sale del mapa!', hint: 'Cuenta los cuadritos hasta la bandera.' },
      hit_wall: { title: '¡Bonk! Bit chocó con la pared.', hint: 'Antes de la pared, prueba Girar.' },
      hit_rock: { title: '¡Bit tropezó con la piedra!', hint: 'Las piedras son bajitas: usa Saltar.' },
      jump_wall: { title: '¡Esa pared es demasiado alta!', hint: 'Solo se pueden saltar piedras. Ante una pared, gira.' },
      bad_landing: { title: 'No se puede aterrizar ahí.', hint: 'Bit salta 2 casillas. Mira dónde va a caer.' },
      not_reached: { title: 'Los comandos se acabaron antes de la bandera.', hint: '¡Falta poco! Agrega más comandos.' },
      stuck_loop: { title: '¡Bit está dando vueltas en círculos!', hint: '¿Será que la curva es para el otro lado?' },
      too_long: { title: 'Bit caminó demasiado y se perdió.', hint: 'Revisa las reglas: ¿llega a la bandera?' },
    },
    encouragements: [
      'Equivocarse es parte de aprender.',
      'Todo programador prueba y arregla.',
      '¿Encontraste un bug? ¡Ahora solo falta corregirlo!',
      'Casi lo logras. ¡Inténtalo de nuevo!',
    ],
    praise: ['¡Muy bien!', '¡Programa perfecto!', '¡Guau, funcionó!', '¡Qué lógica tan afilada!'],
  },
};
