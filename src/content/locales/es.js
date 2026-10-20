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
        '¡Hola! Este es Bit, un robot al que le encanta seguir instrucciones.',
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
        'Ahora Bit camina solo... pero el camino tiene sorpresas.',
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
        'Mira: Caminar, Caminar, Caminar, Caminar, Caminar... ¡qué cansado!',
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
    f4: {
      title: 'Depuración',
      concept: {
        title: 'Depuración (debug)',
        summary: 'Depurar es encontrar y arreglar el error: ejecuta, mira dónde paró Bit y cambia solo eso.',
      },
      lesson: [
        'No todos los programas funcionan a la primera. Un error en un programa se llama bug.',
        'Este programa tiene un paso de más. Ejecútalo y encuentra el bloque culpable.',
        'Arregla solo lo que está mal: quita un bloque, cambia un número o cambia una regla.',
      ],
      challenges: {
        'f4-c1': {
          title: 'Un paso de más',
          goal: 'El programa tiene un bug. Arréglalo y lleva a Bit hasta la bandera.',
          hints: ['Ejecuta el programa: ¿en qué bloque choca Bit con el árbol?', 'Hay un Caminar de más antes de Girar. Tócalo para quitarlo.'],
        },
        'f4-c2': {
          title: 'Cuenta equivocada',
          goal: 'El Repetir está contando mal. Arregla el número.',
          hints: ['Bit se detiene antes de la bandera. ¿Cuántas casillas faltan?', 'Cuenta las casillas hasta la bandera y toca el número del Repetir hasta llegar a él.'],
        },
        'f4-c3': {
          title: 'Regla cambiada',
          goal: 'Una de las reglas está mal. Descubre cuál y arréglala.',
          hints: ['La regla de la piedra funciona. Mira la regla de la pared.', 'El camino gira a la derecha. Toca el ENTONCES de la regla de la pared y elige Girar der.'],
        },
      },
    },
    f5: {
      title: 'Funciones',
      concept: {
        title: 'Función',
        summary: 'Una función es un bloque que creas con otros bloques y usas las veces que quieras.',
      },
      lesson: [
        '¡Cuando un pedazo se repite, puedes escribirlo una sola vez!',
        'Arma la ★ Función con los pasos. Cada bloque ★ hace todo lo que tiene adentro.',
        'Primero arma la función arriba. Después usa el bloque ★ en el programa.',
      ],
      challenges: {
        'f5-c1': {
          title: 'El bloque mágico',
          goal: 'Crea una función y llega a la bandera con solo 5 bloques.',
          hints: ['El camino se repite: Caminar, Caminar, Saltar.', 'Función: Caminar, Caminar, Saltar. Programa: ★ y ★.'],
        },
        'f5-c2': {
          title: 'La escalera de Sonja',
          goal: 'Sube la escalera con 7 bloques como máximo.',
          hints: ['Cada escalón es igual: caminar, girar, caminar, girar.', 'Función: Caminar, Girar der., Caminar, Girar izq. Usa ★ tres veces.'],
        },
        'f5-c3': {
          title: 'Patrón escondido',
          goal: 'Encuentra el pedazo que se repite y usa 8 bloques como máximo.',
          hints: ['Antes y después de cada curva, Bit hace: Caminar, Saltar, Caminar.', 'Función: Caminar, Saltar, Caminar. Programa: ★, Girar der., ★, Girar izq., ★.'],
        },
      },
    },
    f6: {
      title: 'Todo junto',
      concept: {
        title: 'Pensamiento computacional',
        summary: 'Mezcla todo lo que aprendiste: secuencias, decisiones, repetición y funciones.',
      },
      lesson: [
        '¡Ahora es hora de juntar todo lo que aprendiste!',
        'Mira todo el mapa: ¿qué se repite? ¿Dónde debe decidir Bit?',
        'Hay muchas formas correctas. El mejor programa es corto y fácil de leer.',
      ],
      challenges: {
        'f6-c1': {
          title: 'Laberinto de reglas',
          goal: 'Crea las reglas que llevan a Bit por todo el laberinto.',
          hints: ['Vas a necesitar una regla para piedras y otra para paredes.', 'SI piedra → Saltar. SI pared → Girar der.'],
        },
        'f6-c2': {
          title: 'Vuelta a la plaza',
          goal: 'Da la vuelta a las piedras usando solo 4 bloques.',
          hints: ['Caminar, Saltar, Girar... y otra vez. ¿Cuántas veces?', 'Repetir 3× [Caminar, Saltar, Girar der.].'],
        },
        'f6-c3': {
          title: 'Desafío final',
          goal: 'Usa una función dentro del Repetir. ¡8 bloques como máximo!',
          hints: ['El pedazo Caminar, Saltar, Caminar aparece 4 veces, con curvas entre ellos.', 'Función: Caminar, Saltar, Caminar. Programa: Repetir 2× [★, Girar der., ★, Girar izq.].'],
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
    sonja: {
      area: 'Física teórica',
      intro: 'Física brasileña, nacida en São Paulo. Fue la primera mujer de Brasil en hacer un doctorado en física, en la Universidad de Cambridge, en Inglaterra.',
      fact: 'Su director de tesis en Cambridge fue Paul Dirac, uno de los creadores de la física cuántica. Sonja terminó el doctorado con solo 24 años.',
      message: 'Las grandes ideas empiezan con preguntas pequeñas. ¡No tengas miedo de preguntar!',
      unlockText: 'Completa la fase Depuración.',
    },
    liane: {
      area: 'Redes de computadoras e internet',
      intro: 'Científica de la computación brasileña y profesora de la UFRGS, en Porto Alegre. Ayudó a llevar internet a las universidades de Brasil, cuando casi nadie sabía qué era.',
      fact: 'En 2017 entró al Internet Hall of Fame, que homenajea a las personas que ayudaron a construir internet en el mundo.',
      message: 'Las computadoras se hacen más fuertes cuando conversan entre sí. ¡Las personas también!',
      unlockText: 'Completa la fase Funciones.',
    },
    jobs: {
      area: 'Computadoras personales y diseño',
      intro: 'Empresario estadounidense. En 1976 fundó Apple con Steve Wozniak en un garaje. La empresa ayudó a llevar las computadoras a las casas.',
      fact: 'En la universidad tomó una clase de caligrafía, el arte de dibujar letras. Años después, esa clase inspiró las letras bonitas de la computadora Macintosh, de 1984.',
      message: 'Un buen programa es uno que cualquier persona puede usar. ¡Piensa en quién va a jugar!',
      unlockText: 'Completa la fase Todo junto.',
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
      text: '¡Juegas con Mary! Juntas, enséñenle al robot Bit a llegar a la bandera.',
      items: [
        ['Objetivo', 'llevar a Bit hasta la bandera'],
        ['6 fases', 'de Secuencias hasta Todo junto'],
      ],
    },
    sequence: {
      title: 'Fase 1 · Secuencias',
      text: 'Toca los comandos para armar el camino. Bit hace todo en orden.',
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
    debug: {
      title: 'Fase 4 · Depuración',
      text: 'Aquí el programa ya trae un bug. Ejecútalo, mira dónde se equivoca Bit y arréglalo.',
      items: [
        ['Encuentra el bug', 'ejecuta y mira dónde se detiene Bit'],
        ['Quita un bloque', 'toca el bloque equivocado'],
        ['Cambia un número', 'toca el × del Repetir'],
      ],
    },
    functions: {
      title: 'Fase 5 · Funciones',
      text: 'Arma la ★ Función una vez y usa el bloque ★ todas las veces que quieras.',
      items: [
        ['★ Función', 'junta hasta 4 bloques en ella'],
        ['Bloque ★', 'hace todo lo que está en la función'],
        ['Fase 6 · Todo junto', 'mezcla todo lo que aprendiste'],
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
        ['Mentores', 'Ada, Grace, Alan, Katherine, Sonja, Liane y Steve'],
        ['Aprender', 'mentores, conceptos y medallas'],
        ['Colores de pantalla', 'cada color nuevo trae una música nueva'],
      ],
    },
    settings: {
      title: 'Ajustes y personalización',
      text: 'Deja el juego a tu manera. Todo está en la pantalla de inicio o en Ajustes (el engranaje).',
      items: [
        ['Ajustes', 'engranaje en la esquina del inicio'],
        ['Idioma', 'PT, EN o ES: al encender y en Ajustes'],
        ['Dificultad', 'en Ajustes o en el nivel del inicio'],
        ['Colores', 'botón Colores: cada color tiene su música'],
        ['Sonido', 'botón en la esquina del inicio'],
        ['Accesibilidad', 'texto más grande, letra fácil y menos animación'],
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
      empty_function: { title: 'La función está vacía', hint: 'Pon comandos dentro de la ★ Función antes de usarla.' },
      incomplete_rule: { title: 'Falta completar la regla', hint: 'Cada regla necesita un SI y un ENTONCES.' },
      too_many_blocks: { title: '¡Demasiados bloques!', hint: 'Usa Repetir para escribir menos.' },
      edge: { title: '¡Bit casi se sale del mapa!', hint: 'Cuenta los cuadritos hasta la bandera.' },
      hit_wall: { title: '¡Bonk! Bit chocó con la pared.', hint: 'Antes de la pared, prueba Girar.' },
      hit_rock: { title: '¡Bit tropezó con la piedra!', hint: 'Las piedras son bajitas: usa Saltar.' },
      jump_wall: { title: '¡Esa pared es demasiado alta!', hint: 'Solo se pueden saltar piedras. Ante una pared, gira.' },
      hit_wall_tree: { title: '¡Bonk! Bit chocó con el árbol.', hint: 'Antes del árbol, prueba Girar.' },
      jump_wall_tree: { title: '¡Ese árbol es demasiado alto!', hint: 'Solo se pueden saltar piedras. Ante un árbol, gira.' },
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
