import { decomporComPassos, direcaoGraus, modulo, somarComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'modulo' | 'componente-x' | 'componente-y' | 'modulo-da-soma' | 'direcao';

export const geradorVetores: GeradorExercicio<number> = {
  topicoId: 'vetores-no-plano',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'modulo':
        return exercicioModulo(nivel, rng);
      case 'componente-x':
        return exercicioComponente('x', nivel, rng);
      case 'componente-y':
        return exercicioComponente('y', nivel, rng);
      case 'modulo-da-soma':
        return exercicioModuloDaSoma(nivel, rng);
      case 'direcao':
        return exercicioDirecao(nivel, rng);
    }
  },

  // O grau é ruído de unidade: a resposta em si é um número.
  analisar: (entrada) => analisarNumero(entrada.replace(/°/g, '')),

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['modulo', 'componente-x']);
    case 'medio':
      return rng.escolher<Pergunta>(['componente-x', 'componente-y', 'modulo-da-soma']);
    case 'dificil':
      return rng.escolher<Pergunta>(['modulo-da-soma', 'direcao', 'componente-y']);
  }
}

function exercicioModulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const x = rng.inteiro(-12, 12) || 3;
  const y = rng.inteiro(-12, 12) || 4;
  const vetor = { x, y };

  const resultado = modulo(vetor);

  return {
    id: `vet-mod-${x}-${y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o módulo do vetor (${x}, ${y})? (2 casas decimais)`,
    enunciadoTex: `\\vec{v} = (${x},\\; ${y})`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'O módulo é a hipotenusa do triângulo formado pelas componentes.',
          tex: '|\\vec{v}| = \\sqrt{v_x^{2} + v_y^{2}}',
        },
        {
          descricao: 'Elevamos ao quadrado — o sinal desaparece.',
          tex: `= \\sqrt{(${x})^{2} + (${y})^{2}} = \\sqrt{${x * x + y * y}}`,
          nota: 'Componente negativa não deixa o módulo negativo: módulo é distância.',
        },
        {
          descricao: 'Extraímos a raiz.',
          tex: `|\\vec{v}| = ${Number(resultado.toFixed(4))}`,
        },
      ],
    },
    conceitos: ['vetores.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: x + y,
          diagnostico:
            'As componentes não se somam para dar o módulo — são os QUADRADOS que somam. ' +
            'Somar daria o caminho em L, não o caminho reto.',
          passo: 0,
          conceito: 'vetores.definicao',
        },
        {
          resposta: Math.abs(x) + Math.abs(y),
          diagnostico:
            'Somar os módulos das componentes dá o percurso andando pelos eixos. O módulo do ' +
            'vetor é a distância em linha reta, que é menor.',
          passo: 1,
          conceito: 'vetores.definicao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? '|v| = √(vₓ² + v_y²)' : undefined,
  };
}

function exercicioComponente(eixo: 'x' | 'y', nivel: Nivel, rng: Rng): Exercicio<number> {
  const comprimento = rng.inteiro(2, 20);
  const angulo = rng.escolher([0, 30, 37, 45, 53, 60, 90, 120, 135, 150, 210, 300]);

  const { resultado: vetor, passos } = decomporComPassos(comprimento, angulo);
  const gabarito = eixo === 'x' ? vetor.x : vetor.y;
  const outro = eixo === 'x' ? vetor.y : vetor.x;

  return {
    id: `vet-comp-${eixo}-${comprimento}-${angulo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um vetor de módulo ${comprimento} forma ${angulo}° com o eixo x. Qual é sua componente ` +
      `${eixo === 'x' ? 'horizontal' : 'vertical'}? (2 casas decimais)`,
    enunciadoTex: `|\\vec{v}| = ${comprimento} \\qquad \\theta = ${angulo}^\\circ`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: `A pergunta é pela componente ${eixo}.`,
          tex: `v_${eixo} = ${gabarito.toFixed(2).replace('.', '{,}')}`,
        },
      ],
    },
    conceitos: ['vetores.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: outro,
          diagnostico:
            eixo === 'x'
              ? 'Você usou o seno. A componente HORIZONTAL é o cateto adjacente ao ângulo, e ' +
                'por isso usa cosseno.'
              : 'Você usou o cosseno. A componente VERTICAL é o cateto oposto ao ângulo, e ' +
                'por isso usa seno.',
          passo: eixo === 'x' ? 1 : 2,
          conceito: 'vetores.definicao',
        },
        {
          resposta: comprimento,
          diagnostico:
            'Esse é o módulo do vetor inteiro. A componente é sempre menor ou igual a ele — ' +
            'igual apenas quando o vetor está sobre o eixo.',
          passo: 1,
          conceito: 'vetores.definicao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? eixo === 'x'
          ? 'vₓ = |v|·cos θ'
          : 'v_y = |v|·sen θ'
        : undefined,
  };
}

function exercicioModuloDaSoma(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = { x: rng.inteiro(-8, 8), y: rng.inteiro(-8, 8) };
  const b = { x: rng.inteiro(-8, 8), y: rng.inteiro(-8, 8) };

  const { resultado: soma, passos } = somarComPassos(a, b);
  const gabarito = modulo(soma);

  return {
    id: `vet-soma-${a.x}_${a.y}-${b.x}_${b.y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é o módulo da soma dos vetores (${a.x}, ${a.y}) e (${b.x}, ${b.y})? ` +
      '(2 casas decimais)',
    enunciadoTex: `\\vec{a} = (${a.x},\\; ${a.y}) \\qquad \\vec{b} = (${b.x},\\; ${b.y})`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: 'O módulo pedido é o do vetor soma.',
          tex: `|\\vec{a}+\\vec{b}| = ${Number(gabarito.toFixed(4))}`,
        },
      ],
    },
    conceitos: ['vetores.soma'],
    armadilhas: semColisoes(
      [
        {
          resposta: modulo(a) + modulo(b),
          diagnostico:
            'Somar os MÓDULOS só vale quando os vetores têm a mesma direção e sentido. Em ' +
            'geral, parte de um cancela parte do outro.',
          passo: 2,
          conceito: 'vetores.soma',
        },
        {
          resposta: Math.abs(modulo(a) - modulo(b)),
          diagnostico:
            'Subtrair os módulos corresponde ao caso de sentidos opostos. Aqui é preciso somar ' +
            'componente por componente antes de calcular o módulo.',
          passo: 0,
          conceito: 'vetores.soma',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioDirecao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const quadrantes: readonly (readonly [number, number])[] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];

  const [sinalX, sinalY] = rng.escolher(quadrantes);
  const x = sinalX * rng.inteiro(1, 10);
  const y = sinalY * rng.inteiro(1, 10);

  const resultado = direcaoGraus({ x, y });

  return {
    id: `vet-dir-${x}-${y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é o ângulo que o vetor (${x}, ${y}) forma com o eixo x positivo, medido no ` +
      'sentido anti-horário? (em graus, 2 casas)',
    enunciadoTex: `\\vec{v} = (${x},\\; ${y})`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A tangente do ângulo é a razão entre as componentes.',
          tex: `\\tan\\theta = \\frac{${y}}{${x}}`,
        },
        {
          descricao: 'O arco-tangente simples não distingue o quadrante.',
          tex: `\\arctan\\frac{${y}}{${x}} = ${Number(((Math.atan(y / x) * 180) / Math.PI).toFixed(2))}^\\circ`,
          nota: 'Os sinais das componentes é que dizem em qual quadrante o vetor está.',
        },
        {
          descricao: `As componentes indicam o ${sinalX > 0 ? (sinalY > 0 ? '1º' : '4º') : sinalY > 0 ? '2º' : '3º'} quadrante.`,
          tex: `\\theta = ${Number(resultado.toFixed(2))}^\\circ`,
        },
      ],
    },
    conceitos: ['vetores.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: (Math.atan(y / x) * 180) / Math.PI,
          diagnostico:
            'Esse é o resultado cru do arco-tangente, que sempre cai entre −90° e 90°. É ' +
            'preciso corrigir pelo quadrante, olhando os sinais das componentes.',
          passo: 1,
          conceito: 'vetores.definicao',
        },
        {
          resposta: (Math.atan(x / y) * 180) / Math.PI,
          diagnostico:
            'A razão está invertida: a tangente é a componente VERTICAL sobre a horizontal.',
          passo: 0,
          conceito: 'vetores.definicao',
        },
      ],
      resultado,
      proximos,
    ),
  };
}
