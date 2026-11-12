import { Arvore, Operador } from '../peca/peca';
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
 * Teto de bytes por gravação.
 *
 * Ao estourar, **recusa-se a gravar e avisa-se** — nada é descartado. Jogar
 * fora a linha mais antiga apagaria o ponto de partida da conta, que é
 * justamente a linha de que todas as outras descendem.
 */
export const LIMITE_DE_BYTES = 8192;

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
 * O texto a gravar, ou `null` se passar do teto.
 *
 * Devolver `null` em vez de cortar é o que permite ao serviço avisar sem perder
 * nada: o que está na memória continua lá, e só o disco fica para trás.
 */
export function serializar(guardados: Guardados): string | null {
  const texto = JSON.stringify(guardados);

  return texto.length > LIMITE_DE_BYTES ? null : texto;
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

  const arvores = linhas.flatMap((linha: unknown) => {
    const validada = validarArvore(linha);
    return validada === null ? [] : [validada];
  });

  if (arvores.length === 0) {
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
      if (typeof algarismos !== 'string' || !/^\d*,?\d*$/.test(algarismos)) {
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
