import { deduzirDimensaoComPassos, grandezaPorNome, verificarEquacaoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_DIMENSIONAL: readonly Teoria[] = [
  {
    id: 'dimensional.grandezas',
    titulo: 'Grandezas de base e derivadas',
    resumo: 'Tudo em mecânica se escreve com massa, comprimento e tempo.',
    definicao:
      'Na mecânica, três dimensões de base bastam: massa [M], comprimento [L] e tempo [T]. ' +
      'Toda outra grandeza é um produto de potências dessas três, e sua dimensão sai da sua ' +
      'definição física — nenhuma precisa ser memorizada.',
    formulas: [
      { tex: '[v] = LT^{-1} \\qquad [a] = LT^{-2}' },
      { tex: '[F] = MLT^{-2} \\qquad [E] = ML^{2}T^{-2}' },
    ],
    demonstracao: [
      {
        descricao: 'Velocidade é deslocamento por tempo.',
        tex: '[v] = \\frac{L}{T} = LT^{-1}',
      },
      {
        descricao: 'Força é massa vezes aceleração, pela segunda lei.',
        tex: '[F] = M \\cdot LT^{-2} = MLT^{-2}',
        nota: 'É literalmente o que o newton significa: kg·m/s².',
      },
      {
        descricao: 'Energia é força vezes deslocamento.',
        tex: '[E] = MLT^{-2}\\cdot L = ML^{2}T^{-2}',
        nota: 'E mv²/2 dá exatamente o mesmo — como tem de ser.',
      },
    ],
    exemplo: {
      enunciado: 'Deduzindo a dimensão de força a partir de F = ma.',
      passos: deduzirDimensaoComPassos('forca').passos,
    },
    vejaTambem: ['dimensional.verificacao', 'notacao.unidades'],
  },
  {
    id: 'dimensional.verificacao',
    titulo: 'Conferir sem calcular',
    resumo: 'Dimensão diferente garante fórmula errada.',
    definicao:
      'Os dois lados de uma equação física precisam ter a mesma dimensão. Essa checagem é ' +
      'barata e pega a maioria dos erros de memória — trocar um expoente, esquecer uma massa. ' +
      'O que ela não pega são fatores numéricos: um 2 fora de lugar passa pelo teste.',
    formulas: [
      { tex: '[\\text{esquerda}] = [\\text{direita}]' },
      {
        tex: 'T = 2\\pi\\sqrt{\\frac{L}{g}}',
        legenda: 'O período do pêndulo: dimensionalmente correto, e o 2π vem da dinâmica.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Somar grandezas de dimensões diferentes não tem sentido.',
        tex: 'L + T \\;\\text{não existe}',
        nota: 'Comprimento mais tempo não é nada — nem com unidades convertidas.',
      },
      {
        descricao: 'Testando a fórmula do pêndulo pelas dimensões.',
        tex: '\\sqrt{\\frac{L}{LT^{-2}}} = \\sqrt{T^{2}} = T',
        nota: 'A dimensão fecha, e de passagem revela que o período não depende da massa.',
      },
      {
        descricao: 'Já uma fórmula errada se denuncia na hora.',
        tex: '\\sqrt{\\frac{g}{L}} \\;\\Rightarrow\\; T^{-1} \\ne T',
        nota: 'Isso é frequência, não período — e o teste dimensional mostra isso sem calcular.',
      },
    ],
    exemplo: {
      enunciado: 'Comparando a dimensão de energia com a de força.',
      passos: verificarEquacaoComPassos(
        grandezaPorNome('energia')!.dimensao,
        grandezaPorNome('força')!.dimensao,
        'E',
        'F',
      ).passos,
    },
    vejaTambem: ['dimensional.grandezas', 'notacao.significativos'],
  },
];
