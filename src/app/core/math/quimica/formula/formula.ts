import { ELEMENTOS, Elemento, elementoDe } from '@core/math/quimica/elementos/elementos';

/**
 * Ler uma fórmula química escrita à mão, e compará-la com a certa.
 *
 * Um campo de texto num celular não tem subscrito, e quem responde escreve
 * `CaSO4`, `Ca SO4`, `CaSO₄` ou `caso4` conforme o teclado deixa. As quatro
 * dizem a mesma coisa, e reprovar três delas seria corrigir datilografia em
 * vez de química — o mesmo princípio de `canonizarNotacao`, aplicado aqui.
 *
 * O que NÃO se perdoa é confundir elementos: `CO` é monóxido de carbono e `Co`
 * é cobalto. A leitura resolve isso lendo os símbolos da tabela, do mais longo
 * para o mais curto, e aceitando a caixa errada só quando ela não cria
 * ambiguidade — `caso4` tem uma leitura possível, `co` tem duas, e a segunda é
 * recusada em vez de ser adivinhada.
 */

/** Quantos átomos de cada elemento, na ordem em que apareceram. */
export type Composicao = ReadonlyMap<string, number>;

/** Dígitos subscritos, que a tela usa e o teclado não tem. */
const SUBSCRITOS = '₀₁₂₃₄₅₆₇₈₉';

/** Troca `₄` por `4`, para que a leitura veja só dígitos comuns. */
export function semSubscritos(texto: string): string {
  return [...texto]
    .map((caractere) => {
      const indice = SUBSCRITOS.indexOf(caractere);
      return indice === -1 ? caractere : String(indice);
    })
    .join('');
}

/** Troca `4` por `₄`, para exibir a fórmula como ela se escreve. */
export function comSubscritos(texto: string): string {
  return texto.replace(/\d/g, (digito) => SUBSCRITOS[Number(digito)]!);
}

/**
 * Os símbolos que uma sequência de letras pode formar, ignorando a caixa.
 *
 * Devolve `undefined` quando não há leitura, e a leitura quando ela é única.
 * Havendo mais de uma — `co` é `Co` ou `C`+`O` —, devolve `undefined` também:
 * adivinhar qual o aluno quis dizer seria decidir por ele num caso em que a
 * diferença é toda a química da resposta.
 */
function lerSimbolosSemCaixa(letras: string): readonly string[] | undefined {
  const leituras: string[][] = [];

  const avancar = (resto: string, acumulado: string[]): void => {
    if (leituras.length > 1) {
      return;
    }
    if (resto.length === 0) {
      leituras.push([...acumulado]);
      return;
    }

    for (const elemento of ELEMENTOS) {
      const simbolo = elemento.simbolo;
      if (resto.slice(0, simbolo.length).toLowerCase() === simbolo.toLowerCase()) {
        acumulado.push(simbolo);
        avancar(resto.slice(simbolo.length), acumulado);
        acumulado.pop();
      }
    }
  };

  avancar(letras, []);

  return leituras.length === 1 ? leituras[0] : undefined;
}

/**
 * Lê uma fórmula e devolve quantos átomos de cada elemento ela traz.
 *
 * Entende parênteses com índice — `Ca(OH)₂` são um cálcio, dois oxigênios e
 * dois hidrogênios — porque é assim que os hidróxidos e os nitratos se
 * escrevem, e exigir a forma expandida seria exigir uma conversão que o
 * exercício não está cobrando.
 *
 * Devolve `undefined` quando o texto não é uma fórmula: letra que não é
 * elemento, parêntese sem par, índice zero. Um erro assim merece «não entendi
 * a fórmula», e não uma comparação que falha por outro motivo.
 */
export function lerFormula(entrada: string): Composicao | undefined {
  const texto = semSubscritos(entrada).replace(/[\s·.*]/g, '');

  if (texto.length === 0) {
    return undefined;
  }

  const composicao = new Map<string, number>();
  let posicao = 0;

  const somar = (simbolo: string, quantidade: number): void => {
    composicao.set(simbolo, (composicao.get(simbolo) ?? 0) + quantidade);
  };

  const lerIndice = (): number => {
    const digitos = /^\d+/.exec(texto.slice(posicao))?.[0];
    if (digitos === undefined) {
      return 1;
    }
    posicao += digitos.length;
    return Number(digitos);
  };

  /** Lê até o fim ou até um parêntese que fecha, somando em `destino`. */
  const lerGrupo = (destino: (simbolo: string, quantidade: number) => void): boolean => {
    while (posicao < texto.length) {
      const atual = texto[posicao]!;

      if (atual === ')') {
        return true;
      }

      if (atual === '(') {
        posicao += 1;
        const interno = new Map<string, number>();
        const fechou = lerGrupo((simbolo, quantidade) => {
          interno.set(simbolo, (interno.get(simbolo) ?? 0) + quantidade);
        });

        if (!fechou || texto[posicao] !== ')') {
          return false;
        }
        posicao += 1;

        const vezes = lerIndice();
        if (vezes < 1) {
          return false;
        }
        for (const [simbolo, quantidade] of interno) {
          destino(simbolo, quantidade * vezes);
        }
        continue;
      }

      const letras = /^[A-Za-z]+/.exec(texto.slice(posicao))?.[0];
      if (letras === undefined) {
        return false;
      }

      // Primeiro a leitura com a caixa certa, símbolo a símbolo; só se ela
      // falhar é que se tenta a leitura sem caixa, que é mais frouxa.
      const simbolosComCaixa = lerComCaixa(letras);
      const simbolos = simbolosComCaixa ?? lerSimbolosSemCaixa(letras);

      if (simbolos === undefined) {
        return false;
      }

      posicao += letras.length;

      simbolos.forEach((simbolo, indice) => {
        // O índice escrito vale só para o ÚLTIMO símbolo do bloco de letras:
        // em `CaSO4`, o 4 é do oxigênio.
        const quantidade = indice === simbolos.length - 1 ? lerIndice() : 1;
        if (quantidade < 1) {
          throw new RangeError('índice menor que um');
        }
        destino(simbolo, quantidade);
      });
    }

    return true;
  };

  try {
    const terminou = lerGrupo(somar);
    if (!terminou || posicao !== texto.length) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  return composicao.size === 0 ? undefined : composicao;
}

/** A leitura estrita: cada símbolo com a caixa que a tabela usa. */
function lerComCaixa(letras: string): readonly string[] | undefined {
  const simbolos: string[] = [];
  let resto = letras;

  while (resto.length > 0) {
    const doisPrimeiros = resto.slice(0, 2);
    const simbolo =
      doisPrimeiros.length === 2 && elementoDe(doisPrimeiros) !== undefined
        ? doisPrimeiros
        : elementoDe(resto.slice(0, 1)) !== undefined
          ? resto.slice(0, 1)
          : undefined;

    if (simbolo === undefined) {
      return undefined;
    }

    simbolos.push(simbolo);
    resto = resto.slice(simbolo.length);
  }

  return simbolos;
}

/**
 * A fórmula escrita de volta, na ordem em que os elementos apareceram.
 *
 * Serve para exibir o gabarito e para comparar: `Ca(OH)2` e `CaO2H2` chegam
 * ambas a `CaO2H2`, que é o que elas de fato dizem.
 */
export function canonizarFormula(entrada: string): string | undefined {
  const composicao = lerFormula(entrada);

  if (composicao === undefined) {
    return undefined;
  }

  return [...composicao]
    .map(([simbolo, quantidade]) => (quantidade === 1 ? simbolo : `${simbolo}${quantidade}`))
    .join('');
}

/**
 * Duas fórmulas dizem o mesmo composto?
 *
 * A comparação é por composição, e não por escrita: a ordem dos elementos é
 * convenção, e quem escreve `O2Ca` depois de deduzir a fórmula empírica não
 * errou a química. O que a comparação não perdoa é quantidade diferente, que
 * é outro composto.
 *
 * Isótopos e estrutura ficam de fora: `C₂H₆O` é etanol e também éter
 * dimetílico, e distinguir os dois não é o que uma fórmula molecular faz.
 */
export function mesmaFormula(primeira: string, segunda: string): boolean {
  const a = lerFormula(primeira);
  const b = lerFormula(segunda);

  if (a === undefined || b === undefined || a.size !== b.size) {
    return false;
  }

  for (const [simbolo, quantidade] of a) {
    if (b.get(simbolo) !== quantidade) {
      return false;
    }
  }

  return true;
}

/**
 * A massa molar de uma fórmula escrita, somando as massas da tabela.
 *
 * Devolve `undefined` para fórmula ilegível — quem chama precisa saber a
 * diferença entre «pesa zero» e «não entendi».
 */
export function massaMolarDaFormula(entrada: string): number | undefined {
  const composicao = lerFormula(entrada);

  if (composicao === undefined) {
    return undefined;
  }

  let total = 0;

  for (const [simbolo, quantidade] of composicao) {
    const elemento = elementoDe(simbolo);
    if (elemento === undefined) {
      return undefined;
    }
    total += elemento.massaAtomica * quantidade;
  }

  return total;
}

/** Os elementos da fórmula, com a massa de cada um, na ordem escrita. */
export function partesDaFormula(
  entrada: string,
): readonly { elemento: Elemento; quantidade: number }[] | undefined {
  const composicao = lerFormula(entrada);

  if (composicao === undefined) {
    return undefined;
  }

  const partes: { elemento: Elemento; quantidade: number }[] = [];

  for (const [simbolo, quantidade] of composicao) {
    const elemento = elementoDe(simbolo);
    if (elemento === undefined) {
      return undefined;
    }
    partes.push({ elemento, quantidade });
  }

  return partes;
}

/**
 * A fórmula em LaTeX, com os índices subscritos de verdade.
 *
 * Os parênteses do texto original se perdem — o que entra é a composição —, e
 * isso é aceitável para exibir um gabarito; para mostrar `Ca(OH)₂` como
 * `Ca(OH)₂`, escreva o TeX à mão no enunciado.
 */
export function formulaParaTex(entrada: string): string | undefined {
  const composicao = lerFormula(entrada);

  if (composicao === undefined) {
    return undefined;
  }

  return [...composicao]
    .map(([simbolo, quantidade]) =>
      quantidade === 1 ? `\\text{${simbolo}}` : `\\text{${simbolo}}_{${quantidade}}`,
    )
    .join('');
}
