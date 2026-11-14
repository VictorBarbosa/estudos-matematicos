/**
 * O filtro entre a LLM e o aluno.
 *
 * Um modelo de linguagem escreve a HISTÓRIA do problema; os números e a
 * resposta continuam sendo do código, como sempre foram. Isso só é seguro se
 * houver um portão: o texto que volta da LLM precisa provar que é um enunciado
 * utilizável antes de aparecer na tela. É isso que este arquivo faz, e ele
 * recusa em silêncio — o que não passa é descartado, e o tópico cai no
 * enunciado de sempre.
 *
 * As regras não são estilo: cada uma fecha um jeito concreto de o exercício
 * sair errado.
 *
 * - **Nenhum dígito fora dos espaços reservados.** Se a LLM escreve um número
 *   por conta dela, esse número não passou pelo sorteio, o código não sabe que
 *   ele existe, e pode ser a própria resposta — vazada no enunciado.
 * - **Os três idiomas com os mesmos espaços, na mesma ordem.** É o que o
 *   guarda `textos-traduzidos.spec.ts` já exige dos enunciados escritos à mão:
 *   trocar de idioma não pode trocar os números de lugar.
 * - **Sem LaTeX e sem metatexto.** A prosa do site é texto puro
 *   (`formulas-do-site.spec.ts`), e «Problema 3:» ou «Resposta:» é a LLM
 *   falando com quem a chamou, não com o aluno.
 *
 * Este arquivo não importa nada de propósito: ele roda igual no navegador e
 * num script de linha de comando, que é como o comparador de modelos o usa.
 */

/** O texto cru que voltou da LLM, antes de qualquer conferência. */
export interface ModeloBruto {
  readonly pt: string;
  readonly fr: string;
  readonly en: string;
}

/** Um modelo aprovado: a mesma história nas três línguas, com lacunas. */
export interface ModeloDeProblema extends ModeloBruto {
  /** Quantos espaços reservados ele usa, de `{0}` a `{n-1}`. */
  readonly lacunas: number;
}

export type MotivoDeRecusa =
  | 'texto-vazio'
  | 'lacuna-faltando'
  | 'lacuna-repetida'
  | 'lacuna-desconhecida'
  | 'ordem-diferente'
  | 'digito-solto'
  | 'numero-escrito'
  | 'sem-pergunta'
  | 'curto'
  | 'longo'
  | 'latex'
  | 'metatexto';

export interface Recusa {
  readonly ok: false;
  readonly motivos: readonly MotivoDeRecusa[];
}

export interface Aprovacao {
  readonly ok: true;
  readonly modelo: ModeloDeProblema;
}

const IDIOMAS = ['pt', 'fr', 'en'] as const;

type Idioma = (typeof IDIOMAS)[number];

/** Um enunciado de celular: duas frases e a pergunta, não um parágrafo. */
const MINIMO_DE_CARACTERES = 40;
const MAXIMO_DE_CARACTERES = 240;

/**
 * Números escritos em palavras, que burlariam a regra do dígito solto.
 *
 * A lista cresceu por um caso real: na comparação de modelos de 14/11, o
 * `qwen3.8:27b-mlx` traduziu «ao final do turno» por «à la fin de sa
 * quinzaine» — que é quinzena, não turno. O erro era de tradução, mas a
 * palavra carrega um número, e por isso ele passa a ser pego aqui. Formas
 * coletivas entram pelo mesmo motivo: «uma dúzia» e «une dizaine» são
 * quantidades que o código não sorteou.
 *
 * «um», «uma», «un», «une», «a» e «an» ficam fora da lista: em três línguas
 * eles são artigo muito mais vezes do que são número, e recusar por causa
 * deles jogaria fora enunciados bons. É uma folga consciente — um «dois» por
 * extenso é pego, um «um» por extenso não.
 */
const NUMEROS_ESCRITOS = [
  'dois',
  'duas',
  'três',
  'tres',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'catorze',
  'quinze',
  'dezena',
  'dezenas',
  'dúzia',
  'duzia',
  'dúzias',
  'duzias',
  'centena',
  'centenas',
  'vinte',
  'trinta',
  'cem',
  'mil',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'quinzaine',
  'douzaine',
  'dizaine',
  'dizaines',
  'centaine',
  'centaines',
  'vingt',
  'trente',
  'cent',
  'mille',
  'two',
  'three',
  'four',
  'five',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'dozen',
  'dozens',
  'twenty',
  'thirty',
  'hundred',
  'thousand',
];

/**
 * Marcas de que a LLM está falando com quem a chamou, e não com o aluno.
 *
 * Elas aparecem mesmo com instrução explícita em contrário, e o aluno não tem
 * nada a ganhar lendo «Problema 3:» antes do enunciado.
 */
const METATEXTO = [
  'problema:',
  'problema ',
  'exercício:',
  'exercicio:',
  'enunciado:',
  'resposta:',
  'solução:',
  'solucao:',
  'dica:',
  'nota:',
  'observação:',
  'problème:',
  'exercice:',
  'réponse:',
  'solution:',
  'problem:',
  'exercise:',
  'answer:',
  'hint:',
  'note:',
  'here is',
  'voici',
  'aqui está',
];

/** Os índices dos espaços reservados, na ordem em que aparecem no texto. */
export function lacunasDe(texto: string): readonly number[] {
  return [...texto.matchAll(/\{(\d+)\}/g)].map((achado) => Number(achado[1]));
}

/** O texto sem os espaços reservados, para procurar dígito solto. */
function semLacunas(texto: string): string {
  return texto.replace(/\{\d+\}/g, ' ');
}

function conferirIdioma(texto: string, lacunas: number): MotivoDeRecusa[] {
  const motivos: MotivoDeRecusa[] = [];
  const aparado = texto.trim();

  if (aparado.length === 0) {
    return ['texto-vazio'];
  }

  if (aparado.length < MINIMO_DE_CARACTERES) {
    motivos.push('curto');
  }
  if (aparado.length > MAXIMO_DE_CARACTERES) {
    motivos.push('longo');
  }
  if (!aparado.includes('?')) {
    motivos.push('sem-pergunta');
  }

  const indices = lacunasDe(aparado);

  for (let esperado = 0; esperado < lacunas; esperado += 1) {
    const vezes = indices.filter((indice) => indice === esperado).length;

    if (vezes === 0) {
      motivos.push('lacuna-faltando');
    } else if (vezes > 1) {
      motivos.push('lacuna-repetida');
    }
  }

  if (indices.some((indice) => indice >= lacunas)) {
    motivos.push('lacuna-desconhecida');
  }

  const prosa = semLacunas(aparado);

  if (/\d/.test(prosa)) {
    motivos.push('digito-solto');
  }

  const palavras = prosa
    .toLocaleLowerCase('pt-BR')
    .split(/[^\p{L}]+/u)
    .filter((palavra) => palavra.length > 0);

  if (palavras.some((palavra) => NUMEROS_ESCRITOS.includes(palavra))) {
    motivos.push('numero-escrito');
  }

  // LaTeX na prosa: o site escreve fórmula em campo próprio, nunca no texto.
  if (/\\[a-zA-Z]|\$|\^\{|_\{/.test(aparado)) {
    motivos.push('latex');
  }

  const minusculo = aparado.toLocaleLowerCase('pt-BR');

  if (METATEXTO.some((marca) => minusculo.startsWith(marca) || minusculo.includes(`\n${marca}`))) {
    motivos.push('metatexto');
  }

  if (/^[*#\->]|\n\s*[*#\->]/.test(aparado)) {
    motivos.push('metatexto');
  }

  return motivos;
}

/**
 * Aprova ou recusa um modelo recém-escrito pela LLM.
 *
 * `lacunas` é quantos valores o gerador do tópico vai substituir — não é
 * negociável pela LLM, e um texto com lacuna a mais ou a menos é inútil
 * porque o enunciado sairia com `{2}` na tela ou com um dado escondido.
 */
export function validarModelo(bruto: ModeloBruto, lacunas: number): Aprovacao | Recusa {
  const motivos = new Set<MotivoDeRecusa>();

  for (const idioma of IDIOMAS) {
    for (const motivo of conferirIdioma(bruto[idioma] ?? '', lacunas)) {
      motivos.add(motivo);
    }
  }

  // A ordem das lacunas tem de ser a mesma nas três línguas: é o que mantém
  // «trocar de idioma» inofensivo para os números.
  const ordens = IDIOMAS.map((idioma) => lacunasDe(bruto[idioma] ?? '').join(','));

  if (new Set(ordens).size > 1) {
    motivos.add('ordem-diferente');
  }

  if (motivos.size > 0) {
    return { ok: false, motivos: [...motivos] };
  }

  return {
    ok: true,
    modelo: {
      pt: bruto.pt.trim(),
      fr: bruto.fr.trim(),
      en: bruto.en.trim(),
      lacunas,
    },
  };
}

/**
 * Duas histórias são a mesma história?
 *
 * Um lote de dez volta com repetições, e repetição não é erro de validade —
 * é falta de variedade, que se resolve descartando a segunda. A comparação é
 * do texto em português sem acento, sem pontuação e sem as lacunas: é o
 * suficiente para pegar «uma oficina cobra» duas vezes com outro número.
 */
export function assinaturaDoModelo(modelo: ModeloBruto): string {
  return semLacunas(modelo.pt)
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, ' ')
    .split(/\s+/)
    .filter((palavra) => palavra.length > 3)
    .sort()
    .join(' ');
}
