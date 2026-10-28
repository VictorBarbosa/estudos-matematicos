import {
  Dimensao,
  GRANDEZAS,
  dimensaoParaTex,
  dimensoesIguais,
  elevarDimensao,
  grandezaPorNome,
  multiplicarDimensoes,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

/** A resposta é o expoente de uma das dimensões de base. */
const proximos = (a: number, b: number): boolean => a === b;

type Pergunta =
  | 'expoente-M'
  | 'expoente-L'
  | 'expoente-T'
  | 'combinacao'
  | 'consistencia'
  | 'conversao';

export const geradorDimensional: GeradorExercicio<number> = {
  topicoId: 'analise-dimensional',
  formatoResposta: 'um número inteiro, ex.: -2',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'expoente-M':
        return exercicioExpoente('M', nivel, rng);
      case 'expoente-L':
        return exercicioExpoente('L', nivel, rng);
      case 'expoente-T':
        return exercicioExpoente('T', nivel, rng);
      case 'combinacao':
        return exercicioCombinacao(nivel, rng);
      case 'consistencia':
        return exercicioConsistencia(nivel, rng);
      case 'conversao':
        return exercicioConversao(nivel, rng);
    }
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
      return rng.escolher<Pergunta>(['expoente-L', 'expoente-T', 'expoente-M', 'combinacao']);
    case 'medio':
      return rng.escolher<Pergunta>(['combinacao', 'expoente-M', 'expoente-T', 'conversao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['combinacao', 'consistencia', 'conversao', 'expoente-M']);
  }
}

function exercicioExpoente(
  base: keyof Dimensao,
  nivel: Nivel,
  rng: Rng,
): Exercicio<number> {
  // Grandezas derivadas são as interessantes; as de base são triviais.
  const derivadas = GRANDEZAS.filter(
    (grandeza) => !['comprimento', 'massa', 'tempo'].includes(grandeza.nome),
  );

  const grandeza = rng.escolher(derivadas);
  const gabarito = grandeza.dimensao[base];

  return {
    id: `dim-exp-${base}-${grandeza.nome}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Na dimensão de ${grandeza.nome} (unidade ${grandeza.unidade}), qual é o expoente de ` +
      `${base}? (responda 0 se não aparece)`,
    enunciadoTex: `[\\text{${grandeza.nome}}] = ?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `A dimensão de ${grandeza.nome} sai da sua definição física.`,
          tex: `[\\text{${grandeza.nome}}] = ${dimensaoParaTex(grandeza.dimensao)}`,
        },
        {
          descricao: `Olhando o expoente de ${base}.`,
          tex: `${base}^{${gabarito}}`,
          nota:
            gabarito === 0
              ? `${base} não aparece: a grandeza não depende dessa dimensão de base.`
              : gabarito < 0
                ? `Expoente negativo: ${base} está no denominador.`
                : undefined,
        },
        {
          descricao: 'Conferindo pela unidade do SI.',
          tex: `\\text{${grandeza.unidade}}`,
        },
      ],
    },
    conceitos: ['dimensional.grandezas'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico:
            'O sinal está invertido. Expoente negativo significa que a dimensão está no ' +
            'denominador — confira a definição da grandeza.',
          passo: 1,
          conceito: 'dimensional.grandezas',
        },
        {
          resposta: gabarito === 0 ? 1 : 0,
          diagnostico:
            gabarito === 0
              ? 'Essa dimensão não aparece nessa grandeza. Volte à definição e confira quais ' +
                'grandezas de base realmente entram.'
              : 'Essa dimensão aparece sim. Expoente zero significaria independência dela.',
          passo: 0,
          conceito: 'dimensional.grandezas',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? 'Escreva a grandeza em termos de m, kg e s, e leia os expoentes.'
        : undefined,
  };
}

function exercicioConsistencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  /** Candidatas a "fórmula do período": só uma fecha dimensionalmente. */
  const candidatas: readonly {
    readonly tex: string;
    readonly descricao: string;
    readonly dimensao: Dimensao;
  }[] = [
    {
      tex: '2\\pi\\sqrt{\\frac{L}{g}}',
      descricao: 'raiz de comprimento sobre gravidade',
      dimensao: { M: 0, L: 0, T: 1 },
    },
    {
      tex: '2\\pi\\sqrt{\\frac{g}{L}}',
      descricao: 'raiz de gravidade sobre comprimento',
      dimensao: { M: 0, L: 0, T: -1 },
    },
    {
      tex: '2\\pi\\sqrt{Lg}',
      descricao: 'raiz do produto',
      dimensao: { M: 0, L: 1, T: -1 },
    },
    {
      tex: '2\\pi\\frac{L}{g}',
      descricao: 'comprimento sobre gravidade',
      dimensao: { M: 0, L: 0, T: 2 },
    },
  ];

  const periodo = { M: 0, L: 0, T: 1 };
  const embaralhadas = [...candidatas].sort(() => rng.inteiro(-1, 1));

  const correta = embaralhadas.findIndex((candidata) =>
    dimensoesIguais(candidata.dimensao, periodo),
  );

  const gabarito = correta + 1;

  return {
    id: `dim-cons-${embaralhadas.map((c) => c.descricao[0]).join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Qual das expressões abaixo pode representar o PERÍODO de um pêndulo? Responda o ' +
      'número da opção.\n' +
      embaralhadas.map((candidata, indice) => `${indice + 1}) ${candidata.descricao}`).join('\n'),
    enunciadoTex: embaralhadas
      .map((candidata, indice) => `${indice + 1})\; ${candidata.tex}`)
      .join(' \\qquad '),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O período é um tempo, então a expressão precisa ter dimensão T.',
          tex: '[T] = T',
        },
        {
          descricao: 'Testamos a dimensão de cada candidata.',
          tex: embaralhadas
            .map((candidata, indice) => `${indice + 1}) ${dimensaoParaTex(candidata.dimensao)}`)
            .join(' \\quad '),
          nota: 'As constantes como 2π são adimensionais e não entram na conta.',
        },
        {
          descricao: 'Apenas uma tem dimensão de tempo.',
          tex: `${gabarito})\; ${embaralhadas[correta]!.tex}`,
          nota: 'O teste não garante o fator 2π — esse vem da dinâmica, não das dimensões.',
        },
      ],
    },
    conceitos: ['dimensional.verificacao'],
    armadilhas: semColisoes(
      embaralhadas
        .map((candidata, indice) => ({
          resposta: indice + 1,
          diagnostico:
            `A opção ${indice + 1} tem dimensão ${dimensaoParaTex(candidata.dimensao)}, não T. ` +
            (candidata.dimensao.T === -1
              ? 'Isso é frequência, o inverso do período.'
              : 'Confira os expoentes antes de substituir qualquer número.'),
          passo: 1,
          conceito: 'dimensional.verificacao',
        }))
        .filter((armadilha) => armadilha.resposta !== gabarito),
      gabarito,
      proximos,
    ),
  };
}

function exercicioConversao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const casos: readonly {
    readonly enunciado: string;
    readonly tex: string;
    readonly fator: number;
    readonly nota: string;
  }[] = [
    {
      enunciado: 'Converta 1 m³ para litros.',
      tex: '1\\,\\text{m}^{3} = ?\\,\\text{L}',
      fator: 1000,
      nota: '1 L = 1 dm³, e 1 m³ tem 10³ dm³.',
    },
    {
      enunciado: 'Converta 1 m² para cm².',
      tex: '1\\,\\text{m}^{2} = ?\\,\\text{cm}^{2}',
      fator: 10000,
      nota: 'O fator linear 100 entra ao quadrado: 100² = 10 000.',
    },
    {
      enunciado: 'Converta 1 m³ para cm³.',
      tex: '1\\,\\text{m}^{3} = ?\\,\\text{cm}^{3}',
      fator: 1e6,
      nota: 'O fator linear 100 entra ao cubo: 100³ = 10⁶.',
    },
    {
      enunciado: 'Quantos metros por segundo valem 36 km/h?',
      tex: '36\\,\\text{km/h} = ?\\,\\text{m/s}',
      fator: 10,
      nota: 'Dividir por 3,6 converte km/h em m/s.',
    },
    {
      enunciado: 'Converta 1 g/cm³ para kg/m³.',
      tex: '1\\,\\text{g/cm}^{3} = ?\\,\\text{kg/m}^{3}',
      fator: 1000,
      nota: 'A massa divide por 1000 e o volume por 10⁻⁶: sobra o fator 1000.',
    },
  ];

  const caso = rng.escolher(casos);

  return {
    id: `dim-conv-${caso.fator}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: caso.enunciado,
    enunciadoTex: caso.tex,
    gabarito: caso.fator,
    resolucao: {
      resultado: caso.fator,
      passos: [
        {
          descricao: 'Converter unidades compostas exige elevar o fator ao expoente da unidade.',
          tex: '(\\text{fator linear})^{n}',
        },
        {
          descricao: 'Aplicando ao caso.',
          tex: `${caso.tex.replace('?', String(caso.fator))}`,
          nota: caso.nota,
        },
      ],
    },
    conceitos: ['dimensional.grandezas', 'notacao.unidades'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.round(Math.sqrt(caso.fator)),
          diagnostico:
            'Você usou o fator LINEAR. Numa unidade de área ou volume, ele precisa ser elevado ' +
            'ao expoente correspondente.',
          passo: 0,
          conceito: 'dimensional.grandezas',
        },
        {
          resposta: 1 / caso.fator,
          diagnostico:
            'O sentido da conversão está invertido: trocar por uma unidade menor aumenta o ' +
            'número.',
          passo: 1,
          conceito: 'notacao.unidades',
        },
      ],
      caso.fator,
      proximos,
    ),
  };
}

/**
 * Dimensão de um produto de duas grandezas, uma delas elevada a um expoente.
 *
 * É a pergunta que dá variedade de verdade ao tópico: perguntar o expoente de
 * uma grandeza tabelada esgota a tabela em poucas dezenas de exercícios, mas
 * combinar duas grandezas multiplica o espaço pelo tamanho da tabela.
 */
function exercicioCombinacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeira = rng.escolher(GRANDEZAS);
  const segunda = rng.escolher(GRANDEZAS);
  const expoente = nivel === 'facil' ? 1 : rng.inteiro(2, 3);
  const base = rng.escolher<keyof Dimensao>(['M', 'L', 'T']);

  const dimensao = multiplicarDimensoes(
    primeira.dimensao,
    elevarDimensao(segunda.dimensao, expoente),
  );

  const gabarito = dimensao[base];
  const potencia = expoente === 1 ? '' : `^{${expoente}}`;

  return {
    id: `dim-comb-${primeira.nome}-${segunda.nome}-${expoente}-${base}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Considere o produto de ${primeira.nome} por ${segunda.nome}` +
      `${expoente === 1 ? '' : ` elevado${expoente === 2 ? ' ao quadrado' : ' ao cubo'}`}. ` +
      `Na dimensão do resultado, qual é o expoente de ${base}? (responda 0 se não aparece)`,
    enunciadoTex:
      `\\left[\\text{${primeira.simbolo}} \\cdot \\text{${segunda.simbolo}}${potencia}\\right] = ?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Escrevemos a dimensão de cada fator.',
          tex:
            `[\\text{${primeira.nome}}] = ${dimensaoParaTex(primeira.dimensao)} \\qquad ` +
            `[\\text{${segunda.nome}}] = ${dimensaoParaTex(segunda.dimensao)}`,
        },
        {
          descricao: 'Elevar a um expoente multiplica todos os expoentes da dimensão.',
          tex: `\\left(${dimensaoParaTex(segunda.dimensao)}\\right)${potencia} = ${dimensaoParaTex(elevarDimensao(segunda.dimensao, expoente))}`,
          nota: 'Nenhuma conta numérica: só aritmética de expoentes.',
        },
        {
          descricao: 'Multiplicar as grandezas soma os expoentes correspondentes.',
          tex: `${dimensaoParaTex(dimensao)}`,
        },
        {
          descricao: `Lendo o expoente de ${base}.`,
          tex: `${base}^{${gabarito}}`,
        },
      ],
    },
    conceitos: ['dimensional.grandezas'],
    armadilhas: semColisoes(
      [
        {
          resposta: primeira.dimensao[base] + segunda.dimensao[base],
          diagnostico:
            expoente === 1
              ? 'Confira a soma dos expoentes de cada fator nessa dimensão.'
              : `O expoente ${expoente} multiplica os expoentes do segundo fator antes da soma. ` +
                'Somar as dimensões diretamente ignora a potência.',
          passo: 1,
          conceito: 'dimensional.grandezas',
        },
        {
          resposta: primeira.dimensao[base] * segunda.dimensao[base],
          diagnostico:
            'Multiplicar GRANDEZAS soma os expoentes; multiplicar os expoentes entre si seria ' +
            'o efeito de uma potência de potência.',
          passo: 2,
          conceito: 'dimensional.grandezas',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Multiplicar grandezas soma os expoentes de cada dimensão.' : undefined,
  };
}
