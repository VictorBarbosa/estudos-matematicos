import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_GASES: readonly Teoria[] = [
  {
    id: 'gas.equacao',
    titulo: 'PV = nRT',
    resumo: 'Fixados dois, o terceiro está decidido.',
    definicao:
      'Para um gás rarefeito, pressão, volume, quantidade e temperatura não são ' +
      'independentes: a equação dos gases ideais liga os quatro. O modelo supõe partículas ' +
      'sem volume próprio e sem atração entre si, o que é falso — e mesmo assim acerta bem, ' +
      'porque num gás comum a distância entre as partículas é grande demais para que o resto ' +
      'importe. É em pressão alta e temperatura baixa, quando elas se aproximam, que o modelo ' +
      'começa a errar.',
    formulas: [
      {
        tex: 'PV = nRT',
        legenda: 'R = 0,08206 L·atm/(mol·K) quando P vem em atm e V em litros.',
      },
      {
        tex: 'V = \\frac{nRT}{P} \\qquad n = \\frac{PV}{RT}',
        legenda: 'A mesma equação, isolada no que a pergunta pede.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Um mol, a uma atmosfera e 0 °C.',
        tex: 'T = 273{,}15\\;\\text{K}',
      },
      {
        descricao: 'O volume sai da própria equação.',
        tex: 'V = \\frac{1 \\times 0{,}08206 \\times 273{,}15}{1} = 22{,}41\\;\\text{L}',
        nota: 'São os 22,4 L que a escola manda decorar — e que não precisam ser decorados.',
      },
    ],
    vejaTambem: ['gas.kelvin', 'gas.transformacao'],
  },
  {
    id: 'gas.kelvin',
    titulo: 'Por que a temperatura vai em kelvin',
    resumo: 'Proporção exige uma escala cujo zero seja o zero de verdade.',
    definicao:
      'Deixar a temperatura em graus Celsius não é descuido de unidade: é usar uma escala ' +
      'onde a conta não significa o que parece. A equação afirma que o volume é PROPORCIONAL ' +
      'à temperatura, e proporção só faz sentido quando o zero da escala é a ausência da ' +
      'grandeza. Em Celsius, 20 °C não é o dobro de 10 °C — o zero ali é um ponto escolhido, ' +
      'o congelamento da água. Em kelvin, 293 K e 283 K mostram o que de fato acontece: quase ' +
      'nada muda.',
    formulas: [
      {
        tex: 'T_{\\text{K}} = T_{\\text{°C}} + 273{,}15',
        legenda: 'O tamanho do grau é o mesmo; o que muda é onde fica o zero.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dobrar a leitura em Celsius não dobra o volume.',
        tex: '10\\;\\text{°C} \\to 20\\;\\text{°C}',
      },
      {
        descricao: 'Em kelvin, o aumento é de três e meio por cento.',
        tex: '\\frac{293{,}15}{283{,}15} = 1{,}035',
        nota: 'Quem usa Celsius aqui esperaria o dobro, e erraria por um fator de quase dois.',
      },
      {
        descricao: 'Dobrar o volume de verdade exige dobrar a temperatura absoluta.',
        tex: '283{,}15\\;\\text{K} \\to 566{,}3\\;\\text{K} = 293{,}15\\;\\text{°C}',
      },
    ],
    vejaTambem: ['gas.equacao'],
  },
  {
    id: 'gas.transformacao',
    titulo: 'O mesmo gás em dois estados',
    resumo: 'P₁V₁/T₁ = P₂V₂/T₂ é PV = nRT escrita duas vezes.',
    definicao:
      'Quando nada escapa do recipiente, a quantidade de gás é a mesma antes e depois, e o ' +
      'produto nR cancela dos dois lados. O que sobra é a lei combinada — que por isso não é ' +
      'uma lei nova, e só vale enquanto o gás não entra nem sai. Lida assim, ela também ' +
      'explica as leis com nome próprio: fixando a temperatura sobra Boyle, fixando a pressão ' +
      'sobra Charles.',
    formulas: [
      {
        tex: '\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}',
        legenda: 'Com as duas temperaturas em kelvin, sempre.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cinco litros a 2 atm e 27 °C, levados a 1 atm e 127 °C.',
        tex: 'T_1 = 300{,}15\\;\\text{K} \\qquad T_2 = 400{,}15\\;\\text{K}',
      },
      {
        descricao: 'Isolando o volume final.',
        tex: 'V_2 = \\frac{2 \\times 5 \\times 400{,}15}{300{,}15 \\times 1} = 13{,}33\\;\\text{L}',
        nota: 'A pressão caiu à metade e a temperatura subiu: os dois efeitos expandem o gás.',
      },
    ],
    vejaTambem: ['gas.equacao', 'gas.kelvin'],
  },
  {
    id: 'gas.parcial',
    titulo: 'Pressões parciais: cada gás empurra sozinho',
    resumo: 'A parcela de cada um é a sua fração MOLAR da pressão total.',
    definicao:
      'Num gás ideal as partículas não se enxergam — nem as de outra espécie. Cada componente ' +
      'empurra a parede como se estivesse sozinho no recipiente, e a pressão total é a soma ' +
      'das parciais. Disso vem a consequência prática: o que decide a parcela de cada gás é ' +
      'quantas partículas ele traz, e não quanto ele pesa. Trocar fração molar por fração em ' +
      'massa é o erro do tópico, e ele é grande sempre que as massas molares diferem muito — ' +
      'hélio e argônio, por exemplo.',
    formulas: [
      {
        tex: 'P_i = x_i \\cdot P_{\\text{total}} \\qquad x_i = \\frac{n_i}{n_{\\text{total}}}',
        legenda: 'Fração molar: mols do gás sobre mols totais.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Um mol de hélio com um mol de argônio, a 2 atm no total.',
        tex: 'x_{\\text{He}} = \\frac{1}{2} = 0{,}5',
      },
      {
        descricao: 'Cada um responde por metade da pressão.',
        tex: 'P_{\\text{He}} = 0{,}5 \\times 2 = 1\\;\\text{atm}',
      },
      {
        descricao: 'Pela massa, a conclusão seria outra — e errada.',
        tex: '\\frac{4}{4 + 39{,}95} = 0{,}09',
        nota: 'O hélio é nove por cento da massa e metade das partículas: quem empurra é a partícula.',
      },
    ],
    vejaTambem: ['gas.equacao', 'mol.conceito'],
  },
];
