import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(3, 1e-4);

type Pergunta = 'ponto-critico' | 'valor-maximo' | 'otimizacao' | 'taxas-relacionadas';

/** Exercícios de aplicação da derivada: extremos e otimização. */
export const geradorAplicacoesDerivada: GeradorExercicio<number> = {
  topicoId: 'aplicacoes-da-derivada',
  formatoResposta: 'um número, ex.: 25',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'taxas-relacionadas') {
      return exercicioTaxasRelacionadas(nivel, rng);
    }

    if (pergunta === 'otimizacao') {
      // Perímetro fixo: a área máxima é do quadrado de lado P/4.
      const perimetro = rng.inteiro(5, 80) * 4;
      const lado = perimetro / 4;
      const gabarito = lado * lado;

      return {
        id: `aplic-otim-${perimetro}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Com ${perimetro} m de cerca, qual é a MAIOR área retangular que se pode cercar?`,
        enunciadoTex: `2x + 2y = ${perimetro} \\qquad A = xy`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Usamos a restrição para escrever um lado em função do outro.',
              tex: `y = ${perimetro / 2} - x`,
            },
            {
              descricao: 'A área fica em função de uma única variável.',
              tex: `A(x) = x(${perimetro / 2} - x) = ${perimetro / 2}x - x^{2}`,
            },
            {
              descricao: 'Derivamos e igualamos a zero.',
              tex: `A'(x) = ${perimetro / 2} - 2x = 0 \\;\\Rightarrow\\; x = ${lado}`,
            },
            {
              descricao: 'A segunda derivada é negativa, confirmando o máximo.',
              tex: `A'' = -2 < 0`,
            },
            {
              descricao: 'A área máxima é a do quadrado.',
              tex: `A(${lado}) = ${lado} \\cdot ${lado} = ${gabarito}`,
            },
          ],
        },
        conceitos: ['aplic-derivada.otimizacao', 'aplic-derivada.extremos'],
        armadilhas: semColisoes(
          [
            {
              resposta: lado,
              diagnostico:
                'Esse é o LADO do retângulo ótimo. A pergunta é pela área, que é o produto ' +
                'dos dois lados.',
              passo: 2,
              conceito: 'aplic-derivada.otimizacao',
            },
            {
              resposta: perimetro,
              diagnostico:
                'Esse é o perímetro dado. A área é outra grandeza — o produto dos lados, não ' +
                'a soma deles.',
              passo: 1,
              conceito: 'aplic-derivada.otimizacao',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Escreva a área em função de um lado só e derive.' : undefined,
      };
    }

    // f(x) = x³ − 3k²x tem pontos críticos em ±k.
    const k = rng.inteiro(1, 20);
    const p = Polinomio.de(0, -3 * k * k, 0, 1);
    const derivada = p.derivar();

    if (pergunta === 'valor-maximo') {
      // Máximo local em x = −k.
      const gabarito = p.avaliar(-k);

      return {
        id: `aplic-max-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é o valor do MÁXIMO local desta função?',
        enunciadoTex: `f(x) = ${p.paraTex()}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: 'Derivamos e igualamos a zero.', tex: `f'(x) = ${derivada.paraTex()} = 0` },
            {
              descricao: 'Os pontos críticos são as raízes da derivada.',
              tex: `x = \\pm${k}`,
            },
            {
              descricao: 'A segunda derivada classifica cada um.',
              tex: `f''(x) = 6x \\;\\Rightarrow\\; f''(-${k}) < 0 \\;\\text{(máximo)}`,
            },
            {
              descricao: 'Avaliamos a função no ponto de máximo.',
              tex: `f(-${k}) = ${gabarito}`,
            },
          ],
        },
        conceitos: ['aplic-derivada.extremos', 'aplic-derivada.concavidade'],
        armadilhas: semColisoes(
          [
            {
              resposta: -k,
              diagnostico:
                'Esse é o x onde ocorre o máximo, não o valor máximo. Falta substituir esse ' +
                'x de volta na função.',
              passo: 3,
              conceito: 'aplic-derivada.extremos',
            },
            {
              resposta: p.avaliar(k),
              diagnostico:
                'Esse é o valor do MÍNIMO local, em x = +k. O máximo ocorre do outro lado, ' +
                'onde a segunda derivada é negativa.',
              passo: 2,
              conceito: 'aplic-derivada.concavidade',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const gabarito = k;

    return {
      id: `aplic-critico-${k}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Esta função tem dois pontos críticos. Informe o MAIOR deles.',
      enunciadoTex: `f(x) = ${p.paraTex()}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Pontos críticos são onde a derivada se anula.',
            tex: `f'(x) = ${derivada.paraTex()} = 0`,
          },
          {
            descricao: 'Resolvendo a equação.',
            tex: `3x^{2} = ${3 * k * k} \\;\\Rightarrow\\; x = \\pm${k}`,
          },
          { descricao: 'O maior deles é o pedido.', tex: `x = ${k}` },
        ],
      },
      conceitos: ['aplic-derivada.extremos'],
      armadilhas: semColisoes(
        [
          {
            resposta: -k,
            diagnostico: 'Esse é o menor dos dois pontos críticos; o enunciado pede o maior.',
            passo: 2,
            conceito: 'aplic-derivada.extremos',
          },
          {
            resposta: 3 * k * k,
            diagnostico:
              'Você parou no valor de 3x². Falta dividir por 3 e extrair a raiz para chegar ' +
              'ao x.',
            passo: 1,
            conceito: 'aplic-derivada.extremos',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: analisarNumero,

  ...numeroComCasas(3, 1e-4),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['ponto-critico', 'otimizacao']);
    case 'medio':
      return rng.escolher<Pergunta>([
        'ponto-critico',
        'valor-maximo',
        'otimizacao',
        'taxas-relacionadas',
      ]);
    case 'dificil':
      return rng.escolher<Pergunta>(['valor-maximo', 'otimizacao', 'taxas-relacionadas']);
  }
}

/** Os dois arquétipos de taxas relacionadas: a esfera inflando e a escada que escorrega. */
type Cenario = 'esfera' | 'escada' | 'quadrado';

/**
 * Exercícios de taxas relacionadas.
 *
 * A descrição do tópico prometia o assunto e ele não existia — e é um dos
 * itens cobrados em Calcul différentiel (0M02). A armadilha central é
 * substituir o valor do instante ANTES de derivar, o que anula a derivada.
 */
function exercicioTaxasRelacionadas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher<Cenario>(
    nivel === 'dificil' ? ['escada', 'esfera', 'quadrado'] : ['esfera', 'quadrado'],
  );

  if (cenario === 'esfera') {
    const raio = rng.inteiro(2, 12);
    const taxaRaio = rng.inteiro(1, 6);
    // dV/dt = 4πr²·dr/dt
    const gabarito = 4 * Math.PI * raio * raio * taxaRaio;

    return {
      id: `aplic-taxas-esfera-${raio}-${taxaRaio}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Um balão esférico é inflado e seu raio cresce ${taxaRaio} cm/s. A que taxa o VOLUME ` +
        `cresce no instante em que o raio vale ${raio} cm? (em cm³/s, 2 casas decimais)`,
      enunciadoTex:
        `V = \\frac{4}{3}\\pi r^{3} \\qquad \\frac{dr}{dt} = ${taxaRaio} ` +
        `\\qquad r = ${raio}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Partimos da relação que vale em qualquer instante.',
            tex: 'V = \\frac{4}{3}\\pi r^{3}',
          },
          {
            descricao: 'Derivamos os dois lados em relação ao tempo, pela regra da cadeia.',
            tex: '\\frac{dV}{dt} = 4\\pi r^{2} \\frac{dr}{dt}',
            nota: 'O fator 4πr² é a área da superfície da esfera.',
          },
          {
            descricao: 'Só agora substituímos os valores do instante pedido.',
            tex:
              `\\frac{dV}{dt} = 4\\pi \\cdot ${raio}^{2} \\cdot ${taxaRaio} = ` +
              `${(4 * raio * raio * taxaRaio)}\\pi \\approx ${gabarito.toFixed(2)}`,
          },
        ],
      },
      conceitos: ['aplic-derivada.taxas-relacionadas'],
      armadilhas: semColisoes(
        [
          {
            resposta: (4 / 3) * Math.PI * raio ** 3,
            diagnostico:
              'Esse é o VOLUME no instante, não a taxa com que ele cresce. A pergunta é por ' +
              'dV/dt, que sai de derivar a relação.',
            passo: 0,
            conceito: 'aplic-derivada.taxas-relacionadas',
          },
          {
            resposta: 4 * Math.PI * raio * raio,
            diagnostico:
              'Faltou multiplicar por dr/dt. A regra da cadeia dá dV/dt = (dV/dr)·(dr/dt), e ' +
              `aqui dr/dt = ${taxaRaio}.`,
            passo: 1,
            conceito: 'aplic-derivada.taxas-relacionadas',
          },
          {
            resposta: 4 * Math.PI * taxaRaio * taxaRaio * raio,
            diagnostico:
              'O que vai ao quadrado é o RAIO, não a taxa: dV/dt = 4πr²·(dr/dt).',
            passo: 1,
            conceito: 'aplic-derivada.taxas-relacionadas',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'medio' ? 'Derive V em relação a t antes de substituir o raio.' : undefined,
    };
  }

  if (cenario === 'quadrado') {
    const lado = rng.inteiro(3, 20);
    const taxaLado = rng.inteiro(1, 5);
    // dA/dt = 2L·dL/dt
    const gabarito = 2 * lado * taxaLado;

    return {
      id: `aplic-taxas-quadrado-${lado}-${taxaLado}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `O lado de um quadrado cresce ${taxaLado} cm/s. A que taxa cresce a ÁREA no instante ` +
        `em que o lado mede ${lado} cm? (em cm²/s)`,
      enunciadoTex:
        `A = L^{2} \\qquad \\frac{dL}{dt} = ${taxaLado} \\qquad L = ${lado}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: 'A área em função do lado.', tex: 'A = L^{2}' },
          {
            descricao: 'Derivando em relação ao tempo.',
            tex: '\\frac{dA}{dt} = 2L\\frac{dL}{dt}',
            nota: 'O 2L é o perímetro dividido por 2: crescer o lado acrescenta duas faixas.',
          },
          {
            descricao: 'Substituindo os valores do instante.',
            tex: `\\frac{dA}{dt} = 2 \\cdot ${lado} \\cdot ${taxaLado} = ${gabarito}`,
          },
        ],
      },
      conceitos: ['aplic-derivada.taxas-relacionadas'],
      armadilhas: semColisoes(
        [
          {
            resposta: taxaLado * taxaLado,
            diagnostico:
              'A taxa da área não é o quadrado da taxa do lado. É preciso derivar A = L², o ' +
              'que traz o lado ATUAL para a conta.',
            passo: 1,
            conceito: 'aplic-derivada.taxas-relacionadas',
          },
          {
            resposta: lado * lado,
            diagnostico: 'Esse é a área no instante, não a taxa com que ela cresce.',
            passo: 0,
            conceito: 'aplic-derivada.taxas-relacionadas',
          },
          {
            resposta: 4 * taxaLado,
            diagnostico: 'Essa é a taxa do PERÍMETRO: dP/dt = 4·dL/dt. A pergunta é pela área.',
            passo: 1,
            conceito: 'aplic-derivada.taxas-relacionadas',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  }

  // Escada de comprimento L apoiada na parede: x² + y² = L².
  const trio = rng.escolher([
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [9, 12, 15],
    [8, 15, 17],
  ]);
  const [x, y, comprimento] = trio as [number, number, number];
  const taxaX = rng.inteiro(1, 4);
  // x·dx/dt + y·dy/dt = 0  ⇒  dy/dt = −x·(dx/dt)/y
  const gabarito = -(x * taxaX) / y;

  return {
    id: `aplic-taxas-escada-${x}-${y}-${taxaX}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma escada de ${comprimento} m escorrega: o pé dela se afasta da parede a ${taxaX} m/s. ` +
      `A que taxa o topo desce quando o pé está a ${x} m da parede? ` +
      '(em m/s, com sinal, 3 casas decimais)',
    enunciadoTex:
      `x^{2} + y^{2} = ${comprimento}^{2} \\qquad \\frac{dx}{dt} = ${taxaX} ` +
      `\\qquad x = ${x}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Pitágoras vale em todo instante: é a relação a derivar.',
          tex: `x^{2} + y^{2} = ${comprimento ** 2}`,
        },
        {
          descricao: 'Derivamos em relação ao tempo; o lado direito é constante.',
          tex: '2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0',
        },
        {
          descricao: 'Isolamos a taxa procurada.',
          tex: '\\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt}',
        },
        {
          descricao: `Com x = ${x}, Pitágoras dá y = ${y}.`,
          tex:
            `\\frac{dy}{dt} = -\\frac{${x}}{${y}} \\cdot ${taxaX} = ` +
            `${gabarito.toFixed(3)}`,
          nota: 'O sinal negativo é a informação física: o topo DESCE enquanto o pé se afasta.',
        },
      ],
    },
    conceitos: ['aplic-derivada.taxas-relacionadas'],
    armadilhas: semColisoes(
      [
        {
          resposta: (x * taxaX) / y,
          diagnostico:
            'O módulo está certo, mas falta o sinal: y diminui enquanto x cresce, então ' +
            'dy/dt é negativo.',
          passo: 2,
          conceito: 'aplic-derivada.taxas-relacionadas',
        },
        {
          resposta: -taxaX,
          diagnostico:
            'As duas taxas não são iguais em módulo. Elas se relacionam por x/y, que muda ' +
            'conforme a escada escorrega — e perto do chão o topo desce muito mais rápido.',
          passo: 2,
          conceito: 'aplic-derivada.taxas-relacionadas',
        },
        {
          resposta: -(y * taxaX) / x,
          diagnostico: 'A razão está de cabeça para baixo: dy/dt = −(x/y)·(dx/dt).',
          passo: 2,
          conceito: 'aplic-derivada.taxas-relacionadas',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Derive x² + y² = L² em relação a t. O comprimento é constante.',
  };
}
