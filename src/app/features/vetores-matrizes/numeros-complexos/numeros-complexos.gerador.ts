import {
  argumentoGraus,
  dividirComplexosComPassos,
  moduloComplexo,
  multiplicarComplexosComPassos,
  potenciaComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Igualdade numérica, com uma concessão: a diferença de 360.
 *
 * No 4º quadrante, 306,87° e −53,13° são o MESMO argumento, e o segundo é o
 * argumento principal — a convenção mais usual em cálculo. Antes, quem
 * respondia −53,13° era diagnosticado com "arco-tangente sem correção de
 * quadrante", um erro que não havia cometido.
 *
 * As outras perguntas do tópico devolvem módulos e partes reais, onde uma
 * diferença de exatamente 360 não aparece por acidente.
 */
const proximos = (a: number, b: number): boolean =>
  Math.abs(a - b) < 0.02 || Math.abs(Math.abs(a - b) - 360) < 0.02;

type Pergunta =
  | 'modulo'
  | 'real-do-produto'
  | 'imaginario-do-produto'
  | 'argumento'
  | 'potencia-i'
  | 'real-do-quociente';

export const geradorComplexos: GeradorExercicio<number> = {
  topicoId: 'numeros-complexos',
  formatoResposta: 'um número, 2 casas decimais',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'modulo':
        return exercicioModulo(nivel, rng);
      case 'real-do-produto':
        return exercicioProduto('real', nivel, rng);
      case 'imaginario-do-produto':
        return exercicioProduto('imaginario', nivel, rng);
      case 'argumento':
        return exercicioArgumento(nivel, rng);
      case 'potencia-i':
        return exercicioPotenciaDeI(nivel, rng);
      case 'real-do-quociente':
        return exercicioQuociente(nivel, rng);
    }
  },

  // O grau é ruído de unidade: a resposta em si é um número.
  analisar: (entrada) => analisarNumero(entrada.replace(/°/g, '')),

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['modulo', 'potencia-i']);
    case 'medio':
      return rng.escolher<Pergunta>(['real-do-produto', 'imaginario-do-produto', 'modulo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['argumento', 'real-do-quociente', 'real-do-produto']);
    // O quociente exige multiplicar pelo conjugado; o argumento, cuidar do
    // quadrante. São os dois pontos em que o tópico escapa.
    case 'extremo':
      return rng.escolher<Pergunta>(['real-do-quociente', 'argumento']);
  }
}

function sortearComplexo(rng: Rng): { real: number; imaginario: number } {
  const real = rng.inteiro(-6, 6);
  const imaginario = rng.inteiro(-6, 6);
  return real === 0 && imaginario === 0 ? { real: 3, imaginario: 4 } : { real, imaginario };
}

function escrever({ real, imaginario }: { real: number; imaginario: number }): string {
  if (imaginario === 0) {
    return String(real);
  }
  if (real === 0) {
    return `${imaginario === 1 ? '' : imaginario === -1 ? '-' : imaginario}i`;
  }
  const parte = Math.abs(imaginario) === 1 ? '' : Math.abs(imaginario);
  return `${real} ${imaginario < 0 ? '-' : '+'} ${parte}i`;
}

function exercicioModulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const z = sortearComplexo(rng);
  const resultado = moduloComplexo(z);

  return {
    id: `cpx-mod-${z.real}_${z.imaginario}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o módulo de ${escrever(z)}? (2 casas decimais)`,
    enunciadoTex: `z = ${escrever(z)}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'O módulo é a distância até a origem no plano complexo.',
          tex: '|z| = \\sqrt{a^{2} + b^{2}}',
        },
        {
          descricao: 'Substituímos as partes real e imaginária.',
          tex: `= \\sqrt{(${z.real})^{2} + (${z.imaginario})^{2}} = \\sqrt{${z.real ** 2 + z.imaginario ** 2}}`,
        },
        {
          descricao: 'Extraímos a raiz.',
          tex: `|z| = ${Number(resultado.toFixed(4))}`,
          nota: 'O módulo nunca é negativo: é uma distância.',
        },
      ],
    },
    conceitos: ['complexos.plano'],
    armadilhas: semColisoes(
      [
        {
          resposta: z.real + z.imaginario,
          diagnostico:
            'As partes real e imaginária não se somam — elas são perpendiculares no plano. ' +
            'O módulo vem de Pitágoras.',
          passo: 0,
          conceito: 'complexos.plano',
        },
        {
          resposta: Math.abs(z.real),
          diagnostico:
            'Essa é só a parte real. O módulo leva em conta as duas coordenadas do ponto.',
          passo: 1,
          conceito: 'complexos.plano',
        },
      ],
      resultado,
      proximos,
    ),
    dica: `|z| é a distância à origem: some os QUADRADOS das partes, (${z.real})² + (${z.imaginario})², e tire a raiz.`,
  };
}

function exercicioProduto(parte: 'real' | 'imaginario', nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearComplexo(rng);
  const b = sortearComplexo(rng);

  const { resultado, passos } = multiplicarComplexosComPassos(a, b);
  const gabarito = parte === 'real' ? resultado.real : resultado.imaginario;

  // O erro clássico: esquecer que i² = -1 e somar onde deveria subtrair.
  const semIQuadrado = a.real * b.real + a.imaginario * b.imaginario;

  return {
    id: `cpx-prod-${parte}-${a.real}_${a.imaginario}-${b.real}_${b.imaginario}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Multiplicando (${escrever(a)}) por (${escrever(b)}), qual é a parte ` +
      `${parte === 'real' ? 'REAL' : 'IMAGINÁRIA'} do resultado?`,
    enunciadoTex: `z_1 = ${escrever(a)} \\qquad z_2 = ${escrever(b)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: `A pergunta é pela parte ${parte === 'real' ? 'real' : 'imaginária'}.`,
          tex: `\\${parte === 'real' ? 'operatorname{Re}' : 'operatorname{Im}'}(z_1 z_2) = ${gabarito}`,
        },
      ],
    },
    conceitos: ['complexos.multiplicacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: parte === 'real' ? semIQuadrado : a.real * b.imaginario - a.imaginario * b.real,
          diagnostico:
            parte === 'real'
              ? 'Você esqueceu que i² = −1: o produto das partes imaginárias entra SUBTRAINDO ' +
                'na parte real.'
              : 'Na parte imaginária os dois termos SOMAM: a·d + b·c. A subtração acontece na ' +
                'parte real, por causa de i².',
          passo: 1,
          conceito: 'complexos.multiplicacao',
        },
        {
          resposta: parte === 'real' ? a.real * b.real : a.imaginario * b.imaginario,
          diagnostico:
            'Multiplicar parte por parte não funciona: a distributiva produz quatro termos, e ' +
            'eles se misturam entre real e imaginário.',
          passo: 0,
          conceito: 'complexos.multiplicacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      parte === 'real'
        ? `Distribua os quatro produtos. Lembre que i·i = i² = −1: o termo (${a.imaginario}i)(${b.imaginario}i) vai para a parte REAL com o sinal trocado.`
        : `Distribua os quatro produtos; a parte imaginária junta os dois termos cruzados: (${a.real})(${b.imaginario}) + (${a.imaginario})(${b.real}).`,
  };
}

function exercicioArgumento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const quadrantes: readonly (readonly [number, number])[] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];

  const [sx, sy] = rng.escolher(quadrantes);
  const z = { real: sx * rng.inteiro(1, 6), imaginario: sy * rng.inteiro(1, 6) };
  const resultado = argumentoGraus(z);

  return {
    id: `cpx-arg-${z.real}_${z.imaginario}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é o argumento de ${escrever(z)}, medido no sentido anti-horário a partir do eixo ` +
      'real? (em graus, 2 casas)',
    enunciadoTex: `z = ${escrever(z)}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'O argumento é o ângulo do ponto com o eixo real positivo.',
          tex: `\\tan\\theta = \\frac{${z.imaginario}}{${z.real}}`,
        },
        {
          descricao: 'O arco-tangente cru não distingue o quadrante.',
          tex: `\\arctan\\frac{${z.imaginario}}{${z.real}} = ${Number(((Math.atan(z.imaginario / z.real) * 180) / Math.PI).toFixed(2))}^\\circ`,
          nota: 'Os sinais das partes real e imaginária localizam o ponto.',
        },
        {
          descricao: 'Corrigindo pelo quadrante.',
          tex: `\\theta = ${Number(resultado.toFixed(2))}^\\circ`,
        },
      ],
    },
    conceitos: ['complexos.plano'],
    armadilhas: semColisoes(
      [
        {
          resposta: (Math.atan(z.imaginario / z.real) * 180) / Math.PI,
          diagnostico:
            'Esse é o arco-tangente sem correção, sempre entre −90° e 90°. O quadrante precisa ' +
            'ser levado em conta.',
          passo: 1,
          conceito: 'complexos.plano',
        },
        {
          resposta: moduloComplexo(z),
          diagnostico: 'Esse é o módulo, não o ângulo. São as duas coordenadas polares do ponto.',
          passo: 0,
          conceito: 'complexos.plano',
        },
      ],
      resultado,
      proximos,
    ),
    dica: `Calcule arctg(${z.imaginario}/${z.real}) e corrija pelo quadrante: o ponto (${z.real}, ${z.imaginario}) está no ${z.real > 0 ? (z.imaginario > 0 ? '1º' : '4º') : z.imaginario > 0 ? '2º' : '3º'} quadrante.`,
  };
}

function exercicioPotenciaDeI(nivel: Nivel, rng: Rng): Exercicio<number> {
  const expoente = rng.inteiro(2, 40);
  const { resultado } = potenciaComPassos({ real: 0, imaginario: 1 }, expoente);

  // A resposta pedida é a parte real, que no ciclo vale 1, 0 ou -1. O `|| 0`
  // existe para não exibir "-0": o seno de 180° devolve zero negativo.
  const gabarito = Math.round(resultado.real) || 0;
  const resto = expoente % 4;

  return {
    id: `cpx-poti-${expoente}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a parte real de i^${expoente}?`,
    enunciadoTex: `i^{${expoente}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'As potências de i se repetem de quatro em quatro.',
          tex: 'i^{1} = i,\\quad i^{2} = -1,\\quad i^{3} = -i,\\quad i^{4} = 1',
        },
        {
          descricao: 'Então basta o resto da divisão do expoente por 4.',
          tex: `${expoente} \\div 4 \\;\\Rightarrow\\; \\text{resto } ${resto}`,
          nota: 'Cada grupo de quatro é uma volta completa: multiplicar por i é girar 90°.',
        },
        {
          descricao: 'O resto identifica o valor.',
          tex: `i^{${expoente}} = i^{${resto}} = ${resto === 0 ? '1' : resto === 1 ? 'i' : resto === 2 ? '-1' : '-i'}`,
        },
        {
          descricao: 'A parte real desse valor.',
          tex: `\\text{Re} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['complexos.demoivre', 'complexos.plano'],
    armadilhas: semColisoes(
      [
        {
          resposta: gabarito === 0 ? 1 : 0,
          diagnostico:
            'Confira o resto da divisão por 4: restos 1 e 3 dão resultados puramente ' +
            'imaginários, cuja parte real é zero.',
          passo: 2,
          conceito: 'complexos.demoivre',
        },
        {
          resposta: expoente,
          diagnostico:
            'As potências de i não crescem: elas giram. O resultado é sempre 1, −1, i ou −i.',
          passo: 0,
          conceito: 'complexos.demoivre',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `As potências de i repetem de 4 em 4: divida ${expoente} por 4 e olhe o resto.`,
  };
}

function exercicioQuociente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearComplexo(rng);
  const b = sortearComplexo(rng);

  const { resultado, passos } = dividirComplexosComPassos(a, b);
  const gabarito = resultado.real;

  return {
    id: `cpx-quo-${a.real}_${a.imaginario}-${b.real}_${b.imaginario}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Dividindo (${escrever(a)}) por (${escrever(b)}), qual é a parte REAL do resultado? ` +
      '(2 casas decimais)',
    enunciadoTex: `\\frac{${escrever(a)}}{${escrever(b)}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: 'A pergunta é pela parte real do quociente.',
          tex: `\\operatorname{Re}\\left(\\frac{z_1}{z_2}\\right) = ${gabarito.toFixed(2).replace('.', '{,}')}`,
        },
      ],
    },
    conceitos: ['complexos.multiplicacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: a.real / b.real,
          diagnostico:
            'Dividir parte por parte não funciona. É preciso multiplicar numerador e ' +
            'denominador pelo conjugado do denominador.',
          passo: 0,
          conceito: 'complexos.multiplicacao',
        },
        {
          resposta:
            (a.real * b.real - a.imaginario * b.imaginario) /
            (b.real * b.real + b.imaginario * b.imaginario),
          diagnostico:
            'No numerador, ao multiplicar pelo CONJUGADO, o produto das partes imaginárias ' +
            'entra somando — o sinal do conjugado já inverteu uma vez.',
          passo: 1,
          conceito: 'complexos.multiplicacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Multiplique em cima e embaixo pelo conjugado do denominador, ${escrever({ real: b.real, imaginario: -b.imaginario })}: embaixo fica (${b.real})² + (${b.imaginario})², um número real.`,
  };
}
