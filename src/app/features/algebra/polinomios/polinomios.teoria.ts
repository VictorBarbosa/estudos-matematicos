import { Polinomio, dividirComPassos, fatorarPorRaizesComPassos, restoPorBinomioComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

/** x³ − 6x² + 11x − 6 = (x−1)(x−2)(x−3), o exemplo que atravessa os três conceitos. */
const EXEMPLO = Polinomio.de(-6, 11, -6, 1);

export const TEORIA_POLINOMIOS: readonly Teoria[] = [
  {
    id: 'polinomios.estrutura',
    titulo: 'Grau e identidade',
    resumo: 'Uma soma de potências, e o que a faz ser igual a outra.',
    definicao:
      'Um polinômio é uma soma de termos aₙxⁿ. O grau é o maior expoente com coeficiente não ' +
      'nulo, e é ele que limita quantas raízes o polinômio pode ter. Dois polinômios são ' +
      'iguais quando têm os mesmos coeficientes, termo a termo — não basta coincidirem em ' +
      'alguns pontos.',
    formulas: [
      { tex: 'P(x) = a_n x^{n} + \\dots + a_1 x + a_0, \\quad a_n \\ne 0' },
      {
        tex: '\\deg(P \\cdot Q) = \\deg P + \\deg Q',
        legenda: 'Multiplicar polinômios soma os graus.',
      },
    ],
    demonstracao: [
      {
        descricao: 'No produto, o termo de maior grau só pode vir dos dois líderes.',
        tex: '(a_n x^{n})(b_m x^{m}) = a_n b_m x^{n+m}',
        nota: 'Nenhum outro par de termos alcança esse expoente.',
      },
      {
        descricao: 'Como os líderes não são nulos, o produto deles também não é.',
        tex: 'a_n b_m \\ne 0',
      },
      {
        descricao: 'Logo o grau do produto é exatamente a soma dos graus.',
        tex: '\\deg(P \\cdot Q) = n + m',
      },
    ],
    exemplo: {
      enunciado: 'Fatorando x³ − 6x² + 11x − 6 em três binômios de grau 1.',
      passos: fatorarPorRaizesComPassos(EXEMPLO).passos,
    },
    vejaTambem: ['polinomios.divisao', 'polinomios.raizes', 'fatoracao.fator-comum'],
  },
  {
    id: 'polinomios.divisao',
    titulo: 'Divisão de polinômios',
    resumo: 'A divisão com chave, agora com letras.',
    definicao:
      'Dividir P por D devolve um quociente Q e um resto R com grau menor que o de D — a mesma ' +
      'estrutura da divisão de inteiros. O algoritmo olha só o termo de maior grau, descobre ' +
      'por quanto multiplicar o divisor para igualá-lo, subtrai e repete até o grau cair o ' +
      'suficiente.',
    formulas: [
      { tex: 'P(x) = Q(x) \\cdot D(x) + R(x), \\qquad \\deg R < \\deg D' },
      {
        tex: '\\deg Q = \\deg P - \\deg D',
        legenda: 'O quociente perde exatamente o grau do divisor.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A cada rodada, igualamos o termo líder do que sobrou.',
        tex: '\\frac{a_n x^{n}}{b_m x^{m}} = \\frac{a_n}{b_m} x^{n-m}',
      },
      {
        descricao: 'Subtrair esse produto cancela o líder, então o grau do resto cai.',
        tex: 'R_1 = P - \\frac{a_n}{b_m} x^{n-m} \\cdot D, \\qquad \\deg R_1 < n',
        nota: 'É por cair sempre ao menos um grau que o processo termina.',
      },
      {
        descricao: 'Quando o grau fica abaixo do divisor, não há mais o que dividir.',
        tex: '\\deg R < \\deg D',
      },
    ],
    exemplo: {
      enunciado: 'Dividindo x³ − 6x² + 11x − 6 por x − 1.',
      passos: dividirComPassos(EXEMPLO, Polinomio.de(-1, 1)).passos,
    },
    vejaTambem: ['polinomios.estrutura', 'polinomios.raizes'],
  },
  {
    id: 'polinomios.raizes',
    titulo: 'Teorema do resto e raízes',
    resumo: 'Para saber o resto, não precisa dividir.',
    definicao:
      'O resto da divisão de P por (x − a) é simplesmente P(a). Como consequência, resto zero ' +
      'significa que (x − a) é fator e que a é raiz. E se os coeficientes são inteiros, as ' +
      'raízes racionais só podem ser frações cujo numerador divide o termo constante e cujo ' +
      'denominador divide o coeficiente líder — uma lista curta para testar.',
    formulas: [
      { tex: 'R = P(a)' },
      {
        tex: 'P(a) = 0 \\iff (x - a) \\mid P(x)',
        legenda: 'Teorema de D’Alembert: raiz e fator são a mesma informação.',
      },
      {
        tex: '\\frac{p}{q}: \; p \\mid a_0, \; q \\mid a_n',
        legenda: 'As únicas raízes racionais possíveis.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos a divisão euclidiana por um binômio; o resto é constante.',
        tex: 'P(x) = Q(x)(x - a) + R',
      },
      {
        descricao: 'Avaliamos em x = a, onde o binômio zera e o quociente desaparece.',
        tex: 'P(a) = Q(a) \\cdot 0 + R = R',
        nota: 'Não importa quem seja Q: ele é multiplicado por zero.',
      },
      {
        descricao: 'Portanto, achar o resto é só calcular um valor numérico.',
        tex: 'R = P(a)',
      },
      {
        descricao: 'E se esse valor é zero, a divisão é exata.',
        tex: 'P(x) = Q(x)(x-a)',
        nota: 'É assim que um grau 3 se reduz a um grau 2, que Bhaskara resolve.',
      },
    ],
    exemplo: {
      enunciado: 'O resto de x³ − 6x² + 11x − 6 dividido por x − 2.',
      passos: restoPorBinomioComPassos(EXEMPLO, 2).passos,
    },
    vejaTambem: ['polinomios.divisao', 'quadratica.bhaskara'],
  },
];
