import {
  CurvaImplicita,
  FAMILIAS_IMPLICITAS,
  TermoImplicito,
  curvaImplicitaParaTex,
  curvaPeloPonto,
  derivadaImplicitaComPassos,
  derivadaImplicitaNoPonto,
  fatorDaDerivada,
  parteSemDerivada,
  tangenteEhVertical,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de derivação implícita.
 *
 * A curva é sempre montada A PARTIR do ponto: escolhemos (x, y) inteiros e
 * calculamos a constante do lado direito. Assim o ponto está exatamente sobre a
 * curva — sem arredondamento — e a derivada sai racional, o que deixa a
 * resposta digitável como fração.
 */

const CASAS = 4;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

type Tipo = 'conica' | 'produto' | 'cubica' | 'mista';

const FAMILIAS_POR_TIPO: Readonly<Record<Tipo, readonly string[]>> = {
  conica: ['circunferência', 'elipse', 'hipérbole'],
  produto: ['hipérbole equilátera'],
  cubica: ['cúbica'],
  mista: ['cônica com termo misto', 'curva com produto misto'],
};

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['conica'],
  medio: ['conica', 'produto', 'cubica'],
  dificil: ['cubica', 'mista', 'produto'],
};

export const geradorDerivacaoImplicita: GeradorExercicio<number> = {
  topicoId: 'derivacao-implicita',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const tipo = rng.escolher(TIPOS_POR_NIVEL[nivel]);

    // Nem todo sorteio serve: há pontos de tangente vertical, em que dy/dx não
    // existe. Tentamos de novo em vez de entregar um exercício sem resposta.
    for (let tentativa = 0; tentativa < 40; tentativa++) {
      const candidato = sortear(tipo, nivel, rng);
      if (candidato !== null) {
        return candidato;
      }
    }

    return sortearSeguro(nivel, rng);
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,

  /**
   * A fração exata e o decimal valem igualmente.
   *
   * A derivada implícita quase sempre sai como razão de inteiros, e exibir
   * `-3/4` sem aceitar `-0,75` — ou o contrário — reprovaria quem acertou.
   */
  formasEquivalentes: (valor) => [...new Set([fracaoDoValor(valor), formatar(valor)])],
};

function sortear(tipo: Tipo, nivel: Nivel, rng: Rng): Exercicio<number> | null {
  const nome = rng.escolher(FAMILIAS_POR_TIPO[tipo]);
  const familia = FAMILIAS_IMPLICITAS.find((candidata) => candidata.nome === nome)!;

  const limite = nivel === 'facil' ? 5 : nivel === 'medio' ? 7 : 9;
  const x = rng.inteiro(1, limite) * rng.sinal();
  const y = rng.inteiro(1, limite) * rng.sinal();
  const p = rng.inteiro(1, nivel === 'facil' ? 3 : 5);
  const q = rng.inteiro(1, nivel === 'facil' ? 3 : 5);

  const curva = curvaPeloPonto(familia, p, q, x, y);

  if (tangenteEhVertical(curva, x, y)) {
    return null;
  }

  const gabarito = derivadaImplicitaNoPonto(curva, x, y);
  if (!Number.isFinite(gabarito) || Math.abs(gabarito) > 500) {
    return null;
  }

  return montarExercicio(curva, x, y, gabarito, familia.descricao, nivel, rng);
}

/** A circunferência sempre funciona, e serve de rede de segurança ao sorteio. */
function sortearSeguro(nivel: Nivel, rng: Rng): Exercicio<number> {
  const familia = FAMILIAS_IMPLICITAS[0]!;
  const [x, y] = rng.escolher([
    [3, 4],
    [4, 3],
    [6, 8],
    [5, 12],
    [12, 5],
    [8, 15],
  ] as const);

  const curva = curvaPeloPonto(familia, 1, 1, x, y);
  const gabarito = derivadaImplicitaNoPonto(curva, x, y);

  return montarExercicio(curva, x, y, gabarito, familia.descricao, nivel, rng);
}

function montarExercicio(
  curva: CurvaImplicita,
  x: number,
  y: number,
  gabarito: number,
  descricaoDaFamilia: string,
  nivel: Nivel,
  rng: Rng,
): Exercicio<number> {
  const a = avaliarTermos(parteSemDerivada(curva), x, y);
  const b = avaliarTermos(fatorDaDerivada(curva), x, y);

  const armadilhas: readonly Armadilha<number>[] = [
    {
      resposta: -gabarito,
      diagnostico:
        'O sinal ficou invertido. Ao isolar, a parcela sem dy/dx passa para o outro lado da ' +
        'igualdade, e é essa passagem que produz o menos na frente da fração.',
      passo: 2,
      conceito: 'implicita.isolamento',
    },
    {
      resposta: b === 0 ? Number.NaN : -b / a,
      diagnostico:
        'Numerador e denominador estão trocados. Embaixo fica o que multiplica dy/dx; em cima, ' +
        'o que sobrou sem ele.',
      passo: 2,
      conceito: 'implicita.isolamento',
    },
    {
      resposta: -a / avaliarTermos(semRegraDoProduto(curva), x, y),
      diagnostico:
        'Um termo traz x e y multiplicados, e ele exige a regra do produto: a parte em x entra ' +
        'sem dy/dx, e a parte em y entra com ele. Aqui a segunda metade ficou de fora.',
      passo: 1,
      conceito: 'implicita.cadeia',
    },
    {
      resposta: y === 0 ? Number.NaN : -x / y,
      diagnostico:
        'Essa é a derivada da circunferência, em que os dois coeficientes são 1. Nesta curva ' +
        'eles não são, e cada um acompanha o seu termo até o fim da conta.',
      passo: 2,
      conceito: 'implicita.isolamento',
    },
    {
      resposta: a,
      diagnostico:
        'A conta parou na derivada do lado esquerdo. Ainda falta isolar dy/dx, que é o que o ' +
        'enunciado pede.',
      passo: 1,
      conceito: 'implicita.isolamento',
    },
  ];

  return {
    id: `implicita-${curva.nome}-${x}-${y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `A curva passa pelo ponto (${x}, ${y}). Encontre dy/dx nesse ponto, ` +
      'derivando implicitamente. Responda como fração ou com 4 casas decimais.',
    enunciadoTex: curvaImplicitaParaTex(curva),
    gabarito,
    resolucao: derivadaImplicitaComPassos(curva, x, y),
    conceitos: ['implicita.cadeia', 'implicita.isolamento'],
    armadilhas: semColisoes(
      armadilhas.filter((armadilha) => Number.isFinite(armadilha.resposta)),
      gabarito,
      saoEquivalentes,
    ),
    dica:
      nivel === 'facil'
        ? `Derive os dois lados. ${descricaoDaFamilia}`
        : nivel === 'medio'
          ? 'Isole dy/dx só depois de ter derivado tudo.'
          : undefined,
  };
}

/**
 * O fator de dy/dx de quem esqueceu a regra do produto.
 *
 * Num termo como `x²y`, a derivada tem duas metades: `2xy` sem dy/dx e `x²`
 * com ele. Quem deriva só a parte em x perde a segunda — e o denominador
 * encolhe exatamente nos termos mistos.
 */
function semRegraDoProduto(curva: CurvaImplicita): readonly TermoImplicito[] {
  return fatorDaDerivada(curva).filter((termo) => termo.grauX === 0);
}

function avaliarTermos(termos: readonly TermoImplicito[], x: number, y: number): number {
  return termos.reduce(
    (soma, termo) => soma + termo.coeficiente * x ** termo.grauX * y ** termo.grauY,
    0,
  );
}

/**
 * O valor escrito como fração de inteiros, quando ele é um.
 *
 * Usa frações contínuas com denominador pequeno: a derivada implícita de uma
 * curva de coeficientes inteiros num ponto inteiro é sempre racional, e exibir
 * `-3/4` diz mais ao aluno do que `-0,75`.
 */
function fracaoDoValor(valor: number): string {
  for (let denominador = 1; denominador <= 2000; denominador++) {
    const numerador = valor * denominador;
    if (Math.abs(numerador - Math.round(numerador)) < 1e-9) {
      return denominador === 1
        ? String(Math.round(numerador))
        : `${Math.round(numerador)}/${denominador}`;
    }
  }

  return formatar(valor);
}
