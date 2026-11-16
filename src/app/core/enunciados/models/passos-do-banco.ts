import type { Passo } from '@core/math/tipos/tipos';
import { resolverPorRegras } from '@core/enunciados/models/regras-de-passos';
import { REGRAS_POR_TOPICO } from '@core/enunciados/models/regras.catalogo';

/**
 * Os passos de resolução das perguntas do banco.
 *
 * ## O problema que isto resolve
 *
 * Uma entrada do banco é texto escrito à mão com os números no `dados-calculo`.
 * Até aqui, a resolução dela era genérica — «os dados» e «a resposta» —, e
 * genérica não ensina: quem errava «divida 150 em partes proporcionais a 1 e 4»
 * via o número certo e nenhuma pista de como chegar nele. Os 135 geradores
 * sempre devolveram a trilha completa; o banco, não.
 *
 * ## Como funciona
 *
 * Cada resolvedor reconhece a forma da pergunta pelas CHAVES do `dados-calculo`
 * — `{valor, p1, p2}` é a divisão proporcional, `{h1, h2}` é o tanque com duas
 * torneiras — e recalcula a conta, escrevendo cada passo com os números do
 * caso. O primeiro resolvedor que reconhece a forma responde.
 *
 * O `valor` que cada um devolve é a resposta RECALCULADA. É o que o guarda
 * `passos-do-banco.spec.ts` compara com o `total` do arquivo: se a fórmula
 * estiver errada, o teste acusa em todas as entradas daquela forma, e não só
 * na que alguém abriu para conferir.
 *
 * ## A cobertura, hoje
 *
 * São 7380 entradas em 1943 formas de texto, e uma forma só ganha passos
 * quando alguém escreve a fórmula dela.
 *
 * - **Pronto (5645 entradas, 76,5%):** os 24
 *   tópicos de Física; aritmética, frações, decimais, razão e proporção,
 *   combinatoria, probabilidade e juros; equações, expressões, progressões;
 *   funções afim, quadrática, exponencial, logarítmica, modular, racionais,
 *   por partes, composição e complexos; trigonometria completa; derivadas,
 *   limites, continuidade e integrais; geometria plana, analítica e espacial;
 *   vetores, retas e planos; estatística e regressão; matrizes, autovalores e
 *   binômio de Newton; EDO de 1ª e 2ª ordem e aplicações.
 * - **Falta (81 tópicos, 1735 entradas):** sobretudo as variantes de Física e
 *   de geometria com os dados apenas no texto, e alguns tópicos de álgebra
 *   linear (escalonamento).
 *
 * O guarda `passos-do-banco.spec.ts` mede a cobertura e trava a queda: o piso
 * sobe a cada tópico traduzido e nunca desce. Sem passos próprios, a entrada
 * ainda mostra os dados e a resposta — pouco para aprender, mas nunca nada.
 *
 * Formas com as MESMAS chaves e contas diferentes se separam pelo texto da
 * pergunta — é o caso de `{base, altura}`, que é retângulo, triângulo ou
 * paralelogramo, e de `{lados}`, que é prisma ou pirâmide.
 */

/** Os dados de uma entrada, sem o `total`. */
export type DadosDoBanco = Readonly<Record<string, string>>;

/** Uma forma reconhecida, com os passos e a resposta que ela mesma calculou. */
export interface ResolucaoDoBanco {
  readonly passos: readonly Passo[];
  /**
   * A resposta, recalculada pelo resolvedor.
   *
   * Texto, e não número: há respostas desta casa que são fração (`3/8`), e
   * comparar como número perderia justamente as que mais erram.
   */
  readonly valor: string;
}

type Resolvedor = (dados: DadosDoBanco, texto: string) => ResolucaoDoBanco | null;

/* ───────────────────────────── utilidades ───────────────────────────── */

const n = (dados: DadosDoBanco, chave: string): number => Number(dados[chave] ?? '0');

const tem = (dados: DadosDoBanco, ...chaves: readonly string[]): boolean =>
  chaves.every((chave) => dados[chave] !== undefined);

/** Só estas chaves, e nenhuma outra: é o que separa formas de chaves parecidas. */
const exatamente = (dados: DadosDoBanco, ...chaves: readonly string[]): boolean =>
  Object.keys(dados).length === chaves.length && tem(dados, ...chaves);

/** Um número com duas casas, como as respostas decimais do banco. */
const duas = (valor: number): string => valor.toFixed(2);

/** Sem casas quando é inteiro, com as casas que vierem quando não é. */
const numero = (valor: number): string =>
  Number.isInteger(valor) ? String(valor) : String(Number(valor.toFixed(6)));

/** Uma fração irredutível a partir de dois inteiros. */
function fracao(numerador: number, denominador: number): string {
  const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
  const d = mdc(numerador, denominador) || 1;
  const num = numerador / d;
  const den = denominador / d;
  return den === 1 ? String(num) : `${num}/${den}`;
}

/* ─────────────────────── razão e proporção ─────────────────────── */

/**
 * Os números do texto, na ordem em que aparecem.
 *
 * Metade das entradas do banco guarda os números SÓ no enunciado — o arquivo
 * tem apenas o `total`. Para essas, o resolvedor reconhece a forma pelo padrão
 * da frase e lê os valores dela. É o mesmo princípio do resto: a forma é
 * identificável, só que pela frase em vez das chaves.
 */
function numerosDoTexto(texto: string): readonly number[] {
  return [...texto.matchAll(/-?\d+(?:[.,]\d+)?/g)].map((achado) =>
    Number(achado[0].replace(',', '.')),
  );
}

const RAZAO: readonly Resolvedor[] = [
  // Torneiras e ralo, com os dados no TEXTO.
  (_d, texto) => {
    const achado =
      /torneira enche um tanque em (\d+(?:[.,]\d+)?) h.*?outra em (\d+(?:[.,]\d+)?) h.*?ralo o esvazia em (\d+(?:[.,]\d+)?) h/.exec(
        texto,
      );
    if (achado === null) return null;
    const [a, b, c] = [Number(achado[1]), Number(achado[2]), Number(achado[3])];
    const vazao = 1 / a + 1 / b - 1 / c;
    return {
      valor: duas(1 / vazao),
      passos: [
        {
          descricao: 'Cada torneira enche uma fração do tanque por hora; o ralo tira a dele.',
          tex: `\\frac{1}{${numero(a)}} + \\frac{1}{${numero(b)}} - \\frac{1}{${numero(c)}} = ${numero(vazao)}`,
        },
        {
          descricao: 'O tempo para encher é o inverso dessa vazão líquida.',
          tex: `\\frac{1}{${numero(vazao)}} = ${duas(1 / vazao)}\ \\text{h}`,
        },
      ],
    };
  },

  // Regra de três composta com máquinas, no texto.
  (_d, texto) => {
    const achado =
      /(\d+) máquinas produzem (\d+) peças em (\d+) horas.*?(\d+) máquinas produzem em (\d+) horas/.exec(
        texto,
      );
    if (achado === null) return null;
    const [m1, pecas, h1, m2, h2] = achado.slice(1).map(Number);
    const total = (pecas! / (m1! * h1!)) * m2! * h2!;
    return {
      valor: numero(total),
      passos: [
        {
          descricao: 'Primeiro, quanto UMA máquina produz por hora.',
          tex: `\\frac{${numero(pecas!)}}{${numero(m1!)} \\cdot ${numero(h1!)}} = ${numero(pecas! / (m1! * h1!))}`,
        },
        {
          descricao: 'Depois, multiplicamos pelas máquinas e horas novas.',
          tex: `${numero(pecas! / (m1! * h1!))} \\cdot ${numero(m2!)} \\cdot ${numero(h2!)} = ${numero(total)}`,
        },
      ],
    };
  },

  // Preço por quilo, no texto.
  (_d, texto) => {
    const achado = /pacote de (\d+) kg de café custa R\$ (\d+),00.*?custam (\d+) kg/.exec(texto);
    if (achado === null) return null;
    const [kg, preco, kg2] = achado.slice(1).map(Number);
    const porQuilo = preco! / kg!;
    return {
      valor: numero(porQuilo * kg2!),
      passos: [
        {
          descricao: 'O preço de um quilo é o do pacote dividido pelos quilos dele.',
          tex: `\\frac{${numero(preco!)}}{${numero(kg!)}} = ${numero(porQuilo)}\ \\text{reais/kg}`,
        },
        {
          descricao: 'Multiplicando pelos quilos pedidos.',
          tex: `${numero(porQuilo)} \\cdot ${numero(kg2!)} = ${numero(porQuilo * kg2!)}\ \\text{reais}`,
        },
      ],
    };
  },

  // Divisão proporcional, com os dados no TEXTO — é o caso do enunciado que
  // abriu este trabalho: «Divida 150 em partes proporcionais a 1 e 4».
  (_d, texto) => {
    const achado = /Divida (\d+) em partes proporcionais a (\d+) e (\d+)/.exec(texto);
    if (achado === null) return null;
    const [valor, p1, p2] = achado.slice(1).map(Number);
    const soma = p1! + p2!;
    const pedaco = valor! / soma;
    const querMaior = /MAIOR/i.test(texto);
    const parte = pedaco * (querMaior ? Math.max(p1!, p2!) : Math.min(p1!, p2!));
    return {
      valor: numero(parte),
      passos: [
        {
          descricao: 'Somamos as partes da razão: é em quantos pedaços o valor se divide.',
          tex: `${numero(p1!)} + ${numero(p2!)} = ${numero(soma)}`,
        },
        {
          descricao: 'Cada pedaço vale o valor dividido por essa soma.',
          tex: `\\frac{${numero(valor!)}}{${numero(soma)}} = ${numero(pedaco)}`,
        },
        {
          descricao: querMaior
            ? 'A MAIOR parte é a do maior número da razão.'
            : 'A MENOR parte é a do menor número da razão.',
          tex: `${numero(pedaco)} \\cdot ${numero(querMaior ? Math.max(p1!, p2!) : Math.min(p1!, p2!))} = ${numero(parte)}`,
        },
      ],
    };
  },

  // Duas torneiras enchem, o ralo esvazia.
  (d, texto) => {
    if (!tem(d, 'h1', 'h2') || !exatamente(d, 'h1', 'h2')) return null;
    const vazao = 1 / n(d, 'h1') + 1 / n(d, 'h2');
    return {
      valor: duas(1 / vazao),
      passos: [
        {
          descricao: 'Cada torneira tem uma vazão: a primeira enche 1/h1 do tanque por hora.',
          tex: `\\frac{1}{${numero(n(d, 'h1'))}} + \\frac{1}{${numero(n(d, 'h2'))}}`,
        },
        {
          descricao: 'Somamos as vazões e o tempo é o inverso da soma.',
          tex: `\\frac{1}{${numero(vazao)}} = ${duas(1 / vazao)}\\ \\text{h}`,
        },
      ],
    };
  },

  // Mistura de tintas: custo médio ponderado.
  (d) => {
    if (!tem(d, 'la', 'pa', 'lb', 'pb')) return null;
    const custo = n(d, 'la') * n(d, 'pa') + n(d, 'lb') * n(d, 'pb');
    const litros = n(d, 'la') + n(d, 'lb');
    return {
      valor: numero(custo / litros),
      passos: [
        {
          descricao: 'O custo total é o de cada tinta, e os litros também se somam.',
          tex: `\\frac{${numero(n(d, 'la'))}\\cdot ${numero(n(d, 'pa'))} + ${numero(n(d, 'lb'))}\\cdot ${numero(n(d, 'pb'))}}{${numero(n(d, 'la'))} + ${numero(n(d, 'lb'))}}`,
        },
        {
          descricao: 'Dividindo o custo total pelos litros, sai o preço médio.',
          tex: `\\frac{${numero(custo)}}{${numero(litros)}} = ${numero(custo / litros)}`,
        },
      ],
    };
  },

  // Engrenagens.
  (d) => {
    if (!tem(d, 'd1', 'd2', 'voltas')) return null;
    const maior = Math.max(n(d, 'd1'), n(d, 'd2'));
    const menor = Math.min(n(d, 'd1'), n(d, 'd2'));
    const voltas = (n(d, 'voltas') * maior) / menor;
    return {
      valor: numero(voltas),
      passos: [
        {
          descricao:
            'O número de dentes vezes as voltas é o mesmo nas duas: é o que a corrente impõe.',
          tex: `${numero(n(d, 'voltas'))} \\cdot ${numero(maior)} = x \\cdot ${numero(menor)}`,
        },
        {
          descricao: 'Isolando x, a menor gira mais.',
          tex: `x = \\frac{${numero(n(d, 'voltas'))} \\cdot ${numero(maior)}}{${numero(menor)}} = ${numero(voltas)}`,
        },
      ],
    };
  },

  // Operários e dias (inversamente proporcionais).
  (d) => {
    if (!tem(d, 'o1', 'dias', 'o2')) return null;
    const novo = (n(d, 'o1') * n(d, 'dias')) / n(d, 'o2');
    return {
      valor: numero(novo),
      passos: [
        {
          descricao: 'Mais operários, menos dias: o produto operários × dias se conserva.',
          tex: `${numero(n(d, 'o1'))} \\cdot ${numero(n(d, 'dias'))} = ${numero(n(d, 'o2'))} \\cdot x`,
        },
        { descricao: 'Isolando x.', tex: `x = ${numero(novo)}\\ \\text{dias}` },
      ],
    };
  },

  // Operários e dias, com nomes longos.
  (d) => {
    if (!tem(d, 'operarios', 'operarios2', 'dias')) return null;
    const novo = (n(d, 'operarios') * n(d, 'dias')) / n(d, 'operarios2');
    return {
      valor: numero(novo),
      passos: [
        {
          descricao: 'O trabalho total é o mesmo: operários × dias não muda.',
          tex: `${numero(n(d, 'operarios'))} \\cdot ${numero(n(d, 'dias'))} = ${numero(n(d, 'operarios2'))} \\cdot x`,
        },
        { descricao: 'Isolando x.', tex: `x = ${numero(novo)}\\ \\text{dias}` },
      ],
    };
  },

  // Divisão INVERSAmente proporcional.
  (d, texto) => {
    if (!tem(d, 'valor', 'p1', 'p2') || !/inversamente/i.test(texto)) return null;
    const peso1 = 1 / n(d, 'p1');
    const peso2 = 1 / n(d, 'p2');
    const parte1 = (n(d, 'valor') * peso1) / (peso1 + peso2);
    const parte2 = n(d, 'valor') - parte1;
    return {
      valor: numero(Math.max(parte1, parte2)),
      passos: [
        {
          descricao:
            'Inversamente proporcional é proporcional ao INVERSO: os pesos são 1/p1 e 1/p2.',
          tex: `\\frac{1}{${numero(n(d, 'p1'))}} : \\frac{1}{${numero(n(d, 'p2'))}}`,
        },
        {
          descricao: 'A maior parte fica com o menor peso.',
          tex: `${numero(n(d, 'valor'))} \\cdot \\frac{${numero(peso1)}}{${numero(peso1 + peso2)}} = ${numero(parte1)}`,
        },
      ],
    };
  },

  // Divisão proporcional (a do enunciado que abriu este trabalho).
  (d, texto) => {
    if (!tem(d, 'valor', 'p1', 'p2') || /inversamente/i.test(texto)) return null;
    const soma = n(d, 'p1') + n(d, 'p2');
    const parte1 = (n(d, 'valor') * n(d, 'p1')) / soma;
    const parte2 = (n(d, 'valor') * n(d, 'p2')) / soma;
    const querMaior = /MAIOR/i.test(texto);
    return {
      valor: numero(querMaior ? Math.max(parte1, parte2) : Math.min(parte1, parte2)),
      passos: [
        {
          descricao: 'Somamos as partes da razão: é em quantos pedaços o valor se divide.',
          tex: `${numero(n(d, 'p1'))} + ${numero(n(d, 'p2'))} = ${numero(soma)}`,
        },
        {
          descricao: 'Cada pedaço vale o valor dividido por essa soma.',
          tex: `\\frac{${numero(n(d, 'valor'))}}{${numero(soma)}} = ${numero(n(d, 'valor') / soma)}`,
        },
        {
          descricao: querMaior
            ? 'A MAIOR parte é a do maior número da razão.'
            : 'A MENOR parte é a do menor número da razão.',
          tex: `${numero(n(d, 'valor') / soma)} \\cdot ${numero(querMaior ? Math.max(n(d, 'p1'), n(d, 'p2')) : Math.min(n(d, 'p1'), n(d, 'p2')))} = ${numero(querMaior ? Math.max(parte1, parte2) : Math.min(parte1, parte2))}`,
        },
      ],
    };
  },

  // Receita: regra de três direta.
  (d) => {
    if (tem(d, 'pessoas1', 'pessoas2', 'farinha')) {
      const gramas = (n(d, 'farinha') / n(d, 'pessoas1')) * n(d, 'pessoas2');
      return {
        valor: numero(gramas),
        passos: [
          {
            descricao: 'Primeiro, quanto cada pessoa consome.',
            tex: `\\frac{${numero(n(d, 'farinha'))}}{${numero(n(d, 'pessoas1'))}} = ${numero(n(d, 'farinha') / n(d, 'pessoas1'))}\\ \\text{g}`,
          },
          {
            descricao: 'Depois, multiplicamos pelas pessoas pedidas.',
            tex: `${numero(n(d, 'farinha') / n(d, 'pessoas1'))} \\cdot ${numero(n(d, 'pessoas2'))} = ${numero(gramas)}\\ \\text{g}`,
          },
        ],
      };
    }
    if (tem(d, 'x1', 'x2', 'x3')) {
      const gramas = (n(d, 'x2') / n(d, 'x1')) * n(d, 'x3');
      return {
        valor: numero(gramas),
        passos: [
          {
            descricao: 'Quanto cada pessoa consome.',
            tex: `\\frac{${numero(n(d, 'x2'))}}{${numero(n(d, 'x1'))}}`,
          },
          {
            descricao: 'Multiplicando pelo novo número de pessoas.',
            tex: `${numero(n(d, 'x2') / n(d, 'x1'))} \\cdot ${numero(n(d, 'x3'))} = ${numero(gramas)}`,
          },
        ],
      };
    }
    if (tem(d, 'ovos', 'xicaras', 'ovos2')) {
      const xicaras = (n(d, 'xicaras') / n(d, 'ovos')) * n(d, 'ovos2');
      return {
        valor: numero(xicaras),
        passos: [
          {
            descricao: 'A proporção é xícaras por ovo.',
            tex: `\\frac{${numero(n(d, 'xicaras'))}}{${numero(n(d, 'ovos'))}}`,
          },
          {
            descricao: 'Multiplicando pelos ovos pedidos.',
            tex: `${numero(n(d, 'xicaras') / n(d, 'ovos'))} \\cdot ${numero(n(d, 'ovos2'))} = ${numero(xicaras)}`,
          },
        ],
      };
    }
    return null;
  },

  // Consumo e velocidade média.
  (d) => {
    if (tem(d, 'km', 'litros')) {
      return {
        valor: numero(n(d, 'km') * n(d, 'litros')),
        passos: [
          {
            descricao: 'Cada litro rende os quilômetros dados.',
            tex: `${numero(n(d, 'km'))}\\ \\text{km/L} \\cdot ${numero(n(d, 'litros'))}\\ \\text{L}`,
          },
          {
            descricao: 'Multiplicando.',
            tex: `= ${numero(n(d, 'km') * n(d, 'litros'))}\\ \\text{km}`,
          },
        ],
      };
    }
    if (tem(d, 'km', 'horas')) {
      return {
        valor: numero(n(d, 'km') / n(d, 'horas')),
        passos: [
          {
            descricao: 'Velocidade média é distância dividida por tempo.',
            tex: `\\frac{${numero(n(d, 'km'))}}{${numero(n(d, 'horas'))}}`,
          },
          {
            descricao: 'Efetuando a divisão.',
            tex: `= ${numero(n(d, 'km') / n(d, 'horas'))}\\ \\text{km/h}`,
          },
        ],
      };
    }
    return null;
  },

  // Escalas de mapa e de planta.
  (d) => {
    if (tem(d, 'escala', 'cm')) {
      const km = (n(d, 'cm') * n(d, 'escala')) / 100000;
      return {
        valor: numero(km),
        passos: [
          {
            descricao: 'Cada centímetro do mapa vale a escala em centímetros reais.',
            tex: `${numero(n(d, 'cm'))}\\ \\text{cm} \\cdot ${numero(n(d, 'escala'))} = ${numero(n(d, 'cm') * n(d, 'escala'))}\\ \\text{cm}`,
          },
          {
            descricao: 'Convertendo para quilômetros (1 km = 100 000 cm).',
            tex: `\\frac{${numero(n(d, 'cm') * n(d, 'escala'))}}{100000} = ${numero(km)}\\ \\text{km}`,
          },
        ],
      };
    }
    if (tem(d, 'desenhado')) {
      const cm = n(d, 'desenhado') * 200;
      return {
        valor: numero(cm),
        passos: [
          {
            descricao: 'Escala 1:200 quer dizer que cada centímetro do desenho vale 200 cm reais.',
            tex: `${numero(n(d, 'desenhado'))} \\cdot 200`,
          },
          {
            descricao: 'Multiplicando, temos a medida real em centímetros.',
            tex: `= ${numero(cm)}\\ \\text{cm}`,
          },
        ],
      };
    }
    return null;
  },

  // Regra de três composta: máquinas e horas.
  (d) => {
    if (tem(d, 'maquinas', 'pecas', 'horas', 'maquinas2', 'horas2')) {
      const pecas =
        n(d, 'pecas') * (n(d, 'maquinas2') / n(d, 'maquinas')) * (n(d, 'horas2') / n(d, 'horas'));
      return {
        valor: numero(pecas),
        passos: [
          {
            descricao: 'Produção por máquina e por hora.',
            tex: `\\frac{${numero(n(d, 'pecas'))}}{${numero(n(d, 'maquinas'))} \\cdot ${numero(n(d, 'horas'))}}`,
          },
          {
            descricao: 'Multiplicando pelas máquinas e horas novas.',
            tex: `${numero(n(d, 'pecas') / (n(d, 'maquinas') * n(d, 'horas')))} \\cdot ${numero(n(d, 'maquinas2'))} \\cdot ${numero(n(d, 'horas2'))} = ${numero(pecas)}`,
          },
        ],
      };
    }
    if (tem(d, 'garrafas', 'minutos', 'maquinas', 'horas')) {
      const garrafas =
        (n(d, 'garrafas') / n(d, 'minutos')) * n(d, 'maquinas') * (n(d, 'horas') * 60);
      return {
        valor: numero(garrafas),
        passos: [
          {
            descricao: 'Quanto UMA máquina enche por minuto.',
            tex: `\\frac{${numero(n(d, 'garrafas'))}}{${numero(n(d, 'minutos'))}} = ${numero(n(d, 'garrafas') / n(d, 'minutos'))}\\ \\text{garrafas/min}`,
          },
          {
            descricao: 'As horas viram minutos: 1 h = 60 min.',
            tex: `${numero(n(d, 'horas'))}\\ \\text{h} = ${numero(n(d, 'horas') * 60)}\\ \\text{min}`,
          },
          {
            descricao: 'Multiplicando pelas máquinas e pelos minutos.',
            tex: `${numero(n(d, 'garrafas') / n(d, 'minutos'))} \\cdot ${numero(n(d, 'maquinas'))} \\cdot ${numero(n(d, 'horas') * 60)} = ${numero(garrafas)}`,
          },
        ],
      };
    }
    return null;
  },
];

/* ─────────────────── operações fundamentais ─────────────────── */

const OPERACOES: readonly Resolvedor[] = [
  // Tinha x1, ganhou/perdeu x2, com o sinal em `acao`.
  (d) => {
    if (!tem(d, 'x1', 'x2', 'acao')) return null;
    const a = n(d, 'x1');
    const b = n(d, 'x2');
    const operacao = d['acao'];
    const conta =
      operacao === '-' ? a - b : operacao === '*' ? a * b : operacao === '/' ? a / b : a + b;
    const sinalTex =
      operacao === '-' ? '-' : operacao === '*' ? '\\cdot' : operacao === '/' ? '\\div' : '+';
    const verbo =
      operacao === '-'
        ? 'subtraímos'
        : operacao === '*'
          ? 'multiplicamos'
          : operacao === '/'
            ? 'dividimos'
            : 'somamos';

    return {
      valor: numero(conta),
      passos: [
        {
          descricao: `O sinal da operação é "${operacao}", então ${verbo}.`,
          tex: `${numero(a)} ${sinalTex} ${numero(b)}`,
        },
        { descricao: 'Efetuando a conta.', tex: `= ${numero(conta)}` },
      ],
    };
  },

  // Ônibus com paradas.
  (d) => {
    if (!tem(d, 'saida', 'desceram1', 'desceram2', 'subiram')) return null;
    const dentro = n(d, 'saida') - n(d, 'desceram1') - n(d, 'desceram2') + n(d, 'subiram');
    return {
      valor: numero(dentro),
      passos: [
        {
          descricao: 'Saíram os que desceram nas duas paradas e entraram os que subiram.',
          tex: `${numero(n(d, 'saida'))} - ${numero(n(d, 'desceram1'))} - ${numero(n(d, 'desceram2'))} + ${numero(n(d, 'subiram'))}`,
        },
        { descricao: 'Efetuando na ordem em que se lê.', tex: `= ${numero(dentro)}` },
      ],
    };
  },

  // Caixas de livros com doação.
  (d) => {
    if (!tem(d, 'caixas', 'porCaixa', 'doados')) return null;
    const total = n(d, 'caixas') * n(d, 'porCaixa');
    return {
      valor: numero(total - n(d, 'doados')),
      passos: [
        {
          descricao: 'Primeiro, quantos livros vieram: caixas × livros por caixa.',
          tex: `${numero(n(d, 'caixas'))} \\cdot ${numero(n(d, 'porCaixa'))} = ${numero(total)}`,
        },
        {
          descricao: 'Depois, tiramos os doados.',
          tex: `${numero(total)} - ${numero(n(d, 'doados'))} = ${numero(total - n(d, 'doados'))}`,
        },
      ],
    };
  },
];

/* ─────────────────────────── geometria ─────────────────────────── */

const AREAS: readonly Resolvedor[] = [
  // Base e altura: retângulo, triângulo ou paralelogramo — o texto diz qual.
  (d, texto) => {
    if (!exatamente(d, 'base', 'altura')) return null;

    const base = n(d, 'base');
    const altura = n(d, 'altura');
    const triangulo = /triângulo|triangular/i.test(texto);
    const paralelogramo = /paralelogramo/i.test(texto);
    const area = triangulo ? (base * altura) / 2 : base * altura;

    return {
      valor: numero(area),
      passos: [
        {
          descricao: triangulo
            ? 'A área do triângulo é base vezes altura dividido por dois.'
            : paralelogramo
              ? 'A área do paralelogramo é base vezes altura.'
              : 'A área do retângulo é base vezes altura.',
          tex: `${numero(base)} \\cdot ${numero(altura)} = ${numero(base * altura)}`,
        },
        ...(triangulo
          ? [
              {
                descricao: 'O triângulo é metade do retângulo de mesma base e altura.',
                tex: `\\frac{${numero(base * altura)}}{2} = ${numero(area)}`,
              },
            ]
          : [
              {
                descricao: 'Não há metade a tirar: o paralelogramo já é o retângulo inteiro.',
                tex: `= ${numero(area)}`,
              },
            ]),
      ],
    };
  },

  // Quadrado.
  (d, texto) => {
    if (!exatamente(d, 'a') || !/quadrad/i.test(texto)) return null;
    const area = n(d, 'a') ** 2;
    return {
      valor: numero(area),
      passos: [
        {
          descricao: 'No quadrado, base e altura são o mesmo lado.',
          tex: `${numero(n(d, 'a'))} \\cdot ${numero(n(d, 'a'))}`,
        },
        { descricao: 'Multiplicando.', tex: `= ${numero(area)}` },
      ],
    };
  },

  // Losango: metade do produto das diagonais.
  (d) => {
    if (!exatamente(d, 'd1', 'd2')) return null;
    const area = (n(d, 'd1') * n(d, 'd2')) / 2;
    return {
      valor: numero(area),
      passos: [
        {
          descricao: 'A área do losango é metade do produto das diagonais.',
          tex: `\\frac{${numero(n(d, 'd1'))} \\cdot ${numero(n(d, 'd2'))}}{2}`,
        },
        { descricao: 'Efetuando.', tex: `= ${numero(area)}` },
      ],
    };
  },

  // Trapézio (área).
  (d) => {
    if (!exatamente(d, 'baseMaior', 'baseMenor', 'altura')) return null;
    const soma = n(d, 'baseMaior') + n(d, 'baseMenor');
    const area = (soma * n(d, 'altura')) / 2;
    return {
      valor: numero(area),
      passos: [
        {
          descricao: 'Somamos as bases: é o lado do retângulo equivalente.',
          tex: `${numero(n(d, 'baseMaior'))} + ${numero(n(d, 'baseMenor'))} = ${numero(soma)}`,
        },
        {
          descricao: 'A área é a média das bases vezes a altura.',
          tex: `\\frac{${numero(soma)}}{2} \\cdot ${numero(n(d, 'altura'))} = ${numero(area)}`,
        },
      ],
    };
  },

  // Trapézio do qual se pede a ALTURA.
  (d) => {
    if (!exatamente(d, 'B', 'b', 'area')) return null;
    const altura = (2 * n(d, 'area')) / (n(d, 'B') + n(d, 'b'));
    return {
      valor: numero(altura),
      passos: [
        {
          descricao: 'A área do trapézio é a média das bases vezes a altura.',
          tex: `${numero(n(d, 'area'))} = \\frac{${numero(n(d, 'B'))} + ${numero(n(d, 'b'))}}{2} \\cdot h`,
        },
        {
          descricao: 'Isolando a altura.',
          tex: `h = \\frac{2 \\cdot ${numero(n(d, 'area'))}}{${numero(n(d, 'B'))} + ${numero(n(d, 'b'))}} = ${numero(altura)}`,
        },
      ],
    };
  },

  // Triângulo do qual se pede a ALTURA.
  (d) => {
    if (!exatamente(d, 'area', 'base')) return null;
    const altura = (2 * n(d, 'area')) / n(d, 'base');
    return {
      valor: numero(altura),
      passos: [
        {
          descricao: 'A área do triângulo é base vezes altura dividido por dois.',
          tex: `${numero(n(d, 'area'))} = \\frac{${numero(n(d, 'base'))} \\cdot h}{2}`,
        },
        {
          descricao: 'Isolando a altura.',
          tex: `h = \\frac{2 \\cdot ${numero(n(d, 'area'))}}{${numero(n(d, 'base'))}} = ${numero(altura)}`,
        },
      ],
    };
  },
];

const ANGULOS: readonly Resolvedor[] = [
  // Dois ângulos do triângulo: terceiro interno, ou externo, ou proporcionais.
  (d, texto) => {
    if (!exatamente(d, 'a', 'b')) return null;

    const externo = /externo/i.test(texto);
    const terceiro = 180 - n(d, 'a') - n(d, 'b');
    const resposta = externo ? n(d, 'a') + n(d, 'b') : terceiro;

    return {
      valor: numero(resposta),
      passos: externo
        ? [
            {
              descricao: 'O ângulo externo é o suplemento do interno do mesmo vértice.',
              tex: `180 - (180 - ${numero(n(d, 'a'))} - ${numero(n(d, 'b'))})`,
            },
            {
              descricao: 'Que é a soma dos dois ângulos internos opostos.',
              tex: `${numero(n(d, 'a'))} + ${numero(n(d, 'b'))} = ${numero(resposta)}`,
            },
          ]
        : [
            {
              descricao: 'A soma dos ângulos internos de um triângulo é 180°.',
              tex: `180 - ${numero(n(d, 'a'))} - ${numero(n(d, 'b'))}`,
            },
            { descricao: 'Efetuando.', tex: `= ${numero(terceiro)}` },
          ],
    };
  },

  // Ângulo da base de um isósceles.
  (d) => {
    if (!exatamente(d, 'vertice')) return null;
    const base = (180 - n(d, 'vertice')) / 2;
    return {
      valor: numero(base),
      passos: [
        {
          descricao: 'Os dois ângulos da base são iguais; sobram 180° menos o vértice.',
          tex: `180 - ${numero(n(d, 'vertice'))} = ${numero(180 - n(d, 'vertice'))}`,
        },
        {
          descricao: 'Dividindo pelos dois ângulos da base.',
          tex: `\\frac{${numero(180 - n(d, 'vertice'))}}{2} = ${numero(base)}`,
        },
      ],
    };
  },

  // Ângulo interno de polígono regular.
  (d, texto) => {
    if (!exatamente(d, 'lados') || /prisma|pirâmide/i.test(texto)) return null;
    const soma = (n(d, 'lados') - 2) * 180;
    const interno = soma / n(d, 'lados');
    return {
      valor: numero(interno),
      passos: [
        {
          descricao: 'A soma dos ângulos internos é (n − 2) · 180°.',
          tex: `(${numero(n(d, 'lados'))} - 2) \\cdot 180 = ${numero(soma)}`,
        },
        {
          descricao: 'Num polígono regular, basta dividir pelo número de lados.',
          tex: `\\frac{${numero(soma)}}{${numero(n(d, 'lados'))}} = ${numero(interno)}`,
        },
      ],
    };
  },

  // Retas paralelas cortadas por uma transversal: colaterais internos.
  (d, texto) => {
    if (!exatamente(d, 'angulo') || !/transversal|paralelas/i.test(texto)) return null;
    const colateral = 180 - n(d, 'angulo');
    return {
      valor: numero(colateral),
      passos: [
        {
          descricao: 'Ângulos colaterais internos são suplementares: somam 180°.',
          tex: `180 - ${numero(n(d, 'angulo'))}`,
        },
        { descricao: 'Efetuando a subtração.', tex: `= ${numero(colateral)}` },
      ],
    };
  },

  // Número de lados a partir do ângulo interno.
  (d) => {
    if (!exatamente(d, 'angulo')) return null;
    const externo = 180 - n(d, 'angulo');
    const lados = 360 / externo;
    return {
      valor: numero(lados),
      passos: [
        {
          descricao: 'O ângulo EXTERNO é o suplemento do interno.',
          tex: `180 - ${numero(n(d, 'angulo'))} = ${numero(externo)}`,
        },
        {
          descricao: 'Como os externos somam 360°, basta dividir.',
          tex: `\\frac{360}{${numero(externo)}} = ${numero(lados)}`,
        },
      ],
    };
  },
];

const POLIEDROS: readonly Resolvedor[] = [
  // Polígono da base: arestas, vértices ou faces de um prisma; arestas ou
  // faces de uma pirâmide. O texto diz qual, e o que se pede.
  (d, texto) => {
    if (!exatamente(d, 'lados')) return null;

    const lados = n(d, 'lados');
    const piramide = /pirâmide/i.test(texto);

    if (piramide) {
      const arestas = 2 * lados;
      const faces = lados + 1;
      const vertices = lados + 1;
      const pedeArestas = /arestas/i.test(texto);

      return {
        valor: numero(pedeArestas ? arestas : faces),
        passos: [
          {
            descricao: 'A pirâmide tem as arestas da base e mais uma subindo de cada vértice.',
            tex: `2 \\cdot ${numero(lados)} = ${numero(arestas)}\ \\text{arestas}`,
          },
          {
            descricao:
              'As faces são a base mais um triângulo por lado, e os vértices são os da base mais o ápice.',
            tex: `${numero(lados)} + 1 = ${numero(faces)}\ \\text{faces}, \\quad ${numero(vertices)}\ \\text{vértices}`,
          },
        ],
      };
    }

    const faces = lados + 2;
    const vertices = 2 * lados;
    const arestas = 3 * lados;
    return {
      valor: numero(/vértice/i.test(texto) ? vertices : /aresta/i.test(texto) ? arestas : faces),
      passos: [
        {
          descricao: 'O prisma tem duas bases e uma face lateral por lado do polígono.',
          tex: `${numero(lados)} + 2 = ${numero(faces)}\ \\text{faces}`,
        },
        {
          descricao:
            'Os vértices são duas cópias dos da base, e cada vértice dá três arestas contadas duas vezes.',
          tex: `${numero(vertices)}\ \\text{vértices}, \\quad 3 \\cdot ${numero(lados)} = ${numero(arestas)}\ \\text{arestas}`,
        },
      ],
    };
  },

  // Euler: F + V = A + 2, nas três direções.
  (d) => {
    if (!exatamente(d, 'faces', 'vertices')) return null;
    const arestas = n(d, 'faces') + n(d, 'vertices') - 2;
    return {
      valor: numero(arestas),
      passos: [
        {
          descricao: 'A relação de Euler é F + V = A + 2.',
          tex: `${numero(n(d, 'faces'))} + ${numero(n(d, 'vertices'))} = A + 2`,
        },
        {
          descricao: 'Isolando A.',
          tex: `A = ${numero(n(d, 'faces'))} + ${numero(n(d, 'vertices'))} - 2 = ${numero(arestas)}`,
        },
      ],
    };
  },

  (d) => {
    if (!exatamente(d, 'faces', 'arestas')) return null;
    const vertices = n(d, 'arestas') - n(d, 'faces') + 2;
    return {
      valor: numero(vertices),
      passos: [
        {
          descricao: 'A relação de Euler é F + V = A + 2.',
          tex: `${numero(n(d, 'faces'))} + V = ${numero(n(d, 'arestas'))} + 2`,
        },
        {
          descricao: 'Isolando V.',
          tex: `V = ${numero(n(d, 'arestas'))} - ${numero(n(d, 'faces'))} + 2 = ${numero(vertices)}`,
        },
      ],
    };
  },

  (d) => {
    if (!exatamente(d, 'vertices', 'arestas')) return null;
    const faces = n(d, 'arestas') - n(d, 'vertices') + 2;
    return {
      valor: numero(faces),
      passos: [
        {
          descricao: 'A relação de Euler é F + V = A + 2.',
          tex: `F + ${numero(n(d, 'vertices'))} = ${numero(n(d, 'arestas'))} + 2`,
        },
        {
          descricao: 'Isolando F.',
          tex: `F = ${numero(n(d, 'arestas'))} - ${numero(n(d, 'vertices'))} + 2 = ${numero(faces)}`,
        },
      ],
    };
  },
];

const SOLIDOS: readonly Resolvedor[] = [
  (d) => {
    if (!exatamente(d, 'a', 'b', 'c')) return null;
    const volume = n(d, 'a') * n(d, 'b') * n(d, 'c');
    return {
      valor: numero(volume),
      passos: [
        {
          descricao: 'Primeiro a área da base: comprimento vezes largura.',
          tex: `${numero(n(d, 'a'))} \\cdot ${numero(n(d, 'b'))} = ${numero(n(d, 'a') * n(d, 'b'))}`,
        },
        {
          descricao: 'Depois, a área da base vezes a altura.',
          tex: `${numero(n(d, 'a') * n(d, 'b'))} \\cdot ${numero(n(d, 'c'))} = ${numero(volume)}`,
        },
      ],
    };
  },

  (d) => {
    if (!exatamente(d, 'aresta')) return null;
    const volume = n(d, 'aresta') ** 3;
    return {
      valor: numero(volume),
      passos: [
        {
          descricao: 'O volume do cubo é a aresta ao cubo.',
          tex: `${numero(n(d, 'aresta'))}^3`,
        },
        { descricao: 'Efetuando.', tex: `= ${numero(volume)}` },
      ],
    };
  },

  // Raio e altura: cilindro ou cone — o texto diz qual.
  (d, texto) => {
    if (!exatamente(d, 'raio', 'altura')) return null;

    const raio = n(d, 'raio');
    const altura = n(d, 'altura');
    const cone = /cone/i.test(texto);

    const areaBase = Math.PI * raio * raio;
    const volume = cone ? (areaBase * altura) / 3 : areaBase * altura;

    return {
      valor: duas(volume),
      passos: [
        {
          descricao: 'A base é um círculo: a área dela é πr².',
          tex: `\\pi \\cdot ${numero(raio)}^2 = ${numero(areaBase)}`,
        },
        {
          descricao: cone
            ? 'O cone é um terço do cilindro de mesma base e altura.'
            : 'No cilindro, a área da base se repete em cada fatia: vezes a altura.',
          tex: cone
            ? `\\frac{${numero(areaBase)} \\cdot ${numero(altura)}}{3} = ${duas(volume)}`
            : `${numero(areaBase)} \\cdot ${numero(altura)} = ${duas(volume)}`,
        },
      ],
    };
  },
];

/* ─────────────────────────── o registro ─────────────────────────── */

/**
 * Os resolvedores por tópico.
 *
 * A ordem importa: dentro de um tópico, o primeiro que reconhece a forma
 * responde. Por isso as formas mais específicas vêm antes das genéricas, e as
 * que compartilham chaves se separam pelo texto da pergunta.
 */
const POR_TOPICO: Readonly<Record<string, readonly Resolvedor[]>> = {
  'razao-proporcao': RAZAO,
  'operacoes-fundamentais': OPERACOES,
  'areas-de-figuras-planas': AREAS,
  'angulos-e-triangulos': ANGULOS,
  poliedros: POLIEDROS,
  'solidos-e-volumes': SOLIDOS,
};

/**
 * Os passos de uma entrada do banco, ou `null` quando a forma não é conhecida.
 *
 * `texto` é o enunciado já vestido com os números: algumas formas só se
 * distinguem por uma palavra dele — a divisão proporcional e a inversa usam as
 * mesmas chaves.
 */
export function passosDoBanco(
  topico: string,
  dados: DadosDoBanco,
  texto: string,
): ResolucaoDoBanco | null {
  /*
   * Primeiro as regras declarativas: elas são a fórmula escrita em LaTeX e a
   * substituição dos valores, que é o que o aluno precisa ver. Os resolvedores
   * à mão ficam para as formas em que a conta tem etapas próprias.
   */
  const pelasRegras = resolverPorRegras(REGRAS_POR_TOPICO[topico], texto);
  if (pelasRegras !== null) {
    return pelasRegras;
  }

  for (const resolvedor of POR_TOPICO[topico] ?? []) {
    const resolucao = resolvedor(dados, texto);
    if (resolucao !== null) {
      return resolucao;
    }
  }

  return null;
}

/** O tópico já tem resolvedor? Serve ao guarda, para medir a cobertura. */
export function temResolvedor(topico: string): boolean {
  return POR_TOPICO[topico] !== undefined;
}
