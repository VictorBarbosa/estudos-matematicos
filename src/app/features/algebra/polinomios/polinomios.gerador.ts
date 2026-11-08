import {
  Polinomio,
  dividirComPassos,
  fatorarPorRaizesComPassos,
  raizesRacionais,
  restoPorBinomioComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

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

  analisar: analisarNumero,

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
    // No extremo só ficam as duas que exigem percorrer a divisão inteira; o
    // grau sobe para 4 em `sortearCubico`, que passa a olhar o nível.
    case 'extremo':
      return rng.escolher<Pergunta>(['raiz', 'coeficiente-quociente']);
  }
}

/** Um polinômio de grau 3 com coeficientes pequenos. */
function sortearCubico(rng: Rng, nivel: Nivel = 'medio'): Polinomio {
  if (nivel === 'extremo') {
    /*
     * Grau 4, com coeficiente líder diferente de 1.
     *
     * Briot-Ruffini ganha uma linha, e o coeficiente líder faz o quociente
     * deixar de ser mônico — os dois pontos em que a conta costuma escapar.
     */
    return Polinomio.de(
      rng.inteiro(-12, 12),
      rng.inteiro(-12, 12),
      rng.inteiro(-9, 9),
      rng.inteiro(-6, 6),
      rng.escolher([2, 3, -2, -3]),
    );
  }

  return Polinomio.de(
    rng.inteiro(-6, 6),
    rng.inteiro(-6, 6),
    rng.inteiro(-4, 4),
    rng.escolher([1, 1, 2, -1]),
  );
}

/** Qual é o resto da divisão por (x − a)? */
function exercicioResto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = sortearCubico(rng, nivel);
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
          // O passo da substituição, que é onde o polinômio inteiro entra.
          passo: 3,
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
          diagnostico: 'Grau menor que o divisor é característica do RESTO, não do quociente.',
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

  const daFatoracao = fatorarPorRaizesComPassos(p).passos;
  const passos = [
    ...daFatoracao,
    {
      // A resolução acaba em Bhaskara, e ela dá só DUAS das raízes. Sem este
      // passo juntando tudo, a pergunta parecia ser sobre as duas últimas.
      descricao:
        'Reunimos TODAS as raízes — a que passou no teste e as que vieram da fórmula. ' +
        'A pergunta pede a menor entre elas.',
      tex:
        `x \\in \\{${[...encontradas].sort((um, outro) => um - outro).join(',\\; ')}\\}` +
        ` \\Rightarrow \\min = ${gabarito}`,
    },
  ];

  return {
    id: `poli-raiz-${raizes.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Todas as raízes deste polinômio são racionais. Considerando TODAS elas, qual é a menor?',
    enunciadoTex: `P(x) = ${p.paraTex()}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['polinomios.raizes'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.max(...encontradas),
          diagnostico: 'Essa é a MAIOR raiz. A pergunta pede a menor.',
          // O passo que reúne todas as raízes, qualquer que seja o caminho.
          passo: passos.length - 1,
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
  const p = sortearCubico(rng, nivel);
  const a = rng.escolher([-2, -1, 1, 2]);
  const divisor = Polinomio.de(-a, 1);

  const { resultado, passos } = dividirComPassos(p, divisor);
  const quociente = resultado.quociente;
  const grau = rng.inteiro(0, Math.max(0, quociente.grau));
  const gabarito = quociente.coeficiente(grau);

  const sinal = a >= 0 ? '-' : '+';
  const termo =
    grau === 0
      ? 'o termo constante'
      : grau === 1
        ? 'o coeficiente de x'
        : `o coeficiente de x^${grau}`;

  return {
    id: `poli-coef-${p.coeficientes.join('_')}-${a}-${grau}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Divida P(x) por (x ${sinal} ${Math.abs(a)}). No quociente, qual é ${termo}?`,
    enunciadoTex: `P(x) = ${p.paraTex()}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: `Do quociente, o enunciado pede ${termo}.`,
          tex: `Q(x) = ${quociente.paraTex()} \\Rightarrow ${grau === 0 ? 'a_0' : `a_${grau}`} = ${gabarito}`,
        },
      ],
    },
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
