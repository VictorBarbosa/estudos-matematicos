import type { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';
import type { DadoDoProblema, PedidoDeProblema } from '@core/problemas/prompt/montar-prompt';
import type { ValorDaLacuna } from '@core/problemas/vestir/vestir-enunciado';

/**
 * A declaração que se escreve sozinha, para os tópicos que não têm uma.
 *
 * ## O problema que isto resolve
 *
 * Havia seis declarações escritas à mão, e a LLM só era chamada nesses seis
 * tópicos. Nos outros 124 — que são a maior parte da trilha — nenhuma
 * requisição saía, e quem estudava concluía, com razão, que o recurso não
 * existia.
 *
 * Escrever 124 declarações à mão era a alternativa, e ela é a certa quando o
 * tópico vale o esforço. Mas a declaração escrita existe para uma coisa só:
 * dizer à LLM **qual conta** a história tem de significar. E o enunciado do
 * exercício já diz isso — ele é a pergunta, com os números no lugar.
 *
 * Então a derivação é a mais conservadora possível: **o próprio enunciado,
 * com cada número trocado por uma lacuna**. A LLM não escreve nada de novo,
 * ela reescreve a mesma pergunta numa situação concreta. A conta não pode
 * mudar, porque a conta é o texto de origem.
 *
 * ## O que fica de fora, e por que
 *
 * Enunciado sem número nenhum — «Calcule e escreva o resultado na forma mais
 * simples», de frações — não vira história: não há dado para virar lacuna, e o
 * que sobra é uma frase que manda fazer uma conta. `null` ali é a resposta
 * certa, e o tópico cai no enunciado de sempre, como antes.
 *
 * Números dentro de parênteses também ficam de fora: «(em cm³, 2 casas
 * decimais)» não é dado do problema, é contrato de resposta. Virar lacuna
 * faria a história prometer duas casas decimais como se fosse uma quantidade.
 */

/**
 * Os numerais que são enredo, e não dado.
 *
 * **A terceira causa do «a tela não muda», e a mais silenciosa.** Medido com o
 * modelo de verdade: o enunciado de ângulos rendia oito histórias, e as oito
 * eram recusadas no portão por `numero-escrito` — todas começavam com «dois
 * triângulos» ou «dois pedaços». A história de uma congruência É sobre duas
 * figuras, e a regra que existe para impedir número fora do sorteio barrava
 * justamente a palavra que descreve o enredo.
 *
 * O conjunto é pequeno e filtrado: só entra o numeral cujo valor NÃO está
 * entre os dados sorteados. Se `{0}` vale 2, «dois» pode ser a própria
 * resposta, e aí ele não é liberado.
 */
const ENREDO: readonly (readonly [string, number])[] = [
  ['dois', 2],
  ['duas', 2],
  ['três', 3],
  ['tres', 3],
  ['quatro', 4],
  ['deux', 2],
  ['trois', 3],
  ['quatre', 4],
  ['two', 2],
  ['three', 3],
  ['four', 4],
];

/** Os numerais de enredo que este exercício pode usar, dado o que ele sorteou. */
function enredoPermitido(valores: readonly number[]): readonly string[] {
  return ENREDO.filter(([, valor]) => !valores.includes(valor)).map(([palavra]) => palavra);
}

/** Um número com separador de milhar ou decimal, ou um inteiro. */
const NUMERO = /-?\d+(?:[.,]\d+)*/g;

/** Um trecho entre parênteses: contrato de resposta, não dado. */
const ENTRE_PARENTESES = /\([^)]*\)/g;

/**
 * Uma grandeza de verdade: número com unidade, moeda, tempo ou porcentagem.
 *
 * **A barreira que separa «dá para contar uma história» de «não dá».** Foi
 * medida, e o motivo é concreto: reescrever «um poliedro convexo tem 9 arestas
 * e 5 faces» produziu, em três tentativas, um «cubo», uma «caixa de madeira» e
 * um «avião de papel» — e nenhum deles tem 9 arestas. O número não corresponde
 * a objeto nenhum, então qualquer cenário concreto é falso, e o aluno que
 * conhece o assunto percebe. O portão não pega isso: ele confere formato, não
 * sentido.
 *
 * Onde há unidade, ao contrário, a história é verdadeira por construção: 4 cm,
 * 9 litros, R$ 45 e 17 minutos cabem em qualquer situação que se invente, e o
 * que muda é só quem mede e por quê. É por isso que a barreira é a unidade, e
 * não o assunto.
 */
const GRANDEZA = new RegExp(
  String.raw`\d\s*(?:cm|mm|km|dm|m²|m³|kg|mg|ml|mL|litros?|mililitros?|gramas?|quilogramas?|` +
    String.raw`horas?|minutos?|dias?|anos?|meses|graus?|newtons?|joules?|volts?|watts?|%|°)` +
    /*
     * O metro sozinho, e ele faltava.
     *
     * Foi o erro mais caro desta barreira: sem `m`, todo enunciado de
     * geometria em metros — «uma torre mede 24 m», «o poste projeta 2 m» — era
     * lido como «sem unidade» e o tópico nem tentava. Geometria é justamente
     * onde o metro mais aparece, e a cobertura caía de 83% para 100% de nada.
     *
     * `\b` no fim para não casar o `m` de «m²« nem de uma palavra; e o espaço
     * é exigido, senão «5min» e «3metros» ainda passariam pela colada.
     */
    String.raw`|\d\s*m\b` +
    String.raw`|R\$|\$|reais`,
  'i',
);

/**
 * A unidade citada no contrato, sem número ao lado.
 *
 * «Qual é a soma dos ângulos internos de um octógono? (em graus)» não tem
 * dígito antes de «graus», e a grandeza está só no parêntese — que é onde o
 * site escreve a unidade da RESPOSTA. Sem esta busca, todo o tópico de ângulos
 * internos de polígono ficava de fora por «não ter unidade», quando o exercício
 * é de graus do começo ao fim.
 *
 * Só vale depois de «em»/«en»/«in», que é a forma do contrato: «(em graus)»,
 * «(en degrés)». Um «graus» solto no meio de uma frase não serve de prova.
 */
const UNIDADE_NO_CONTRATO =
  /\(\s*(?:em|en|in)\s+[^)]*?(?:graus|degrés|degrees|metros?|metres?|centímetros?|cm|mm|km|m²|m³|kg|gramas?|litros?|l\b|segundos?|minutos?|horas?|newtons?)/i;

/** A unidade colada ao número, sem exigir espaço: «4cm» também vale. */
const GRANDEZA_COLADA = new RegExp(String.raw`\d(?:cm|mm|km|kg|mg|ml|mL|m²|m³)`, 'i');

/**
 * A álgebra já está no enunciado, à vista?
 *
 * **A segunda barreira, e a que faltava.** O enunciado `AB = 4x + 3 cm e
 * DE = 5x − 4 cm` passava pela barreira de unidade — tem «cm» — e virava o
 * molde `AB = {0}x + {1} cm e DE = {2}x − {3} cm`. A história saía então com a
 * equação escrita dentro dela: *«dois pedaços de fita mediram AB = {0}x + {1} cm
 * e DE = {2}x − {3} cm»*. Isso é o enunciado de origem com roupa nova, e pior:
 * entrega ao aluno a modelagem que ele deveria montar.
 *
 * Onde a incógnita já está no texto, vestir de história não tem o que vestir —
 * o exercício É a manipulação. `null` ali é a resposta certa.
 *
 * Os padrões olham a FORMA da álgebra, e não a letra: `x` é convenção, mas
 * `n`, `t` e `k` aparecem tanto quanto. O que os separa de uma unidade é o que
 * vem depois — um operador, um expoente, um sinal de igual.
 */
const ALGEBRA = [
  // `4x +`, `5n −`, `3t =`: número colado numa letra, e um operador depois.
  // O `·` fica de fora: ele é o sinal de unidade composta (`N·s/m`), não de
  // multiplicação algébrica, e casá-lo barrava toda a cinemática de mola.
  /\d\s*[a-zA-Z]\s*[+\-−=×]/,
  /*
   * `x²`, `t³`: a letra com expoente — mas NÃO `m²`, `m/s²`, `kg/m³`.
   *
   * A distinção é a letra, não a forma: `m`, `s`, `g`, `L`, `N` são unidades
   * quando vêm com expoente, e `x`, `y`, `n`, `t` são incógnitas. Sem as duas
   * exclusões — a letra que precede (de `cm²`) e a lista de unidades — esta
   * regra barrava TODO problema de área, de aceleração e de densidade do site:
   * foram cinco tópicos perdidos por engano na primeira versão.
   */
  /(?<![a-zA-Z])(?![mgsLlWJNVAF]\s*[²³⁴])[a-zA-Z]\s*[²³⁴]/,
  // `x = 3`, `n = 12`: a incógnita isolada à esquerda de uma igualdade. Pega
  // também `R = 16 Ω` e `t = 0`, e isso é intencional: a história repetiria os
  // símbolos do circuito, e «com R = {0} ohms» não é situação, é notação.
  /\b[a-zA-Z]\s*=\s*-?\d/,
  // `f(x)`, `L(x)`: notação de função.
  /\b[a-zA-Z]\s*\(\s*[a-zA-Z]\s*\)/,
  // `sen x`, `log x`, `f(`, e não `tangente`: o separador depois do nome é o
  // que distingue a função da palavra. Sem ele, «tangente» casava com `tan`.
  /\b(?:sen|cos|tan|log|ln)(?:\s+[a-zA-Z]|\s*\()/i,
  /\bsen\s+[a-zA-Z]/i,
];

/** O enunciado tem incógnita ou notação de função? */
export function temAlgebra(enunciado: string): boolean {
  return ALGEBRA.some((padrao) => padrao.test(enunciado));
}

/**
 * O enunciado descreve uma situação que se pode reescrever?
 *
 * Exige ao menos uma grandeza com unidade. Enunciado de relação abstrata
 * («quantos vértices tem um poliedro de 9 arestas») fica de fora: a história
 * seria falsa, e um exercício falso é pior que exercício nenhum.
 */
export function admiteHistoria(enunciado: string): boolean {
  /*
   * A busca é no texto INTEIRO, parênteses inclusive.
   *
   * Antes ela era feita no texto sem parênteses, e isso descartava a unidade
   * que o próprio contrato carrega: «Qual é a soma dos ângulos internos de um
   * octógono? (em graus)» não tem grau nenhum fora dos parênteses, e a barreira
   * lia «sem unidade» — quando o exercício é justamente de graus.
   *
   * O parêntese só sai na hora de generalizar, onde «(2 casas decimais)»
   * viraria lacuna. São perguntas diferentes e mereciam buscas diferentes.
   */
  return (
    GRANDEZA.test(enunciado) ||
    GRANDEZA_COLADA.test(enunciado) ||
    UNIDADE_NO_CONTRATO.test(enunciado)
  );
}

interface Derivacao {
  readonly declaracao: ProblemaDeTexto;
  readonly valores: readonly ValorDaLacuna[];
}

/** `3,5` e `1.234` escritos como o JavaScript entende. */
function comoNumero(texto: string): number {
  const semMilhar = texto.replace(/\.(?=\d{3}\b)/g, '');
  return Number(semMilhar.replace(',', '.'));
}

/**
 * Troca cada número do enunciado por `{0}`, `{1}`, … e devolve os valores.
 *
 * Um número que aparece duas vezes ganha duas lacunas, com o mesmo valor. É o
 * caminho que evita a regra de «lacuna repetida» do portão: a história fala de
 * cada quantidade uma vez só, e o código põe o mesmo número nas duas.
 */
function generalizar(enunciado: string): {
  molde: string;
  valores: readonly number[];
} | null {
  // Os parênteses saem da conta de generalização, mas ficam no texto.
  /*
   * O marcador não pode conter dígito: `\u00000\u0000` casaria com a própria
   * expressão de número e o índice viraria lacuna — foi o defeito que este
   * teste pegou (`[4, 9, 0]` em vez de `[4, 9]`).
   */
  const protegidos: string[] = [];
  const semParenteses = enunciado.replace(ENTRE_PARENTESES, (trecho) => {
    protegidos.push(trecho);
    return '\u0000';
  });

  const valores: number[] = [];
  let indice = 0;

  const molde = semParenteses.replace(NUMERO, (achado) => {
    const numero = comoNumero(achado);

    if (!Number.isFinite(numero)) {
      return achado;
    }

    valores.push(numero);
    return `{${indice++}}`;
  });

  if (valores.length === 0) {
    return null;
  }

  // Devolve os parênteses ao lugar, sem generalizar o que está dentro deles.
  return {
    molde: molde.replace(/\u0000/g, () => protegidos.shift() ?? ''),
    valores,
  };
}

/**
 * A declaração derivada para este exercício, ou `null` quando não há o que
 * derivar.
 *
 * `topico` é o título que a tela mostra, e serve só para a LLM saber do que se
 * trata — não entra na conta.
 */
export function derivarProblema(
  enunciado: string,
  topico: string,
): Derivacao | null {
  if (!admiteHistoria(enunciado) || temAlgebra(enunciado)) {
    return null;
  }

  const generalizado = generalizar(enunciado);

  if (generalizado === null) {
    return null;
  }

  const { molde, valores } = generalizado;

  /*
   * A pergunta é a última frase do enunciado — é onde ela sempre está.
   * `split` por fim de frase simples basta: os enunciados do site têm uma ou
   * duas frases, e a última termina em «?».
   */
  const frases = molde.split(/(?<=[.?!])\s+/);
  const pergunta =
    [...frases].reverse().find((frase) => frase.includes('?')) ?? frases[frases.length - 1]!;

  const dados: readonly DadoDoProblema[] = valores.map((valor, indice) => ({
    indice,
    significado:
      `o ${indice + 1}º dado citado no enunciado, que vale ${valor} e entra na história ` +
      'na mesma ordem e na mesma grandeza',
    tipo: Number.isInteger(valor) ? 'inteiro' : 'decimal',
  }));

  return {
    valores,
    declaracao: {
      // A forma é o molde: dois exercícios com o mesmo molde compartilham fila,
      // e um molde diferente abre outra — que é o que se quer, porque a
      // história de um não serve para o outro.
      forma: `auto:${molde}`,
      pedido: {
        topico,
        oQueExercita: 'resolver exatamente o problema do enunciado de origem',
        relacao: molde,
        pergunta,
        dados,
        permitidas: enredoPermitido(valores),
        contextos: undefined,
      } satisfies Omit<PedidoDeProblema, 'quantas' | 'niveis'>,
      /*
       * A fórmula em tela some quando a história entra, pela mesma razão de
       * equação do primeiro grau: ela é a modelagem feita. É `true` aqui porque
       * na derivação a fórmula costuma ser exatamente a resposta (`x = ?`).
       */
      esconderFormula: true,
    },
  };
}
