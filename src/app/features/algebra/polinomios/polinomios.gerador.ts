import {
  Polinomio,
  dividirComPassos,
  fatorarPorRaizesComPassos,
  raizesRacionais,
  restoPorBinomioComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

type Pergunta = 'resto' | 'grau-quociente' | 'raiz' | 'coeficiente-quociente';

export const geradorPolinomios: GeradorExercicio<number> = {
  topicoId: 'polinomios',
  formatoResposta: 'um número, ex.: -6',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'resto':
        return exercicioResto(nivel, rng);
      case 'grau-quociente':
        return exercicioGrauQuociente(nivel, rng);
      case 'raiz':
        return exercicioRaiz(nivel, rng);
      case 'coeficiente-quociente':
        return exercicioCoeficienteQuociente(nivel, rng);
    }
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    const fracao = /^([+-]?\d+)\/(\d+)$/.exec(limpo);
    if (fracao) {
      return Number(fracao[1]) / Number(fracao[2]);
    }
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['resto', 'grau-quociente']);
    case 'medio':
      return rng.escolher<Pergunta>(['resto', 'raiz', 'coeficiente-quociente']);
    case 'dificil':
      return rng.escolher<Pergunta>(['raiz', 'coeficiente-quociente']);
  }
}

/** Um polinômio de grau 3 com coeficientes pequenos. */
function sortearCubico(rng: Rng): Polinomio {
  return Polinomio.de(
    rng.inteiro(-6, 6),
    rng.inteiro(-6, 6),
    rng.inteiro(-4, 4),
    rng.escolher([1, 1, 2, -1]),
  );
}

/** Qual é o resto da divisão por (x − a)? */
function exercicioResto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = sortearCubico(rng);
  const a = rng.escolher([-3, -2, -1, 1, 2, 3]);

  const { resultado, passos } = restoPorBinomioComPassos(p, a);
  const sinal = a >= 0 ? '-' : '+';

  return {
    id: `poli-resto-${p.coeficientes.join('_')}-${a}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o resto da divisão de P(x) por (x ${sinal} ${Math.abs(a)})?`,
    enunciadoTex: `P(x) = ${p.paraTex()}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['polinomios.raizes', 'polinomios.divisao'],
    armadilhas: semColisoes(
      [
        {
          resposta: p.avaliar(-a),
          diagnostico:
            'O sinal de a ficou trocado. Dividir por (x − a) pede P(a): o valor que ANULA o ' +
            'binômio, não o que aparece escrito nele.',
          passo: 1,
          conceito: 'polinomios.raizes',
        },
        {
          resposta: p.coeficiente(0),
          diagnostico:
            'Esse é o termo constante, que seria o resto da divisão por x. Para (x − a) é ' +
            'preciso avaliar o polinômio inteiro em a.',
          passo: 2,
          conceito: 'polinomios.raizes',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Pelo teorema do resto, basta calcular P(a).' : undefined,
  };
}

/** Qual é o grau do quociente? */
function exercicioGrauQuociente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const grauP = rng.inteiro(3, 6);
  const grauD = rng.inteiro(1, grauP - 1);

  const p = Polinomio.deGraus({ [grauP]: rng.escolher([1, 2, 3]), 0: rng.inteiro(-5, 5) });
  const d = Polinomio.deGraus({ [grauD]: rng.escolher([1, 2]), 0: rng.inteiro(-4, 4) });

  const gabarito = grauP - grauD;

  return {
    id: `poli-grau-${grauP}-${grauD}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Dividindo um polinômio de grau ${grauP} por um de grau ${grauD}, qual é o grau do quociente?`,
    enunciadoTex: `\\frac{${p.paraTex()}}{${d.paraTex()}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Na identidade da divisão, o produto Q·D precisa alcançar o grau de P.',
          tex: 'P = Q \\cdot D + R',
        },
        {
          descricao: 'Como multiplicar soma os graus, o grau de Q é a diferença.',
          tex: `\\deg Q = ${grauP} - ${grauD} = ${gabarito}`,
          nota: 'O resto não interfere: ele tem grau menor que o divisor.',
        },
      ],
    },
    conceitos: ['polinomios.divisao', 'polinomios.estrutura'],
    armadilhas: semColisoes(
      [
        {
          resposta: grauP + grauD,
          diagnostico:
            'Somar os graus é o que acontece na MULTIPLICAÇÃO. Na divisão, eles se subtraem.',
          passo: 1,
          conceito: 'polinomios.estrutura',
        },
        {
          resposta: grauP,
          diagnostico:
            'O quociente tem grau menor que o dividendo: dividir por algo de grau ' +
            `${grauD} derruba ${grauD} grau(s).`,
          passo: 1,
          conceito: 'polinomios.divisao',
        },
        {
          resposta: grauD - 1,
          diagnostico:
            'Grau menor que o divisor é característica do RESTO, não do quociente.',
          passo: 0,
          conceito: 'polinomios.divisao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'O grau do quociente é a diferença dos graus.' : undefined,
  };
}

/** Qual é a menor raiz racional? */
function exercicioRaiz(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Construímos a partir das raízes para garantir que existam e sejam inteiras.
  const raizes = [rng.inteiro(-4, 4), rng.inteiro(-4, 4), rng.inteiro(-4, 4)];
  const lider = rng.escolher([1, 1, 2]);

  const p = raizes.reduce(
    (acumulado, raiz) => acumulado.multiplicar(Polinomio.de(-raiz, 1)),
    Polinomio.de(lider),
  );

  const encontradas = raizesRacionais(p);
  const gabarito = Math.min(...encontradas);

  return {
    id: `poli-raiz-${raizes.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Este polinômio tem raízes racionais. Qual é a menor delas?',
    enunciadoTex: `P(x) = ${p.paraTex()}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: fatorarPorRaizesComPassos(p).passos,
    },
    conceitos: ['polinomios.raizes'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.max(...encontradas),
          diagnostico: 'Essa é a MAIOR raiz. A pergunta pede a menor.',
          passo: 1,
          conceito: 'polinomios.raizes',
        },
        {
          resposta: -gabarito,
          diagnostico:
            'O sinal está invertido: a raiz é o valor que ANULA o polinômio. Num fator ' +
            '(x − a), a raiz é a, não −a.',
          passo: 1,
          conceito: 'polinomios.raizes',
        },
        {
          resposta: p.coeficiente(0),
          diagnostico:
            'Esse é o termo constante. Ele restringe as raízes racionais possíveis, mas não ' +
            'é uma delas por si só.',
          passo: 1,
          conceito: 'polinomios.raizes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? 'Teste os divisores do termo constante: toda raiz racional está entre eles.'
        : undefined,
  };
}

/** Qual é um determinado coeficiente do quociente? */
function exercicioCoeficienteQuociente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = sortearCubico(rng);
  const a = rng.escolher([-2, -1, 1, 2]);
  const divisor = Polinomio.de(-a, 1);

  const { resultado, passos } = dividirComPassos(p, divisor);
  const quociente = resultado.quociente;
  const grau = rng.inteiro(0, Math.max(0, quociente.grau));
  const gabarito = quociente.coeficiente(grau);

  const sinal = a >= 0 ? '-' : '+';
  const termo = grau === 0 ? 'o termo constante' : grau === 1 ? 'o coeficiente de x' : `o coeficiente de x^${grau}`;

  return {
    id: `poli-coef-${p.coeficientes.join('_')}-${a}-${grau}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Divida P(x) por (x ${sinal} ${Math.abs(a)}). No quociente, qual é ${termo}?`,
    enunciadoTex: `P(x) = ${p.paraTex()}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['polinomios.divisao'],
    armadilhas: semColisoes(
      [
        {
          resposta: p.coeficiente(grau),
          diagnostico:
            'Esse é o coeficiente do DIVIDENDO nesse grau. A divisão reorganiza tudo: só os ' +
            'termos líderes coincidem.',
          passo: 1,
          conceito: 'polinomios.divisao',
        },
        {
          resposta: resultado.resto.avaliar(0),
          diagnostico: 'Esse é o resto, não um coeficiente do quociente.',
          passo: 2,
          conceito: 'polinomios.divisao',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}
