import { somaComPassos, somaInfinitaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_SEQUENCIAS: readonly Teoria[] = [
  {
    id: 'sequencias.progressoes',
    titulo: 'Aritmética ou geométrica',
    resumo: 'Uma soma sempre o mesmo; a outra multiplica sempre pelo mesmo.',
    definicao:
      'Numa progressão aritmética cada termo é o anterior MAIS uma constante. Numa ' +
      'geométrica, é o anterior VEZES uma constante. Essa única diferença separa o ' +
      'crescimento linear do exponencial.',
    formulas: [
      { tex: 'a_n = a_1 + (n-1)r', legenda: 'PA: a razão é somada n−1 vezes.' },
      { tex: 'a_n = a_1 \\cdot q^{n-1}', legenda: 'PG: a razão é multiplicada n−1 vezes.' },
    ],
    demonstracao: [
      {
        descricao: 'Na PA, para chegar ao termo n damos n−1 passos de tamanho r.',
        tex: 'a_1 \\to a_1 + r \\to a_1 + 2r \\to \\cdots',
      },
      {
        descricao: 'Na PG, damos n−1 multiplicações por q.',
        tex: 'a_1 \\to a_1 q \\to a_1 q^{2} \\to \\cdots',
      },
      {
        descricao: 'É o mesmo contraste entre função afim e exponencial, em passos discretos.',
        tex: '\\text{PA} \\leftrightarrow \\text{reta} \\qquad \\text{PG} \\leftrightarrow \\text{exponencial}',
      },
    ],
    exemplo: {
      enunciado: 'A soma dos 100 primeiros naturais.',
      passos: somaComPassos({ primeiro: 1, razao: 1, geometrica: false }, 100).passos,
    },
    vejaTambem: ['sequencias.soma', 'sequencias.convergencia'],
  },
  {
    id: 'sequencias.soma',
    titulo: 'Somar os termos',
    resumo: 'Dois truques diferentes, um para cada progressão.',
    definicao:
      'A soma da PA usa a simetria: escrevendo a sequência de trás para frente e somando, ' +
      'todos os pares dão o mesmo total. A da PG usa cancelamento: multiplicando a soma pela ' +
      'razão e subtraindo, quase tudo se anula.',
    formulas: [
      { tex: 'S_n = \\frac{(a_1 + a_n) \\cdot n}{2}', legenda: 'PA.' },
      { tex: 'S_n = \\frac{a_1(q^{n} - 1)}{q - 1}', legenda: 'PG, com q ≠ 1.' },
    ],
    demonstracao: [
      {
        descricao: 'Na PA, somamos a sequência com ela invertida.',
        tex: '2S_n = \\underbrace{(a_1 + a_n) + (a_2 + a_{n-1}) + \\cdots}_{n \\text{ pares iguais}}',
      },
      {
        descricao: 'Cada par soma o mesmo, então o total é imediato.',
        tex: '2S_n = n(a_1 + a_n)',
      },
      {
        descricao: 'Na PG, multiplicamos a soma pela razão e subtraímos.',
        tex: 'qS_n - S_n = a_1q^{n} - a_1',
        nota: 'Todos os termos do meio aparecem nas duas linhas e se cancelam.',
      },
    ],
    exemplo: {
      enunciado: 'Soma dos 5 primeiros termos de 1, 2, 4, 8, 16.',
      passos: somaComPassos({ primeiro: 1, razao: 2, geometrica: true }, 5).passos,
    },
    vejaTambem: ['sequencias.progressoes', 'sequencias.convergencia'],
  },
  {
    id: 'sequencias.convergencia',
    titulo: 'Somas infinitas que dão um número finito',
    resumo: 'Se cada parcela é uma fração da anterior, o total se estabiliza.',
    definicao:
      'Somar infinitas parcelas pode dar um resultado finito, desde que elas encolham rápido ' +
      'o bastante. É o que resolve o paradoxo de Zenão: infinitos passos cada vez menores ' +
      'percorrem uma distância finita.',
    formulas: [
      { tex: 'S_\\infty = \\frac{a_1}{1 - q}, \\quad |q| < 1' },
      { tex: '|q| \\geq 1 \\;\\Rightarrow\\; \\text{a série diverge}' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da soma dos n primeiros termos.',
        tex: 'S_n = \\frac{a_1(1 - q^{n})}{1 - q}',
      },
      {
        descricao: 'Com |q| < 1, multiplicar repetidamente por q leva a zero.',
        tex: '\\lim_{n \\to \\infty} q^{n} = 0',
        nota: 'Meio, um quarto, um oitavo… cada passo some mais depressa que o anterior.',
      },
      {
        descricao: 'O termo com qⁿ desaparece e sobra um valor finito.',
        tex: 'S_\\infty = \\frac{a_1}{1 - q}',
      },
      {
        descricao: 'Com |q| ≥ 1 as parcelas não encolhem, e a soma cresce sem limite.',
        tex: '1 + 2 + 4 + 8 + \\cdots = \\infty',
      },
    ],
    exemplo: {
      enunciado: 'A soma 1 + 1/2 + 1/4 + 1/8 + … vale exatamente 2.',
      passos: somaInfinitaComPassos(1, 0.5).passos,
    },
    vejaTambem: ['sequencias.soma', 'limite.intuicao'],
  },
];
