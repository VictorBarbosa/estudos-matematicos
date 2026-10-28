import { Polinomio, integrarPolinomioComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_INDEFINIDA: readonly Teoria[] = [
  {
    id: 'indefinida.antiderivada',
    titulo: 'Desfazer a derivada',
    resumo: 'Integrar é procurar a função cuja derivada é a dada.',
    definicao:
      'A integral indefinida responde: que função, derivada, dá isto? É a operação inversa ' +
      'da derivação — e por isso toda regra de derivação tem uma regra de integração ' +
      'correspondente, lida ao contrário.',
    formulas: [
      { tex: "\\int f(x)\\,dx = F(x) + C \\iff F'(x) = f(x)" },
      { tex: '\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C, \\quad n \\neq -1' },
    ],
    demonstracao: [
      {
        descricao: 'Na derivada, o expoente desce e diminui.',
        tex: "\\frac{d}{dx}(x^{4}) = 4x^{3}",
      },
      {
        descricao: 'Para desfazer, o expoente sobe e dividimos por ele.',
        tex: '\\int x^{3}\\,dx = \\frac{x^{4}}{4} + C',
      },
      {
        descricao: 'Conferindo: derivando o resultado, voltamos ao integrando.',
        tex: "\\frac{d}{dx}\\left(\\frac{x^{4}}{4}\\right) = x^{3} \;\\checkmark",
        nota: 'Derivar a resposta é sempre a melhor forma de conferir uma integral.',
      },
      {
        descricao: 'O caso n = −1 fica de fora: dividir por zero seria impossível.',
        tex: '\\int \\frac{1}{x}\\,dx = \\ln|x| + C',
      },
    ],
    exemplo: {
      enunciado: 'Integrando 3x² − 4x + 1.',
      passos: integrarPolinomioComPassos(Polinomio.de(1, -4, 3)).passos,
    },
    vejaTambem: ['indefinida.constante', 'indefinida.propriedades'],
  },
  {
    id: 'indefinida.constante',
    titulo: 'A constante de integração',
    resumo: 'Infinitas funções têm a mesma derivada.',
    definicao:
      'Como a derivada de uma constante é zero, somar qualquer número à antiderivada não ' +
      'muda nada ao derivar de volta. Por isso a resposta não é uma função, mas uma família ' +
      'inteira delas — e o + C representa essa família.',
    formulas: [
      { tex: "\\frac{d}{dx}(F(x) + C) = F'(x) = f(x)" },
    ],
    demonstracao: [
      {
        descricao: 'Todas estas funções têm a mesma derivada.',
        tex: 'x^{2},\\quad x^{2} + 5,\\quad x^{2} - 100',
      },
      {
        descricao: 'Porque a constante some ao derivar.',
        tex: "\\frac{d}{dx}(x^{2} + C) = 2x",
      },
      {
        descricao: 'Graficamente, são cópias deslocadas verticalmente.',
        tex: '\\text{mesma inclinação em cada } x',
        nota: 'Deslocar uma curva para cima não muda a inclinação em ponto algum.',
      },
      {
        descricao: 'Uma condição inicial determina qual delas é a procurada.',
        tex: 'F(0) = 3 \;\\Rightarrow\; C = 3',
      },
    ],
    exemplo: {
      enunciado: 'Integrando 2x, com a família completa de soluções.',
      passos: integrarPolinomioComPassos(Polinomio.de(0, 2)).passos,
    },
    vejaTambem: ['indefinida.antiderivada', 'indefinida.propriedades'],
  },
  {
    id: 'indefinida.propriedades',
    titulo: 'Propriedades da integral',
    resumo: 'Linear como a derivada: distribui sobre somas.',
    definicao:
      'A integral de uma soma é a soma das integrais, e constantes multiplicativas podem ' +
      'sair. Mas, como na derivada, não existe regra simples para a integral de um produto — ' +
      'é por isso que as técnicas de integração existem.',
    formulas: [
      { tex: '\\int (f + g)\\,dx = \\int f\\,dx + \\int g\\,dx' },
      { tex: '\\int c\\,f\\,dx = c\\int f\\,dx' },
      { tex: '\\int fg\\,dx \\neq \\int f\\,dx \\cdot \\int g\\,dx' },
    ],
    demonstracao: [
      {
        descricao: 'A linearidade vem direto da linearidade da derivada.',
        tex: "(F + G)' = F' + G' = f + g",
      },
      {
        descricao: 'Por isso podemos integrar polinômio termo a termo.',
        tex: '\\int (3x^{2} + 2x)\\,dx = x^{3} + x^{2} + C',
      },
      {
        descricao: 'Mas o produto não se comporta assim.',
        tex: '\\int x \\cdot x\\,dx = \\frac{x^{3}}{3} \\neq \\frac{x^{2}}{2} \\cdot \\frac{x^{2}}{2}',
      },
    ],
    exemplo: {
      enunciado: 'Integrando termo a termo.',
      passos: integrarPolinomioComPassos(Polinomio.de(5, 0, 6, 4)).passos,
    },
    vejaTambem: ['indefinida.antiderivada', 'tecnicas.substituicao'],
  },
];
