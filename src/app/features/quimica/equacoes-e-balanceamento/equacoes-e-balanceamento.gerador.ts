import { balanceamentoComPassos, balancear, contarAtomos, equacaoQuimicaParaTex } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  ATOMOS,
  COEFICIENTE,
  DICA_ATOMOS,
  DICA_COEFICIENTE,
  DICA_SOMA,
  SOMA,
} from '@features/quimica/equacoes-e-balanceamento/equacoes-e-balanceamento.textos';

// A resposta é sempre um inteiro: coeficiente, soma de coeficientes ou
// contagem de átomos. A folga existe só para o ponto flutuante.
const { saoEquivalentes: proximos, formatar } = numeroComCasas(0, 1e-9);

interface Equacao {
  readonly reagentes: readonly string[];
  readonly produtos: readonly string[];
}

/**
 * Equações que balanceiam de um jeito só.
 *
 * Todas são reações conhecidas, e nenhuma é combinação sorteada: uma equação
 * inventada seria química falsa com aparência de verdadeira. O teste do tópico
 * confere que cada uma destas tem solução única — `C + O₂ → CO + CO₂`, por
 * exemplo, ficaria de fora, porque admite duas reações independentes e por
 * isso não tem UMA resposta.
 */
const EQUACOES: readonly Equacao[] = [
  { reagentes: ['H2', 'O2'], produtos: ['H2O'] },
  { reagentes: ['N2', 'H2'], produtos: ['NH3'] },
  { reagentes: ['Fe', 'O2'], produtos: ['Fe2O3'] },
  { reagentes: ['Al', 'O2'], produtos: ['Al2O3'] },
  { reagentes: ['Mg', 'O2'], produtos: ['MgO'] },
  { reagentes: ['Na', 'Cl2'], produtos: ['NaCl'] },
  { reagentes: ['C', 'O2'], produtos: ['CO2'] },
  { reagentes: ['CO', 'O2'], produtos: ['CO2'] },
  { reagentes: ['N2', 'O2'], produtos: ['NO'] },
  { reagentes: ['NO', 'O2'], produtos: ['NO2'] },
  { reagentes: ['SO2', 'O2'], produtos: ['SO3'] },
  { reagentes: ['P4', 'O2'], produtos: ['P2O5'] },

  // Combustões: o oxigênio é o que mais cobra o ajuste.
  { reagentes: ['CH4', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['C2H6', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['C3H8', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['C2H2', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['C6H6', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['C8H18', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['C2H6O', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['C6H12O6', 'O2'], produtos: ['CO2', 'H2O'] },
  { reagentes: ['NH3', 'O2'], produtos: ['NO', 'H2O'] },

  // Ácido com metal, com base e com carbonato.
  { reagentes: ['Zn', 'HCl'], produtos: ['ZnCl2', 'H2'] },
  { reagentes: ['Mg', 'HCl'], produtos: ['MgCl2', 'H2'] },
  { reagentes: ['Al', 'HCl'], produtos: ['AlCl3', 'H2'] },
  { reagentes: ['Fe', 'HCl'], produtos: ['FeCl2', 'H2'] },
  { reagentes: ['HCl', 'NaOH'], produtos: ['NaCl', 'H2O'] },
  { reagentes: ['H2SO4', 'NaOH'], produtos: ['Na2SO4', 'H2O'] },
  { reagentes: ['H2SO4', 'KOH'], produtos: ['K2SO4', 'H2O'] },
  { reagentes: ['CaCO3', 'HCl'], produtos: ['CaCl2', 'H2O', 'CO2'] },
  { reagentes: ['K', 'H2O'], produtos: ['KOH', 'H2'] },

  // Decomposições e deslocamentos.
  { reagentes: ['CaCO3'], produtos: ['CaO', 'CO2'] },
  { reagentes: ['NaHCO3'], produtos: ['Na2CO3', 'H2O', 'CO2'] },
  { reagentes: ['KClO3'], produtos: ['KCl', 'O2'] },
  { reagentes: ['H2O2'], produtos: ['H2O', 'O2'] },
  { reagentes: ['Fe2O3', 'C'], produtos: ['Fe', 'CO2'] },
  { reagentes: ['CuO', 'H2'], produtos: ['Cu', 'H2O'] },
  { reagentes: ['AgNO3', 'NaCl'], produtos: ['AgCl', 'NaNO3'] },
  { reagentes: ['BaCl2', 'H2SO4'], produtos: ['BaSO4', 'HCl'] },
];

type Pergunta = 'coeficiente' | 'soma' | 'atomos';

/**
 * Equações e balanceamento — o que se ajusta, e o que não se ajusta.
 *
 * Uma reação rearranja átomos: não os cria nem os destrói. Os coeficientes são
 * a única coisa ajustável, e o erro de quem está aprendendo é mexer no ÍNDICE
 * — escrever `H₂O₂` para fechar o oxigênio da água não balanceia nada, passa a
 * falar de peróxido. É por isso que a dica nomeia a diferença em vez de dar um
 * método: índice é a substância, coeficiente é quantas dela.
 *
 * A pergunta de contagem existe porque contar é a PROVA. Quem sabe conferir os
 * dois lados não precisa de gabarito para saber se acertou.
 */
export const geradorBalanceamento: GeradorExercicio<number> = {
  topicoId: 'equacoes-e-balanceamento',
  formatoResposta: 'um número inteiro',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'soma':
        return exercicioSoma(nivel, rng);
      case 'atomos':
        return exercicioAtomos(nivel, rng);
      default:
        return exercicioCoeficiente(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['coeficiente', 'soma']);
    case 'medio':
      return rng.escolher<Pergunta>(['coeficiente', 'soma', 'atomos']);
    case 'dificil':
      return rng.escolher<Pergunta>(['coeficiente', 'atomos', 'soma']);
    // Somar e contar exigem a equação inteira resolvida, e não um coeficiente
    // só: são as duas perguntas que não se acerta por tentativa.
    case 'extremo':
      return rng.escolher<Pergunta>(['soma', 'atomos']);
  }
}

/** Equações com pelo menos um coeficiente maior que um: há o que ajustar. */
const COM_AJUSTE = EQUACOES.filter((equacao) => {
  const coeficientes = balancear(equacao.reagentes, equacao.produtos);
  return coeficientes !== undefined && coeficientes.some((valor) => valor > 1);
});

function exercicioCoeficiente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const equacao = rng.escolher(COM_AJUSTE);
  const especies = [...equacao.reagentes, ...equacao.produtos];
  const coeficientes = balancear(equacao.reagentes, equacao.produtos)!;

  // A espécie perguntada é uma das que PRECISAM de coeficiente: perguntar por
  // uma de coeficiente 1 deixaria a resposta certa por preguiça.
  const indices = especies.map((_, indice) => indice).filter((i) => coeficientes[i]! > 1);
  const escolhido = rng.escolher(indices);
  const resultado = coeficientes[escolhido]!;

  const texto = enunciadoTrilingue(COEFICIENTE, [especies[escolhido]!], DICA_COEFICIENTE);
  const { passos } = balanceamentoComPassos(equacao.reagentes, equacao.produtos)!;

  // O coeficiente de outra espécie: o erro de quem balanceou e leu a linha
  // errada, ou parou antes de chegar à que a pergunta nomeia.
  const outro = coeficientes[(escolhido + 1) % especies.length]!;

  return {
    id: `bal-coef-${especies[escolhido]}-${especies.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: equacaoQuimicaParaTex(equacao.reagentes, equacao.produtos),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['balanceamento.coeficiente', 'balanceamento.conservacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1,
          diagnostico:
            'Com coeficiente 1 essa substância não fecha a conta: conte os átomos dela nos ' +
            'dois lados e veja que faltam. O coeficiente 1 é o que não se escreve, não o que ' +
            'sempre serve.',
          passo: 2,
          conceito: 'balanceamento.coeficiente',
        },
        {
          resposta: outro,
          diagnostico:
            'Esse é o coeficiente de outra substância da equação. A pergunta nomeia uma: ' +
            'confira qual.',
          passo: 2,
          conceito: 'balanceamento.coeficiente',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioSoma(nivel: Nivel, rng: Rng): Exercicio<number> {
  const equacao = rng.escolher(COM_AJUSTE);
  const coeficientes = balancear(equacao.reagentes, equacao.produtos)!;
  const resultado = coeficientes.reduce((total, valor) => total + valor, 0);

  const texto = enunciadoTrilingue(SOMA, [], DICA_SOMA);
  const { passos } = balanceamentoComPassos(equacao.reagentes, equacao.produtos)!;

  const soDosReagentes = coeficientes
    .slice(0, equacao.reagentes.length)
    .reduce((total, valor) => total + valor, 0);

  // A soma de quem ignorou os coeficientes 1, que não aparecem escritos.
  const semOsUns = coeficientes
    .filter((valor) => valor > 1)
    .reduce((total, valor) => total + valor, 0);

  return {
    id: `bal-soma-${equacao.reagentes.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: equacaoQuimicaParaTex(equacao.reagentes, equacao.produtos),
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...passos,
        {
          descricao: 'A soma leva os dois lados, e o coeficiente 1 conta.',
          tex: `${coeficientes.join(' + ')} = ${resultado}`,
          nota: 'O 1 não se escreve na equação, mas existe.',
        },
      ],
    },
    conceitos: ['balanceamento.coeficiente', 'balanceamento.conservacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: soDosReagentes,
          diagnostico:
            'Essa é a soma só do lado esquerdo. A pergunta pede os dois lados — e os ' +
            'coeficientes dos produtos fazem parte do balanceamento tanto quanto os outros.',
          passo: 3,
          conceito: 'balanceamento.coeficiente',
        },
        {
          resposta: semOsUns,
          diagnostico:
            'Os coeficientes 1 ficaram de fora. Eles não se escrevem na equação, mas existem: ' +
            'uma molécula de cada substância é uma, não zero.',
          passo: 3,
          conceito: 'balanceamento.coeficiente',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioAtomos(nivel: Nivel, rng: Rng): Exercicio<number> {
  const equacao = rng.escolher(COM_AJUSTE);
  const coeficientes = balancear(equacao.reagentes, equacao.produtos)!;

  const daEsquerda = contarAtomos(
    equacao.reagentes,
    coeficientes.slice(0, equacao.reagentes.length),
  );
  const elementos = [...daEsquerda.keys()];
  const elemento = rng.escolher(elementos);

  const resultado = daEsquerda.get(elemento)!;

  const texto = enunciadoTrilingue(ATOMOS, [elemento], DICA_ATOMOS);
  const { passos } = balanceamentoComPassos(equacao.reagentes, equacao.produtos)!;

  // A contagem de quem somou os índices e esqueceu os coeficientes.
  const semCoeficientes = contarAtomos(
    equacao.reagentes,
    equacao.reagentes.map(() => 1),
  ).get(elemento)!;

  return {
    id: `bal-atomos-${elemento}-${equacao.reagentes.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: equacaoQuimicaParaTex(equacao.reagentes, equacao.produtos),
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...passos,
        {
          descricao: `Contando ${elemento} de um lado: coeficiente vezes índice, somado.`,
          tex: `${elemento}: ${resultado}`,
          nota: 'O outro lado dá o mesmo número, e é nisso que o balanceamento se confere.',
        },
      ],
    },
    conceitos: ['balanceamento.conservacao', 'balanceamento.coeficiente'],
    armadilhas: semColisoes(
      [
        {
          resposta: semCoeficientes,
          diagnostico:
            'Os índices foram somados sem os coeficientes. O coeficiente diz quantas moléculas ' +
            'há, e cada uma traz os seus átomos: os dois se multiplicam.',
          passo: 3,
          conceito: 'balanceamento.conservacao',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

/** Exposto para o teste do tópico conferir cada equação da tabela. */
export const EQUACOES_DO_TOPICO = EQUACOES;
