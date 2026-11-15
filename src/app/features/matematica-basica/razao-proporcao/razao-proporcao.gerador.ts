import { Idioma } from '@core/i18n/models/i18n.model';
import { moldesDe, textosDoMolde } from '@core/enunciados/moldes/moldes.model';
import { Passo, regraDeTresComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

/**
 * As formas de pergunta deste tópico.
 *
 * Cada uma tem os seus moldes de texto em `core/enunciados/moldes/moldes.json`,
 * e é a forma que diz qual conta responde a pergunta: trocar as palavras de um
 * molde é livre; mudar a forma dele muda a matemática.
 */
type Forma =
  | 'direta'
  | 'inversa'
  | 'unitaria-direta'
  | 'unitaria-inversa'
  | 'composta-direta-direta'
  | 'composta-inversa-inversa';

/*
 * Perguntas de valor unitário: o mesmo cálculo, com a pergunta mudada.
 *
 * «Quanto custa 1 kg?» e «em quantos dias 1 operário termina?» são a mesma
 * proporção com `c = 1`. São formas de pergunta à parte porque a resposta tem
 * outro significado — a taxa unitária, ou o produto conservado — e é isso que
 * o aluno precisa reconhecer.
 */

// ──────���──────────────────────────────────────────────────────────────────────
// Regra de três composta: duas grandezas mudam ao mesmo tempo.
// ─────────────────────────────────────────────────────────────────────────────

interface ValoresCompostos {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly e: number;
}

type TipoComposto = 'direta-direta' | 'inversa-inversa';

// ─────────────────────────────────────────────────────────────────────────────
// Auxiliares de sorteio
// ─────────────────────────────────────────────────────────────────────────────

function divisoresProprios(n: number): readonly number[] {
  const divisores: number[] = [];
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      divisores.push(d);
      if (d !== n / d) {
        divisores.push(n / d);
      }
    }
  }
  return divisores;
}

/** Um número com pelo menos um divisor próprio, para a regra inversa fechar inteira. */
function comDivisor(rng: Rng, minimo: number, maximo: number): number {
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const candidato = rng.inteiro(minimo, maximo);
    if (divisoresProprios(candidato).length > 0) {
      return candidato;
    }
  }
  return 12;
}

function parametrosDiretos(rng: Rng, nivel: Nivel): { a: number; b: number; c: number } {
  const a = rng.inteiro(2, nivel === 'facil' ? 8 : 14);
  const taxa = rng.inteiro(2, nivel === 'facil' ? 9 : 20);
  const c = rng.inteiro(2, nivel === 'facil' ? 9 : 18);
  return { a, b: a * taxa, c };
}

function parametrosInversos(rng: Rng, nivel: Nivel): { a: number; b: number; c: number } {
  const a = comDivisor(rng, 2, nivel === 'facil' ? 9 : 14);
  const b = rng.inteiro(2, nivel === 'facil' ? 10 : 24);
  const divisor = rng.escolher(divisoresProprios(a));
  return { a, b, c: a / divisor };
}

function parametrosUnitarios(
  rng: Rng,
  nivel: Nivel,
  inversa: boolean,
): { a: number; b: number; c: number } {
  if (inversa) {
    return { a: rng.inteiro(2, 8), b: rng.inteiro(2, 12), c: 1 };
  }

  const a = rng.inteiro(2, nivel === 'facil' ? 6 : 10);
  return { a, b: a * rng.inteiro(2, 12), c: 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dicas e diagnósticos
// ─────────────────────────────────────────────────────────────────────────────

type Dica = Readonly<Record<Idioma, (a: number, b: number, c: number) => string>>;

const DICA_DIRETA: Dica = {
  pt: (a, b, c) =>
    `Quando a primeira grandeza vai de ${a} para ${c}, a segunda vai de ${b} para x. As duas crescem juntas?`,
  fr: (a, b, c) =>
    `Quand la première grandeur passe de ${a} à ${c}, la seconde passe de ${b} à x. Croissent-elles ensemble ?`,
  en: (a, b, c) =>
    `When the first quantity goes from ${a} to ${c}, the second goes from ${b} to x. Do they grow together?`,
};

const DICA_INVERSA: Dica = {
  pt: (a, b, c) =>
    `Quando a primeira grandeza vai de ${a} para ${c}, a segunda vai de ${b} para x. Se uma cresce, a outra diminui?`,
  fr: (a, b, c) =>
    `Quand la première grandeur passe de ${a} à ${c}, la seconde passe de ${b} à x. Si l'une croît, l'autre diminue ?`,
  en: (a, b, c) =>
    `When the first quantity goes from ${a} to ${c}, the second goes from ${b} to x. If one grows, does the other shrink?`,
};

const DICA_UNITARIA: Dica = {
  pt: () => 'A pergunta é sobre UMA unidade: reduza o par conhecido a 1 antes de comparar.',
  fr: () => 'La question porte sur UNE unité : ramenez la paire connue à 1 avant de comparer.',
  en: () => 'The question asks about ONE unit: reduce the known pair to 1 before comparing.',
};

const DICA_COMPOSTA: Readonly<Record<Idioma, string>> = {
  pt: 'Duas grandezas mudam ao mesmo tempo. Resolva uma de cada vez, mantendo a outra fixa.',
  fr: "Deux grandeurs changent en même temps. Traitez-en une à la fois, en gardant l'autre fixe.",
  en: 'Two quantities change at once. Handle one at a time, holding the other fixed.',
};

const DIAGNOSTICO_TIPO_ERRADO: Readonly<Record<Idioma, (inversa: boolean) => string>> = {
  pt: (inversa) =>
    inversa
      ? 'Estas grandezas são INVERSAMENTE proporcionais: quando uma aumenta, a outra diminui. ' +
        'Você montou a proporção direta. Aqui o que se conserva é o produto, não a razão.'
      : 'Estas grandezas são DIRETAMENTE proporcionais: as duas crescem juntas. Você montou a ' +
        'regra inversa, que vale quando uma aumenta e a outra diminui.',
  fr: (inversa) =>
    inversa
      ? 'Ces grandeurs sont INVERSEMENT proportionnelles : quand l’une augmente, l’autre diminue. ' +
        'Vous avez posé la proportion directe. Ici, c’est le produit qui se conserve, pas le rapport.'
      : 'Ces grandeurs sont DIRECTEMENT proportionnelles : les deux augmentent ensemble. Vous avez ' +
        'posé la règle inverse, qui vaut quand l’une augmente et l’autre diminue.',
  en: (inversa) =>
    inversa
      ? 'These quantities are INVERSELY proportional: when one increases, the other decreases. ' +
        'You set up the direct proportion. Here the product is conserved, not the ratio.'
      : 'These quantities are DIRECTLY proportional: both grow together. You set up the inverse ' +
        'rule, which applies when one increases and the other decreases.',
};

const DIAGNOSTICO_TERMOS_TROCADOS: Readonly<Record<Idioma, string>> = {
  pt:
    'Os termos foram trocados de lugar na montagem. Confira qual grandeza corresponde a qual: ' +
    'o x precisa ficar do mesmo lado que a grandeza do mesmo tipo.',
  fr:
    'Les termes ont été placés dans le mauvais ordre. Vérifiez quelle grandeur correspond à ' +
    'quelle autre : l’inconnue doit être du même côté que la grandeur de même nature.',
  en:
    'The terms were placed in the wrong order. Check which quantity matches which: the unknown ' +
    'must sit on the same side as the quantity of the same kind.',
};

const DIAGNOSTICO_UMA_SO_GRANDEZA: Readonly<Record<Idioma, string>> = {
  pt:
    'Você ajustou só uma das grandezas. Com duas mudando ao mesmo tempo, cada uma entra como um ' +
    'fator multiplicativo — e os dois fatores se multiplicam.',
  fr:
    'Vous n’avez ajusté qu’une seule grandeur. Quand deux changent en même temps, chacune entre ' +
    'comme un facteur multiplicatif — et les deux facteurs se multiplient.',
  en:
    'You adjusted only one of the quantities. When two change at once, each enters as a ' +
    'multiplicative factor — and the two factors multiply.',
};

const DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA: Readonly<
  Record<Idioma, (tipo: 'direta-direta' | 'inversa-inversa') => string>
> = {
  pt: (tipo) =>
    tipo === 'direta-direta'
      ? 'As duas grandezas crescem juntas: mais horas de trabalho, mais produção. Você tratou ' +
        'uma delas como inversa, dividindo em vez de multiplicar.'
      : 'As duas grandezas são inversas: mais máquinas e mais horas por dia reduzem os dias. ' +
        'Você tratou uma delas como direta, multiplicando em vez de dividir.',
  fr: (tipo) =>
    tipo === 'direta-direta'
      ? 'Les deux grandeurs augmentent ensemble : plus d’heures de travail, plus de production. ' +
        'Vous avez traité l’une d’elles comme inverse, en divisant au lieu de multiplier.'
      : 'Les deux grandeurs sont inverses : plus de machines et plus d’heures par jour réduisent ' +
        'les jours. Vous avez traité l’une d’elles comme directe, en multipliant au lieu de diviser.',
  en: (tipo) =>
    tipo === 'direta-direta'
      ? 'Both quantities grow together: more hours of work, more output. You treated one of them ' +
        'as inverse, dividing instead of multiplying.'
      : 'Both quantities are inverse: more machines and more hours a day reduce the days. You ' +
        'treated one of them as direct, multiplying instead of dividing.',
};

const DIAGNOSTICO_ORDEM_ERRADA: Readonly<Record<Idioma, string>> = {
  pt: 'A ordem dos fatores foi trocada: confira qual grandeza multiplica qual antes de calcular.',
  fr: 'L’ordre des facteurs a été inversé : vérifiez quelle grandeur multiplie quelle autre avant de calculer.',
  en: 'The factors are in the wrong order: check which quantity multiplies which before computing.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Montagem dos exercícios
// ─────────────────────────────────────────────────────────────────────────────

export const geradorProporcao: GeradorExercicio<number> = {
  topicoId: 'razao-proporcao',
  formatoResposta: 'um número, ex.: 18 ou 7,5',
  formatoRespostaTraducoes: {
    fr: 'un nombre, p. ex. 18 ou 7,5',
    en: 'a number, e.g. 18 or 7.5',
  },

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    if (nivel === 'extremo') {
      return exercicioComposto(rng);
    }

    const inversa = nivel === 'facil' ? false : rng.booleano();
    const unitario = nivel === 'dificil' && rng.booleano();
    return exercicioSimples(nivel, rng, inversa, unitario);
  },

  analisar: (entrada) => analisarNumero(entrada.replace(/R\$/g, '')),

  ...numeroComCasas(2, 1e-4),
};

function exercicioSimples(
  nivel: Nivel,
  rng: Rng,
  inversa: boolean,
  unitario: boolean,
): Exercicio<number> {
  const forma: Forma = inversa
    ? unitario
      ? 'unitaria-inversa'
      : 'inversa'
    : unitario
      ? 'unitaria-direta'
      : 'direta';

  const molde = rng.escolher(moldesDe('razao-proporcao', forma));
  const { a, b, c } = unitario
    ? parametrosUnitarios(rng, nivel, inversa)
    : inversa
      ? parametrosInversos(rng, nivel)
      : parametrosDiretos(rng, nivel);

  const textos = textosDoMolde(molde, { a, b, c });
  const resolucao = regraDeTresComPassos(a, b, c, inversa);
  const erradaDireta = regraDeTresComPassos(a, b, c, false).resultado;
  const erradaInversa = regraDeTresComPassos(a, b, c, true).resultado;
  const dica = unitario ? DICA_UNITARIA : inversa ? DICA_INVERSA : DICA_DIRETA;

  return {
    id: `proporcao-${inversa ? 'inversa' : 'direta'}${unitario ? '-unitaria' : ''}-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: textos.pt,
    traducoes: {
      fr: { enunciado: textos.fr, dica: dica.fr(a, b, c) },
      en: { enunciado: textos.en, dica: dica.en(a, b, c) },
    },
    /*
     * No Difícil, só o enunciado.
     *
     * A fórmula ao lado do texto responde a pergunta antes dela ser feita:
     * `\frac{a}{b} = \frac{c}{x}` já diz que a proporção é direta, e
     * `a \cdot b = c \cdot x` que é inversa — que é exatamente a decisão que o
     * exercício existe para treinar. Ela reaparece na resolução, depois da
     * resposta, que é quando ela ensina.
     */
    enunciadoTex: nivelAoMenos(nivel, 'dificil')
      ? SEM_FORMULA
      : inversa
        ? `${a} \\cdot ${b} = ${c} \\cdot x \\qquad x = \\;?`
        : `\\frac{${a}}{${b}} = \\frac{${c}}{x} \\qquad x = \\;?`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['proporcao.regra-de-tres', 'proporcao.proporcao'],
    armadilhas: semColisoes(
      [
        {
          resposta: inversa ? erradaDireta : erradaInversa,
          diagnostico: DIAGNOSTICO_TIPO_ERRADO.pt(inversa),
          diagnosticoTraducoes: {
            fr: DIAGNOSTICO_TIPO_ERRADO.fr(inversa),
            en: DIAGNOSTICO_TIPO_ERRADO.en(inversa),
          },
          passo: 0,
          conceito: 'proporcao.regra-de-tres',
        },
        {
          resposta: (a * c) / b,
          diagnostico: DIAGNOSTICO_TERMOS_TROCADOS.pt,
          diagnosticoTraducoes: {
            fr: DIAGNOSTICO_TERMOS_TROCADOS.fr,
            en: DIAGNOSTICO_TERMOS_TROCADOS.en,
          },
          passo: 1,
          conceito: 'proporcao.proporcao',
        },
      ],
      resolucao.resultado,
      proximos,
    ),
    dica: dica.pt(a, b, c),
  };
}

function exercicioComposto(rng: Rng): Exercicio<number> {
  /*
   * O tipo é sorteado antes do molde, e não lido dele: é ele que decide a
   * conta, e um sorteio só sobre o texto não pode mudar a matemática.
   */
  const tipo: TipoComposto = rng.booleano() ? 'direta-direta' : 'inversa-inversa';
  const molde = rng.escolher(moldesDe('razao-proporcao', `composta-${tipo}`));
  const valores = tipo === 'direta-direta' ? valoresDiretaDireta(rng) : valoresInversaInversa(rng);

  const textos = textosDoMolde(molde, { ...valores });
  const resolucao = resolucaoComposta(tipo, valores);
  const dica = DICA_COMPOSTA;

  const parcial =
    tipo === 'direta-direta'
      ? valores.b * (valores.d / valores.a)
      : valores.c * (valores.a / valores.d);
  const outroParcial =
    tipo === 'direta-direta'
      ? valores.b * (valores.e / valores.c)
      : valores.c * (valores.b / valores.e);
  const direcaoErrada =
    tipo === 'direta-direta'
      ? valores.b * (valores.d / valores.a) * (valores.c / valores.e)
      : valores.c * (valores.a / valores.d) * (valores.b / valores.e);

  const armadilhas: readonly Armadilha<number>[] = [
    {
      resposta: parcial,
      diagnostico: DIAGNOSTICO_UMA_SO_GRANDEZA.pt,
      diagnosticoTraducoes: {
        fr: DIAGNOSTICO_UMA_SO_GRANDEZA.fr,
        en: DIAGNOSTICO_UMA_SO_GRANDEZA.en,
      },
      passo: 1,
      conceito: 'proporcao.regra-de-tres-composta',
    },
    {
      resposta: direcaoErrada,
      diagnostico: DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA.pt(tipo),
      diagnosticoTraducoes: {
        fr: DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA.fr(tipo),
        en: DIAGNOSTICO_DIRECAO_ERRADA_COMPOSTA.en(tipo),
      },
      passo: 1,
      conceito: 'proporcao.regra-de-tres-composta',
    },
    {
      resposta: outroParcial,
      diagnostico: DIAGNOSTICO_ORDEM_ERRADA.pt,
      diagnosticoTraducoes: {
        fr: DIAGNOSTICO_ORDEM_ERRADA.fr,
        en: DIAGNOSTICO_ORDEM_ERRADA.en,
      },
      passo: 2,
      conceito: 'proporcao.proporcao',
    },
  ];

  return {
    id: `proporcao-composta-${tipo}-${valores.a}-${valores.b}-${valores.c}-${valores.d}-${valores.e}-${rng.inteiro(0, 9999)}`,
    nivel: 'extremo',
    enunciado: textos.pt,
    traducoes: {
      fr: { enunciado: textos.fr, dica: dica.fr },
      en: { enunciado: textos.en, dica: dica.en },
    },
    enunciadoTex: SEM_FORMULA,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['proporcao.regra-de-tres-composta', 'proporcao.regra-de-tres'],
    armadilhas: semColisoes(armadilhas, resolucao.resultado, proximos),
    dica: dica.pt,
  };
}

function valoresDiretaDireta(rng: Rng): ValoresCompostos {
  const a = rng.inteiro(2, 6);
  const maquinas = rng.inteiro(2, 4);
  const c = rng.inteiro(2, 8);
  const horas = rng.inteiro(2, 4);
  const b = rng.inteiro(2, 12) * 10;
  return { a, b, c, d: a * maquinas, e: c * horas };
}

function valoresInversaInversa(rng: Rng): ValoresCompostos {
  const a = rng.inteiro(2, 6);
  const maisOperarios = rng.inteiro(2, 4);
  const b = rng.inteiro(2, 8);
  const maisHoras = rng.inteiro(2, 4);
  const c = rng.inteiro(2, 6) * maisOperarios * maisHoras;
  return { a, b, c, d: a * maisOperarios, e: b * maisHoras };
}

function resolucaoComposta(tipo: TipoComposto, v: ValoresCompostos) {
  const plano: Passo = {
    descricao:
      'Duas grandezas mudam ao mesmo tempo. Resolvemos uma de cada vez, mantendo a outra fixa.',
    tex: `\\left(${v.a},\\; ${v.c}\\right) \\;\\longrightarrow\\; \\left(${v.d},\\; ${v.e}\\right)`,
  };

  if (tipo === 'direta-direta') {
    const primeira = regraDeTresComPassos(v.a, v.b, v.d, false);
    const segunda = regraDeTresComPassos(v.c, primeira.resultado, v.e, false);
    return {
      resultado: segunda.resultado,
      passos: [plano, ...primeira.passos, ...segunda.passos],
    };
  }

  const primeira = regraDeTresComPassos(v.a, v.c, v.d, true);
  const segunda = regraDeTresComPassos(v.b, primeira.resultado, v.e, true);
  return {
    resultado: segunda.resultado,
    passos: [plano, ...primeira.passos, ...segunda.passos],
  };
}
