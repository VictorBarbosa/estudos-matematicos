import { Polinomio, formatar, integralNumerica } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'area-entre' | 'volume' | 'area-simples';

/** Exercícios de aplicação da integral: áreas e volumes. */
export const geradorAplicacoesIntegral: GeradorExercicio<number> = {
  topicoId: 'aplicacoes-da-integral',
  formatoResposta: 'um número com até 3 casas, ex.: 4,667',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'volume') {
      // Girando y = ax de 0 a h: cone de volume π a² h³/3.
      const a = rng.inteiro(1, 9);
      const h = rng.inteiro(1, 14);
      const gabarito = (Math.PI * a * a * h ** 3) / 3;

      return {
        id: `aplint-vol-${a}${h}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `Girando a reta em torno do eixo x, de 0 a ${h}, qual é o volume do sólido? ` +
          '(3 casas decimais)',
        enunciadoTex: `y = ${a === 1 ? '' : a}x \\qquad 0 \\leq x \\leq ${h}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Cada fatia é um disco de raio igual ao valor da função.',
              tex: `V = \\pi\\int_{0}^{${h}} \\left(${a === 1 ? '' : a}x\\right)^{2} dx`,
            },
            {
              descricao: 'Expandindo o quadrado e integrando.',
              tex: `= \\pi \\cdot ${a * a} \\cdot \\frac{x^{3}}{3}\\Big|_{0}^{${h}}`,
            },
            {
              descricao: 'Avaliando nos limites.',
              tex: `= \\frac{\\pi \\cdot ${a * a} \\cdot ${h ** 3}}{3} = ${gabarito.toFixed(4)}`,
              nota: 'É a fórmula do volume do cone, obtida por integração.',
            },
          ],
        },
        conceitos: ['aplic-integral.volume'],
        armadilhas: semColisoes(
          [
            {
              resposta: (a * h * h) / 2,
              diagnostico:
                'Esse é a ÁREA sob a reta, não o volume. Para o volume é preciso elevar o ' +
                'raio ao quadrado e multiplicar por π.',
              passo: 0,
              conceito: 'aplic-integral.volume',
            },
            {
              resposta: (a * a * h ** 3) / 3,
              diagnostico: 'Faltou multiplicar por π: a área de cada disco é πr².',
              passo: 2,
              conceito: 'aplic-integral.volume',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    if (pergunta === 'area-entre') {
      // Entre y = ax e y = bx²: cruzam em 0 e em a/b.
      const a = rng.inteiro(2, 20);
      const b = rng.inteiro(1, 6);
      const cruzamento = a / b;
      const gabarito = integralNumerica((x) => a * x - b * x * x, 0, cruzamento);

      return {
        id: `aplint-entre-${a}_${b}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é a área da região entre as duas curvas? (3 casas decimais)',
        enunciadoTex: `y = ${a}x \\qquad y = ${b === 1 ? '' : b}x^{2}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Primeiro achamos onde as curvas se cruzam.',
              tex: `${a}x = ${b === 1 ? '' : b}x^{2} \;\\Rightarrow\; x = 0 \;\\text{ou}\; x = ${formatar(cruzamento)}`,
            },
            {
              descricao: 'Entre esses pontos, a reta está acima da parábola.',
              tex: `${a}x \\geq ${b === 1 ? '' : b}x^{2} \\quad \\text{para} \\quad 0 \\leq x \\leq ${formatar(cruzamento)}`,
            },
            {
              descricao: 'Integramos a diferença.',
              tex: `A = \\int_{0}^{${a}} \\left(${a}x - x^{2}\\right) dx`,
            },
            {
              descricao: 'Calculando.',
              tex: `= \\frac{${a} \\cdot ${a * a}}{2} - \\frac{${a ** 3}}{3} = ${gabarito.toFixed(4)}`,
            },
          ],
        },
        conceitos: ['aplic-integral.area'],
        armadilhas: semColisoes(
          [
            {
              resposta: integralNumerica((x) => x * x - a * x, 0, a),
              diagnostico:
                'A diferença está invertida, e por isso a área saiu negativa. Integra-se ' +
                'sempre a curva de CIMA menos a de baixo.',
              passo: 2,
              conceito: 'aplic-integral.area',
            },
            {
              resposta: integralNumerica((x) => a * x, 0, a),
              diagnostico:
                'Você integrou apenas a reta, obtendo a área sob ela. A região pedida é o ' +
                'que fica ENTRE as duas curvas — falta descontar a parábola.',
              passo: 2,
              conceito: 'aplic-integral.area',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Ache os pontos de interseção para obter os limites.' : undefined,
      };
    }

    // Área simples sob um monômio ax^n. Variar o expoente, e não só o
    // coeficiente, é o que dá variedade real a esta pergunta.
    const a = rng.inteiro(1, 12);
    const ate = rng.inteiro(1, 8);
    const expoente = nivel === 'facil' ? 2 : rng.inteiro(1, 3);
    const p = Polinomio.deGraus({ [expoente]: a });
    const gabarito = (a * ate ** (expoente + 1)) / (expoente + 1);

    return {
      id: `aplint-simples-${a}_${expoente}_${ate}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é a área sob a curva de 0 a ${ate}? (3 casas decimais)`,
      enunciadoTex: `y = ${p.paraTex()}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'A área é a integral da função no intervalo.',
            tex: `A = \\int_{0}^{${ate}} ${p.paraTex()}\\,dx`,
          },
          {
            descricao: 'Integrando pela regra da potência.',
            tex: `= \\frac{${a}x^{3}}{3}\\Big|_{0}^{${ate}} = ${gabarito.toFixed(4)}`,
          },
        ],
      },
      conceitos: ['aplic-integral.area'],
      armadilhas: semColisoes(
        [
          {
            resposta: p.avaliar(ate),
            diagnostico:
              'Esse é o valor da função no extremo, não a área. A área exige integrar ao ' +
              'longo de todo o intervalo.',
            passo: 0,
            conceito: 'aplic-integral.area',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['area-simples', 'area-entre']);
    case 'medio':
      return rng.escolher<Pergunta>(['area-entre', 'volume', 'area-simples']);
    case 'dificil':
      return rng.escolher<Pergunta>(['volume', 'area-entre']);
  }
}
