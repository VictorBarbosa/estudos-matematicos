import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_ESTEQUIOMETRIA: readonly Teoria[] = [
  {
    id: 'esteq.proporcao',
    titulo: 'A proporção vale em mols',
    resumo: 'Os coeficientes da equação contam moléculas, nunca gramas.',
    definicao:
      'Uma equação balanceada diz quantas PARTÍCULAS de cada substância entram e saem: ' +
      '2 H₂ + O₂ → 2 H₂O significa duas moléculas de hidrogênio para uma de oxigênio. Essa ' +
      'razão vale em mols, porque o mol é só um pacote de partículas — e não vale em gramas, ' +
      'porque cada substância tem a sua massa molar. Confundir as duas coisas é o erro que ' +
      'este tópico existe para desfazer.',
    formulas: [
      {
        tex: '\\frac{n_B}{n_A} = \\frac{\\text{coef}_B}{\\text{coef}_A}',
        legenda: 'A razão dos coeficientes é a razão das quantidades.',
      },
      {
        tex: '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
        legenda: 'Dois mols de H₂ dão dois de água e consomem um de O₂.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Os coeficientes dão a razão direta.',
        tex: '\\frac{n_{\\text{H}_2\\text{O}}}{n_{\\text{H}_2}} = \\frac{2}{2} = 1',
      },
      {
        descricao: 'E a razão com o oxigênio é outra.',
        tex: '\\frac{n_{\\text{O}_2}}{n_{\\text{H}_2}} = \\frac{1}{2}',
        nota: 'Metade do oxigênio, em quantidade — não em massa.',
      },
      {
        descricao: 'Em massa, a mesma reação dá números bem diferentes.',
        tex: '4\;\\text{g de H}_2 + 32\;\\text{g de O}_2 \\to 36\;\\text{g de H}_2\\text{O}',
        nota: 'Dois para um em mols virou quatro para trinta e dois em gramas.',
      },
    ],
    vejaTambem: ['esteq.massa', 'mol.conceito'],
  },
  {
    id: 'esteq.massa',
    titulo: 'O trajeto: massa → mols → mols → massa',
    resumo: 'Três trechos, e o do meio é o único em que a equação entra.',
    definicao:
      'A balança mede gramas; a equação fala em mols. Ligar os dois é um trajeto de três ' +
      'trechos: converter a massa dada em mols, aplicar a proporção da equação, e converter a ' +
      'quantidade obtida de volta em massa. Pular o trecho do meio — aplicar a proporção ' +
      'direto sobre as massas — é o erro clássico, e ele é perigoso porque o resultado sai ' +
      'plausível: um número da mesma ordem de grandeza, que não denuncia o engano.',
    formulas: [
      {
        tex: 'm_B = \\frac{m_A}{M_A} \\times \\frac{\\text{coef}_B}{\\text{coef}_A} \\times M_B',
        legenda: 'Os três trechos, numa linha só.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Quatro gramas de hidrogênio: primeiro, quantos mols são.',
        tex: 'n = \\frac{4{,}03}{2{,}02} = 2\;\\text{mol}',
      },
      {
        descricao: 'A proporção da equação age sobre a quantidade.',
        tex: 'n_{\\text{H}_2\\text{O}} = 2 \\times \\frac{2}{2} = 2\;\\text{mol}',
      },
      {
        descricao: 'E a quantidade volta a ser massa.',
        tex: 'm = 2 \\times 18{,}02 = 36{,}03\;\\text{g}',
        nota:
          'Pela proporção crua daria 4,03 g — nove vezes menos, e sem nenhum sinal de que ' +
          'está errado.',
      },
    ],
    vejaTambem: ['esteq.proporcao', 'mol.massa-molar'],
  },
];
