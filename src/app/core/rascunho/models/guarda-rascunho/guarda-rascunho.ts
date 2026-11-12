import { Arvore, Operador, linhaCoerente } from '../peca/peca';
import { LIMITE_DE_FRACOES } from '../montagem/montagem';
import { Linhas, linhasDe } from '../linhas/linhas';

/**
 * O rascunho guardado, e a leitura desconfiada de volta.
 *
 * Aqui o projeto diverge da folha de rascunho à mão livre, e de propósito. A
 * `FolhaService` guarda os traços **só em memória**, porque um rascunho à mão
 * são milhares de pontos e o `localStorage` cresceria sem teto. Uma árvore de
 * peças, ao contrário, são bytes, e serializa em JSON sem esforço — é a forma
 * em que ela já vive.
 *
 * E o cenário manda guardar: a ferramenta existe para o ônibus e o avião, e o
 * Safari do iOS descarta aba em segundo plano. Perder oito linhas de conta para
 * o gerenciador de memória é o pior resultado possível.
 */

/** O rascunho de um tópico, como vai para o disco. */
export interface RascunhoDeTopico {
  readonly topico: string;
  readonly linhas: readonly Arvore[];
  readonly atual: number;
}

/** Os rascunhos guardados, do mais recente ao mais antigo. */
export type Guardados = readonly RascunhoDeTopico[];

/** Quantos tópicos ficam guardados. O sexto empurra o mais antigo para fora. */
export const LIMITE_DE_TOPICOS = 5;

/**
 * Teto de bytes da gravação inteira.
 *
 * Eram 8 kB, e isso quebrava a ferramenta no segundo tópico: um tópico com as
 * 20 linhas permitidas ocupa perto de 7 kB, então o segundo estourava o teto e
 * a gravação parava de acontecer **para todos**. O aluno continuava montando, o
 * disco continuava com a versão velha, e a aba morta no avião levava tudo — que
 * é exatamente o acidente que esta persistência existe para evitar.
 *
 * 128 kB são 2,5% de uma cota típica de 5 MB, e fazem os cinco tópicos caberem
 * com folga de quatro vezes.
 */
export const LIMITE_DE_BYTES = 131072;

/** Põe o tópico na frente da fila, com o conteúdo novo. */
export function guardar(guardados: Guardados, topico: string, linhas: Linhas): Guardados {
  const resto = guardados.filter((item) => item.topico !== topico);
  const atualizado: RascunhoDeTopico = {
    topico,
    linhas: linhas.linhas.map((linha) => linha.arvore),
    atual: linhas.atual,
  };

  return [atualizado, ...resto].slice(0, LIMITE_DE_TOPICOS);
}

export function doTopico(guardados: Guardados, topico: string): Linhas | null {
  const achado = guardados.find((item) => item.topico === topico);

  return achado === undefined ? null : linhasDe(achado.linhas, achado.atual);
}

export function esquecer(guardados: Guardados, topico: string): Guardados {
  return guardados.filter((item) => item.topico !== topico);
}

/**
 * O texto a gravar, largando os tópicos mais antigos até caber.
 *
 * A fila vem do mais recente para o mais antigo, então cortar o fim é cortar o
 * que o aluno abandonou há mais tempo. É o mesmo critério que `LIMITE_DE_TOPICOS`
 * já aplica por contagem — reagir ao excesso de bytes de um jeito e ao excesso de
 * tópicos de outro não teria defesa.
 *
 * `null` fica reservado ao caso em que **nem o tópico mais recente cabe**. Aí não
 * se grava nada, de propósito: o disco conserva o que tinha, a memória conserva o
 * que o aluno montou, e a tela avisa. Gravar uma lista vazia seria apagar o
 * rascunho dos outros tópicos para registrar o fracasso deste.
 */
export function serializar(guardados: Guardados): string | null {
  if (guardados.length === 0) {
    return '[]';
  }

  for (let quantos = guardados.length; quantos >= 1; quantos--) {
    const texto = JSON.stringify(guardados.slice(0, quantos));

    if (texto.length <= LIMITE_DE_BYTES) {
      return texto;
    }
  }

  return null;
}

/**
 * Lê o que estiver no disco, validando nó por nó.
 *
 * `JSON.parse` de uma união discriminada volta como `unknown`, e o formato da
 * árvore vai crescer entre as fases — uma peça que esta versão não conhece
 * chegaria como lixo tipado. O jeito da casa é validar campo por campo e
 * descartar o que não fizer sentido, como `carregar` da folha e `validar` da
 * configuração.
 */
export function ler(bruto: string | null): Guardados {
  if (bruto === null) {
    return [];
  }

  try {
    const lido: unknown = JSON.parse(bruto);
    if (!Array.isArray(lido)) {
      return [];
    }

    return lido.flatMap((item: unknown) => {
      const validado = validarTopico(item);
      return validado === null ? [] : [validado];
    });
  } catch {
    return [];
  }
}

function validarTopico(bruto: unknown): RascunhoDeTopico | null {
  if (typeof bruto !== 'object' || bruto === null) {
    return null;
  }

  const item = bruto as Record<string, unknown>;
  const topico = item['topico'];
  const linhas = item['linhas'];
  const atual = item['atual'];

  if (typeof topico !== 'string' || topico === '' || !Array.isArray(linhas)) {
    return null;
  }

  /*
   * A linha estragada vira buraco, e não desaparece.
   *
   * Descartá-la renumeraria as que sobram, e `atual` passaria a apontar para
   * outra linha — a perda seria silenciosa e o aluno veria a conta embaralhada.
   * Um buraco no lugar guarda a posição e deixa o estrago visível.
   */
  const arvores = linhas.map((linha: unknown) => {
    const arvore = validarArvore(linha);

    /*
     * Forma certa não basta: a linha também precisa obedecer ao que a montagem
     * garante — uma igualdade, na raiz, e frações dentro do teto. Uma árvore
     * mais funda que o teto seria desenhada e consumiria a tela inteira, que é
     * justamente o que `LIMITE_DE_FRACOES` existe para evitar, e daí em diante
     * todo envolvimento seria recusado sem o aluno entender por quê.
     */
    return arvore !== null && linhaCoerente(arvore, LIMITE_DE_FRACOES)
      ? arvore
      : { tipo: 'buraco' as const };
  });

  if (arvores.length === 0) {
    return null;
  }

  // Uma linha só, e vazia, não é rascunho: é o estado de quem nunca montou nada.
  if (arvores.every((arvore) => arvore.tipo === 'buraco')) {
    return null;
  }

  return {
    topico,
    linhas: arvores,
    atual: typeof atual === 'number' && Number.isInteger(atual) ? atual : 0,
  };
}

const OPERADORES: readonly string[] = ['+', '-', '*', '/'];

/** Uma árvore de verdade, ou `null`. Recursiva, como a própria árvore. */
export function validarArvore(bruto: unknown): Arvore | null {
  if (typeof bruto !== 'object' || bruto === null) {
    return null;
  }

  const no = bruto as Record<string, unknown>;

  switch (no['tipo']) {
    case 'buraco':
      return { tipo: 'buraco' };

    case 'incognita':
      return { tipo: 'incognita' };

    case 'numero': {
      const algarismos = no['algarismos'];
      // Pelo menos um algarismo antes da vírgula: `,` solto não é número.
      if (typeof algarismos !== 'string' || !/^\d+(,\d*)?$/.test(algarismos)) {
        return null;
      }

      return { tipo: 'numero', algarismos, negativo: no['negativo'] === true };
    }

    case 'operacao': {
      const operador = no['operador'];
      if (typeof operador !== 'string' || !OPERADORES.includes(operador)) {
        return null;
      }

      const esquerda = validarArvore(no['esquerda']);
      const direita = validarArvore(no['direita']);
      if (esquerda === null || direita === null) {
        return null;
      }

      return { tipo: 'operacao', operador: operador as Operador, esquerda, direita };
    }

    case 'fracao': {
      const numerador = validarArvore(no['numerador']);
      const denominador = validarArvore(no['denominador']);
      if (numerador === null || denominador === null) {
        return null;
      }

      return { tipo: 'fracao', numerador, denominador };
    }

    case 'igualdade': {
      const esquerda = validarArvore(no['esquerda']);
      const direita = validarArvore(no['direita']);
      if (esquerda === null || direita === null) {
        return null;
      }

      return { tipo: 'igualdade', esquerda, direita };
    }

    default:
      return null;
  }
}
