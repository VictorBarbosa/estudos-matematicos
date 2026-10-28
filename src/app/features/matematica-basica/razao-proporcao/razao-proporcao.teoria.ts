import { divisaoProporcionalComPassos, razaoComPassos, regraDeTresComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_PROPORCAO: readonly Teoria[] = [
  {
    id: 'proporcao.razao',
    titulo: 'Razão',
    resumo: 'A comparação entre duas grandezas por divisão.',
    definicao:
      'A razão entre a e b é o quociente a/b. Ela responde "quantas vezes a cabe em b" e, por ' +
      'ser um quociente, não tem unidade quando as grandezas são do mesmo tipo — é isso que ' +
      'permite comparar coisas de tamanhos muito diferentes.',
    formulas: [
      { tex: 'a : b = \\frac{a}{b}', legenda: 'Lê-se "a está para b".' },
      {
        tex: '\\frac{a}{b} = \\frac{a \\div d}{b \\div d}',
        legenda: 'Simplificar não muda a razão.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Numa turma de 12 meninas e 18 meninos, a razão é 12 para 18.',
        tex: '\\frac{12}{18}',
      },
      {
        descricao: 'Simplificando, a proporção fica evidente.',
        tex: '\\frac{12}{18} = \\frac{2}{3}',
        nota: 'Para cada 2 meninas há 3 meninos — a informação essencial, sem os números grandes.',
      },
    ],
    exemplo: {
      enunciado: 'Qual a razão entre 45 e 60?',
      passos: razaoComPassos(45, 60).passos,
    },
    vejaTambem: ['proporcao.proporcao', 'proporcao.regra-de-tres'],
  },
  {
    id: 'proporcao.proporcao',
    titulo: 'Proporção',
    resumo: 'Igualdade entre duas razões — e o produto cruzado que a caracteriza.',
    definicao:
      'Uma proporção é a afirmação de que duas razões são iguais. Dela decorre a propriedade ' +
      'fundamental: o produto dos meios é igual ao produto dos extremos, que é o que torna ' +
      'possível descobrir um termo desconhecido.',
    formulas: [{ tex: '\\frac{a}{b} = \\frac{c}{d} \\iff a \\cdot d = b \\cdot c' }],
    demonstracao: [
      {
        descricao: 'Partimos da igualdade entre as duas razões.',
        tex: '\\frac{a}{b} = \\frac{c}{d}',
      },
      {
        descricao: 'Multiplicamos os dois lados por b·d, que elimina os denominadores.',
        tex: '\\frac{a}{b} \\cdot bd = \\frac{c}{d} \\cdot bd',
      },
      {
        descricao: 'Cancelando, sobra o produto cruzado.',
        tex: 'a \\cdot d = c \\cdot b',
        nota: 'Não é um truque: é só a eliminação de denominadores, feita de uma vez.',
      },
    ],
    exemplo: {
      enunciado: '3 está para 4 assim como 9 está para quanto?',
      passos: regraDeTresComPassos(3, 4, 9).passos,
    },
    vejaTambem: ['proporcao.regra-de-tres', 'proporcao.razao'],
  },
  {
    id: 'proporcao.regra-de-tres',
    titulo: 'Regra de três: direta e inversa',
    resumo: 'Antes de montar a conta, decida se as grandezas crescem juntas.',
    definicao:
      'Na regra de três direta, as grandezas crescem juntas e o que se conserva é a razão. Na ' +
      'inversa, uma cresce enquanto a outra diminui e o que se conserva é o produto. Escolher ' +
      'errado entre as duas é o erro mais comum do tema — e nenhuma conta corrige isso depois.',
    formulas: [
      {
        tex: '\\frac{a}{b} = \\frac{c}{x} \;\\Rightarrow\; x = \\frac{b \\cdot c}{a}',
        legenda: 'Diretamente proporcionais.',
      },
      {
        tex: 'a \\cdot b = c \\cdot x \;\\Rightarrow\; x = \\frac{a \\cdot b}{c}',
        legenda: 'Inversamente proporcionais.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Direta: o dobro de quilos custa o dobro de reais, então a razão preço/peso é fixa.',
        tex: '\\frac{R\\$}{\\text{kg}} = \\text{constante}',
      },
      {
        descricao: 'Inversa: o dobro de operários leva metade do tempo, então o produto é fixo.',
        tex: '\\text{operários} \\times \\text{tempo} = \\text{constante}',
        nota: 'O trabalho total não muda; apenas é repartido de outro jeito.',
      },
      {
        descricao: 'O teste decisivo: se uma grandeza dobra, a outra dobra ou cai pela metade?',
        tex: '\\text{dobra} \\to \\text{direta} \\qquad \\text{cai pela metade} \\to \\text{inversa}',
      },
    ],
    exemplo: {
      enunciado: 'Se 4 operários levam 12 dias, quantos dias levam 6 operários?',
      passos: regraDeTresComPassos(4, 12, 6, true).passos,
    },
    vejaTambem: ['proporcao.divisao', 'proporcao.proporcao'],
  },
  {
    id: 'proporcao.divisao',
    titulo: 'Divisão proporcional',
    resumo: 'Repartir um total em partes que guardam uma razão dada.',
    definicao:
      'Dividir um total em partes proporcionais a certos pesos é escrever cada parte como o ' +
      'peso vezes uma constante comum. A soma das partes determina essa constante, e com ela ' +
      'todas as partes ficam definidas de uma vez.',
    formulas: [
      {
        tex: 'x_i = p_i \\cdot k \\quad \\text{com} \\quad k = \\frac{T}{\\sum p_i}',
        legenda: 'T é o total e pᵢ são os pesos.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Partes proporcionais aos pesos significam que todas compartilham o mesmo fator k.',
        tex: 'x_1 = p_1 k \\qquad x_2 = p_2 k',
      },
      {
        descricao: 'A soma tem de reconstituir o total.',
        tex: 'p_1 k + p_2 k = T \;\\Rightarrow\; k(p_1 + p_2) = T',
      },
      {
        descricao: 'Isolando k, o problema fica resolvido.',
        tex: 'k = \\frac{T}{p_1 + p_2}',
      },
    ],
    exemplo: {
      enunciado: 'Dividir R$ 500,00 entre dois sócios, na razão 2 para 3.',
      passos: divisaoProporcionalComPassos(500, [2, 3]).passos,
    },
    vejaTambem: ['proporcao.regra-de-tres'],
  },
];
