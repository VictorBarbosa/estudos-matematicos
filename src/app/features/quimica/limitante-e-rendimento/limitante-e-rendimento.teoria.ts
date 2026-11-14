import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_LIMITANTE: readonly Teoria[] = [
  {
    id: 'limitante.escolha',
    titulo: 'Quem acaba primeiro manda',
    resumo: 'Não é o mais leve nem o de menos massa: é o de menos «receitas».',
    definicao:
      'Numa receita de dois ingredientes, não adianta ter farinha para vinte bolos se há ovo ' +
      'para três. A reação é igual: o reagente que acaba primeiro decide quanto de produto se ' +
      'forma, e o resto do outro fica parado. O erro de quem está aprendendo é escolher esse ' +
      'reagente pela MASSA — achar que o mais leve acaba antes. O que decide é a quantidade ' +
      'em mols dividida pelo coeficiente, porque é essa razão que diz quantas vezes a reação ' +
      'cabe com o que se tem.',
    formulas: [
      {
        tex: '\\text{receitas} = \\frac{n}{\\text{coeficiente}}',
        legenda: 'A medida certa. O menor valor é o do limitante.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dez gramas de H₂ e 32 g de O₂, na formação de água.',
        tex: '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
      },
      {
        descricao: 'O hidrogênio alcança quase cinco receitas.',
        tex: '\\frac{10 / 2{,}02}{2} = 2{,}48',
      },
      {
        descricao: 'O oxigênio alcança uma.',
        tex: '\\frac{32 / 32}{1} = 1',
        nota: 'E é ele que limita, mesmo pesando três vezes mais que o hidrogênio.',
      },
      {
        descricao: 'Pela massa, a conclusão seria a oposta — e errada.',
        tex: '10\\;\\text{g} < 32\\;\\text{g}',
        nota: 'Massa não conta partículas; mols contam, e o coeficiente diz quantos por receita.',
      },
    ],
    vejaTambem: ['limitante.excesso', 'esteq.proporcao'],
  },
  {
    id: 'limitante.excesso',
    titulo: 'O que sobra do excesso',
    resumo: 'O outro reagente gasta só o que as receitas pediram.',
    definicao:
      'Quando o limitante acaba, a reação para. O reagente em excesso gastou apenas a parte ' +
      'correspondente às receitas que de fato aconteceram, e o resto continua ali, intacto. ' +
      'Calcular o que sobra é subtrair o consumido do disponível — e do limitante nunca sobra ' +
      'nada, porque acabar é a definição dele.',
    formulas: [
      {
        tex: 'm_{\\text{sobra}} = m_{\\text{tinha}} - (\\text{receitas} \\times \\text{coef} \\times M)',
        legenda: 'O que havia, menos o que as receitas consumiram.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Uma receita aconteceu, limitada pelo oxigênio.',
        tex: '\\text{receitas} = 1',
      },
      {
        descricao: 'Ela consumiu dois mols de hidrogênio.',
        tex: '1 \\times 2 \\times 2{,}02 = 4{,}04\\;\\text{g}',
      },
      {
        descricao: 'Dos 10 g que havia, sobram quase seis.',
        tex: '10 - 4{,}04 = 5{,}96\\;\\text{g}',
        nota: 'Esses 5,96 g continuam hidrogênio: não há com o que reagirem.',
      },
    ],
    vejaTambem: ['limitante.escolha'],
  },
  {
    id: 'limitante.rendimento',
    titulo: 'Rendimento: o possível e o obtido',
    resumo: 'A massa teórica é o teto; a bancada sempre fica abaixo dele.',
    definicao:
      'A massa que a estequiometria calcula é a TEÓRICA: o que sairia se nada se perdesse. Na ' +
      'bancada sempre se perde — fica na vidraria, evapora, reage de outro jeito. O ' +
      'rendimento compara o que se obteve com esse teto, e por isso é quase sempre menor que ' +
      '100%. Um valor acima disso não é reação generosa: é erro de medida ou produto impuro, ' +
      'ainda com solvente.',
    formulas: [
      {
        tex: '\\eta = \\frac{m_{\\text{obtida}}}{m_{\\text{teórica}}} \\times 100\\%',
        legenda: 'O obtido em cima: compara-se o que saiu com o que era possível.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A estequiometria diz que caberiam 36 g.',
        tex: 'm_{\\text{teórica}} = 36\\;\\text{g}',
      },
      {
        descricao: 'Da bancada saíram 27 g.',
        tex: '\\eta = \\frac{27}{36} \\times 100',
      },
      {
        descricao: 'Três quartos do possível.',
        tex: '\\eta = 75\\%',
        nota: 'Inverter a fração daria 133%, e esse número impossível é o próprio aviso do erro.',
      },
    ],
    vejaTambem: ['limitante.escolha', 'esteq.massa'],
  },
];
