import {
  ELEMENTOS,
  Elemento,
  SEGUE_A_REGRA,
  camadas,
  cargaMaisProvavel,
  comSubscritos,
  configuracaoComPassos,
  diferencaDeEletronegatividade,
  eletronegatividade,
  eletronsDaUltimaCamada,
  formulaIonica,
  formulaIonicaComPassos,
  grupo,
  lerFormula,
  mesmaFormula,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  TeclaDeSimbolo,
  semColisoes,
} from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  CARGA,
  DELTA,
  DICA_CARGA,
  DICA_DELTA,
  DICA_FORMULA,
  DICA_GRUPO,
  FORMULA_IONICA,
  GRUPO,
} from '@features/quimica/tabela-e-ligacao/tabela-e-ligacao.textos';

/**
 * A resposta: ou um número, ou uma fórmula.
 *
 * O mesmo arranjo de Composição e fórmula empírica, pelo mesmo motivo — as
 * duas mãos do tópico pedem coisas diferentes. O grupo e a carga são números;
 * o composto iônico é uma fórmula, e comparar fórmula é comparar composição.
 */
export interface Resposta {
  readonly exibida: string;
  readonly valor: number | null;
  readonly formula: string | null;
}

function numero(valor: number, casas = 0): Resposta {
  return { exibida: valor.toFixed(casas).replace('.', ','), valor, formula: null };
}

function formula(texto: string): Resposta {
  return { exibida: comSubscritos(texto), valor: null, formula: texto };
}

/** Índices subscritos, que o teclado do celular não tem. */
const SIMBOLOS: readonly TeclaDeSimbolo[] = [
  { rotulo: '₂', insere: '2', nome: 'índice dois' },
  { rotulo: '₃', insere: '3', nome: 'índice três' },
  { rotulo: '−', insere: '-', nome: 'sinal negativo' },
];

/** Os representativos que a regra diagonal acerta e que têm grupo definido. */
const COM_GRUPO = ELEMENTOS.filter(
  (elemento) =>
    SEGUE_A_REGRA(elemento.numeroAtomico) && grupo(elemento.numeroAtomico) !== undefined,
);

/** Os que formam íon de carga previsível: os que a pergunta de carga sorteia. */
const COM_CARGA = COM_GRUPO.filter(
  (elemento) => cargaMaisProvavel(elemento.numeroAtomico) !== undefined,
);

/**
 * Os cátions do tópico, sem o hidrogênio.
 *
 * O H tem um elétron na última camada e carga +1 pela conta, mas HCl não é
 * composto iônico: é molécula covalente polar. Deixá-lo na lista produziria um
 * enunciado de química errada — «o composto iônico formado por H e Cl» —, e
 * fórmula certa não compensa pergunta falsa.
 */
const CATIONS = COM_CARGA.filter(
  (elemento) => cargaMaisProvavel(elemento.numeroAtomico)! > 0 && elemento.simbolo !== 'H',
);
const ANIONS = COM_CARGA.filter((elemento) => cargaMaisProvavel(elemento.numeroAtomico)! < 0);

/** Pares de elementos que de fato se ligam, para a diferença de eletronegatividade. */
const PARES: readonly (readonly [string, string])[] = [
  ['Na', 'Cl'],
  ['K', 'Br'],
  ['Li', 'F'],
  ['Mg', 'O'],
  ['Ca', 'Cl'],
  ['Al', 'O'],
  ['Ba', 'S'],
  ['H', 'O'],
  ['H', 'Cl'],
  ['H', 'N'],
  ['H', 'S'],
  ['H', 'C'],
  ['C', 'O'],
  ['C', 'Cl'],
  ['C', 'S'],
  ['C', 'H'],
  ['Si', 'O'],
  ['N', 'O'],
  ['S', 'O'],
  ['P', 'Cl'],
  ['Fe', 'O'],
  ['Zn', 'S'],
  ['Cu', 'O'],
  ['Al', 'Cl'],
];

type Pergunta = 'grupo' | 'carga' | 'formula' | 'delta';

/**
 * Tabela periódica e ligação — a periodicidade é consequência.
 *
 * A tabela está arrumada por número atômico, e o que se repete a cada linha é
 * a última camada. Daí o grupo, daí a carga do íon, daí a fórmula do composto
 * iônico: as três perguntas são a mesma leitura, aplicada a um passo a mais de
 * cada vez.
 *
 * O que o tópico NÃO cobra é classificar a ligação a partir da diferença de
 * eletronegatividade. Os cortes de 1,7 e 0,4 são convenção de ensino, e o HF,
 * com 1,78, cai do lado iônico numa régua que o chama de molécula covalente
 * muito polar. A conta da diferença é pergunta; o rótulo que ela sugere fica na
 * teoria, onde pode vir com a ressalva.
 */
export const geradorLigacao: GeradorExercicio<Resposta> = {
  topicoId: 'tabela-e-ligacao',
  formatoResposta: 'um número com sinal, ou uma fórmula escrita como NaCl',
  simbolos: SIMBOLOS,

  gerar(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
    switch (sortearPergunta(nivel, rng)) {
      case 'carga':
        return exercicioCarga(nivel, rng);
      case 'formula':
        return exercicioFormula(nivel, rng);
      case 'delta':
        return exercicioDelta(nivel, rng);
      default:
        return exercicioGrupo(nivel, rng);
    }
  },

  analisar: (entrada: string): Resposta | null => {
    const aparado = entrada.trim();
    if (aparado === '') {
      return null;
    }

    const valor = analisarNumero(aparado);
    if (valor !== null) {
      return { exibida: aparado, valor, formula: null };
    }

    return lerFormula(aparado) === undefined ? null : formula(aparado);
  },

  saoEquivalentes: (a: Resposta, b: Resposta): boolean => {
    if (a.valor !== null && b.valor !== null) {
      return Math.abs(a.valor - b.valor) < 0.005;
    }

    return a.formula !== null && b.formula !== null && mesmaFormula(a.formula, b.formula);
  },

  formatar: (valor: Resposta): string => valor.exibida,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['grupo', 'formula']);
    case 'medio':
      return rng.escolher<Pergunta>(['carga', 'formula', 'grupo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['formula', 'delta', 'carga']);
    // A fórmula iônica exige as duas cargas e a redução: é a pergunta que
    // junta tudo o que o tópico ensina.
    case 'extremo':
      return rng.escolher<Pergunta>(['delta', 'formula']);
  }
}

/** Como o elemento aparece no enunciado: símbolo e Z, que não têm língua. */
function etiqueta(elemento: Elemento): string {
  return `${elemento.simbolo} (Z = ${elemento.numeroAtomico})`;
}

function exercicioGrupo(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const elemento = rng.escolher(COM_GRUPO);
  const z = elemento.numeroAtomico;
  const resultado = grupo(z)!;

  const texto = enunciadoTrilingue(GRUPO, [etiqueta(elemento)], DICA_GRUPO);
  const { passos } = configuracaoComPassos(z, elemento.simbolo);

  const ultima = eletronsDaUltimaCamada(z);

  return {
    id: `lig-grupo-${elemento.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito: numero(resultado),
    resolucao: {
      resultado: numero(resultado),
      passos: [
        ...passos,
        {
          descricao: 'O grupo sai da contagem da última camada.',
          tex: `${ultima} \\to \\text{grupo } ${resultado}`,
          nota:
            'Até dois elétrons, o grupo é o próprio número; de três em diante soma-se 10, ' +
            'porque os grupos 3 a 12 são o bloco d.',
        },
      ],
    },
    conceitos: ['tabela.grupo', 'eletrons.valencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(ultima),
          diagnostico:
            'Essa é a contagem da última camada, que é a numeração antiga (1A a 8A). Na ' +
            'numeração de 1 a 18, os elementos de 3 ou mais elétrons na última camada somam 10.',
          passo: 4,
          conceito: 'tabela.grupo',
        },
        {
          resposta: numero(camadas(z).length),
          diagnostico:
            'Esse é o PERÍODO, o número de camadas ocupadas. O grupo é a coluna, e vem da ' +
            'contagem da última camada.',
          passo: 4,
          conceito: 'tabela.grupo',
        },
      ],
      numero(resultado),
      geradorLigacao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioCarga(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const elemento = rng.escolher(COM_CARGA);
  const z = elemento.numeroAtomico;
  const resultado = cargaMaisProvavel(z)!;

  const texto = enunciadoTrilingue(CARGA, [etiqueta(elemento)], DICA_CARGA);
  const { passos } = configuracaoComPassos(z, elemento.simbolo);

  const ultima = eletronsDaUltimaCamada(z);

  return {
    id: `lig-carga-${elemento.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito: numero(resultado),
    resolucao: {
      resultado: numero(resultado),
      passos: [
        ...passos,
        {
          descricao:
            resultado > 0
              ? 'Com poucos elétrons na última camada, o átomo os perde.'
              : 'Perto de fechar a camada, o átomo ganha os que faltam.',
          tex: `\\text{${elemento.simbolo}}^{${Math.abs(resultado)}${resultado > 0 ? '+' : '-'}}`,
          nota: 'Nos dois casos ele chega à configuração do gás nobre mais próximo.',
        },
      ],
    },
    conceitos: ['tabela.ions', 'eletrons.valencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(-resultado),
          diagnostico:
            resultado > 0
              ? 'O sinal está trocado. Este átomo PERDE elétrons, e quem perde carga negativa ' +
                'fica positivo.'
              : 'O sinal está trocado. Este átomo GANHA elétrons, e elétron é carga negativa.',
          passo: 4,
          conceito: 'tabela.ions',
        },
        {
          resposta: numero(ultima),
          diagnostico:
            'Essa é a contagem da última camada. A carga é quantos elétrons ele perde ou ' +
            'ganha para chegar ao gás nobre — não quantos tem.',
          passo: 4,
          conceito: 'tabela.ions',
        },
      ],
      numero(resultado),
      geradorLigacao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioFormula(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const cationElemento = rng.escolher(CATIONS);
  const anionElemento = rng.escolher(ANIONS);

  const cation = {
    simbolo: cationElemento.simbolo,
    carga: cargaMaisProvavel(cationElemento.numeroAtomico)!,
  };
  const anion = {
    simbolo: anionElemento.simbolo,
    carga: cargaMaisProvavel(anionElemento.numeroAtomico)!,
  };

  const resultado = formulaIonica(cation, anion)!;
  const { passos } = formulaIonicaComPassos(cation, anion);

  const texto = enunciadoTrilingue(
    FORMULA_IONICA,
    [etiqueta(cationElemento), etiqueta(anionElemento)],
    DICA_FORMULA,
  );

  // O cruzamento sem reduzir: Mg2O2 em vez de MgO.
  const semReduzir = `${cation.simbolo}${Math.abs(anion.carga)}${anion.simbolo}${cation.carga}`;
  // As cargas no lugar errado: o índice de cada um igual à PRÓPRIA carga.
  const cruzadoErrado = `${cation.simbolo}${cation.carga}${anion.simbolo}${Math.abs(anion.carga)}`;

  return {
    id: `lig-formula-${cation.simbolo}-${anion.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: SEM_FORMULA,
    gabarito: formula(resultado),
    resolucao: { resultado: formula(resultado), passos },
    conceitos: ['tabela.ligacao-ionica', 'tabela.ions'],
    armadilhas: semColisoes(
      [
        {
          resposta: formula(semReduzir),
          diagnostico:
            'O cruzamento está certo, mas falta reduzir: a fórmula iônica é uma PROPORÇÃO, e ' +
            'proporção se escreve na forma mais simples. Mg²⁺ com O²⁻ dá MgO.',
          passo: 3,
          conceito: 'tabela.ligacao-ionica',
        },
        {
          resposta: formula(cruzadoErrado),
          diagnostico:
            'Cada elemento ficou com o próprio número como índice. É o contrário: o índice de ' +
            'um é a carga do OUTRO, e é isso que faz o composto sair neutro.',
          passo: 2,
          conceito: 'tabela.ligacao-ionica',
        },
      ],
      formula(resultado),
      geradorLigacao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}

function exercicioDelta(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
  const [primeiro, segundo] = rng.escolher(PARES);

  const eletroPrimeiro = eletronegatividade(primeiro!)!;
  const eletroSegundo = eletronegatividade(segundo!)!;
  const resultado = Number(diferencaDeEletronegatividade(primeiro!, segundo!)!.toFixed(2));

  const texto = enunciadoTrilingue(
    DELTA,
    [primeiro!, segundo!, eletroPrimeiro, eletroSegundo],
    DICA_DELTA,
  );

  return {
    id: `lig-delta-${primeiro}-${segundo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: '\\Delta = |\\chi_1 - \\chi_2|',
    gabarito: numero(resultado, 2),
    resolucao: {
      resultado: numero(resultado, 2),
      passos: [
        {
          descricao: 'A diferença é sempre positiva: subtrai-se a menor da maior.',
          tex:
            `\\Delta = |${eletroPrimeiro} - ${eletroSegundo}| = ` +
            `${Number(resultado.toFixed(2))}`,
        },
        {
          descricao:
            resultado >= 1.7
              ? 'Acima de 1,7, a ligação se trata como iônica.'
              : resultado >= 0.4
                ? 'Entre 0,4 e 1,7, a ligação se trata como covalente polar.'
                : 'Abaixo de 0,4, a ligação se trata como covalente apolar.',
          tex: `\\Delta = ${Number(resultado.toFixed(2))}`,
          nota:
            'Estes cortes são convenção de ensino, não lei: o HF tem 1,78 e se comporta como ' +
            'molécula covalente muito polar. A régua é faixa, não fronteira.',
        },
      ],
    },
    conceitos: ['tabela.eletronegatividade', 'tabela.ligacao-ionica'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(Number((eletroPrimeiro + eletroSegundo).toFixed(2)), 2),
          diagnostico:
            'Os valores foram somados. A pergunta é a DIFERENÇA — e é ela que diz o quanto um ' +
            'átomo puxa o elétron mais que o outro.',
          passo: 1,
          conceito: 'tabela.eletronegatividade',
        },
      ],
      numero(resultado, 2),
      geradorLigacao.saoEquivalentes!,
    ),
    dica: texto.dica,
  };
}
