import dicionario from '@core/math/translations/math-translations.json';
import { normalizarTexto } from '@core/math/translations/texto-normalizado';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * O guarda das traduções de resolução, dica e diagnóstico.
 *
 * Três coisas quebravam antes dele existir, e todas em silêncio:
 *
 * - o dicionário guardava o CÓDIGO-FONTE (`${x}`) em vez do texto que chega à
 *   tela, e nenhuma dessas entradas casava com nada;
 * - a chave era o texto literal, e como as frases carregam os números («O seno
 *   vale no máximo 1»), cada valor pedia uma entrada nova;
 * - a cobertura nunca era medida, então ninguém sabia que metade da tela
 *   continuava em português.
 *
 * Aqui o texto é coletado do RUNTIME — os geradores rodando de verdade — e
 * comparado com o dicionário já normalizado. O teste não exige 100%: exigir
 * travaria toda mudança de gerador até a tradução sair. Ele exige que a
 * cobertura não CAIA, e imprime quanto falta. É o que transforma «um dia a
 * gente traduz» em dívida medida.
 */

const NSEMENTES = 12;
const AMOSTRAS = 6;

/**
 * Os pisos. Subir quando a tradução avançar; nunca descer.
 *
 * As descrições de passo são o grosso: são milhares de frases porque carregam
 * as fórmulas do exercício. Cada tópico traduzido sobe o número; o piso existe
 * para que uma mudança de gerador que invente frases novas apareça aqui, em vez
 * de aparecer na tela de quem estuda em francês.
 *
 * O trabalho terminou, e os pisos são 1 — com a conta feita sobre o que de
 * fato se traduz. Duas coisas saem do denominador, e cada uma por um motivo
 * que estava escondido atrás de um número quebrado:
 *
 * - **notação pura** («p = mv», «# × # = #»): fórmula escrita no campo de
 *   texto. Não muda de idioma, e uma entrada cujo francês repetisse a chave é
 *   recusada pelo guarda das entradas vazias — ficaria para sempre na conta
 *   como dívida que ninguém pode pagar;
 * - **a dica que vem de MOLDE** e o diagnóstico que traz `diagnosticoTraducoes`:
 *   já chegam traduzidos do arquivo. Exigi-los aqui mandaria escrever a mesma
 *   frase duas vezes, e a segunda cópia seria a que envelhece.
 *
 * Como se traduziu, para quem precisar repetir em frases novas: por FAMÍLIA, e
 * não por linha. As frases de um tópico são variações de poucos moldes —
 * «Zeramos o resto da coluna #: L₂ ← L₂ − #·L₁» tem trinta irmãs que mudam só
 * a notação —, então escrever as frases de um tópico de cada vez rende muito
 * mais que percorrer a lista inteira.
 */
const PISO_DOS_PASSOS = 1;
const PISO_DAS_DICAS = 1;

interface Frases {
  readonly passos: Set<string>;
  readonly dicas: Set<string>;
  readonly diagnosticos: Set<string>;
}

function coletar(): Frases {
  const passos = new Set<string>();
  const dicas = new Set<string>();
  const diagnosticos = new Set<string>();

  for (const [, gerador] of TODOS_OS_GERADORES) {
    for (const nivel of NIVEIS) {
      for (let semente = 1; semente <= NSEMENTES; semente++) {
        const rng = criarRng(semente * 7919);
        for (let i = 0; i < AMOSTRAS; i++) {
          const exercicio = gerador.gerar(nivel, rng);
          for (const passo of exercicio.resolucao.passos) {
            passos.add(normalizarTexto(passo.descricao));
            if (passo.nota) {
              passos.add(normalizarTexto(passo.nota));
            }
          }
          /*
           * A dica que vem de MOLDE já chega traduzida, e o dicionário não é o
           * lugar dela: exigi-la aqui obrigaria a escrever duas vezes a mesma
           * frase — uma no arquivo do enunciado, nas três línguas, e outra no
           * dicionário — e a segunda cópia seria a que envelhece. O que esta
           * medida persegue é a frase escrita em TypeScript, que sem o
           * dicionário chega à tela francesa em português.
           */
          if (exercicio.dica && exercicio.traducoes?.fr?.dica === undefined) {
            dicas.add(normalizarTexto(exercicio.dica));
          }
          for (const armadilha of exercicio.armadilhas) {
            if (armadilha.diagnosticoTraducoes !== undefined) {
              continue;
            }
            diagnosticos.add(normalizarTexto(armadilha.diagnostico));
          }
        }
      }
    }
  }

  return { passos, dicas, diagnosticos };
}

const TODAS = coletar();

/** Só as frases com texto: notação pura não entra na conta. */
const FRASES: Frases = {
  passos: new Set([...TODAS.passos].filter(temTextoTraduzivel)),
  dicas: new Set([...TODAS.dicas].filter(temTextoTraduzivel)),
  diagnosticos: new Set([...TODAS.diagnosticos].filter(temTextoTraduzivel)),
};
const DICIONARIO = dicionario as Readonly<Record<string, { fr?: string; en?: string }>>;

/**
 * A frase tem texto para traduzir?
 *
 * `p = mv`, `Ec = mv²/#`, `# × # = #` são FÓRMULA escrita no campo de texto,
 * e notação não muda de idioma: uma entrada cujo francês repetisse a chave é
 * recusada pelo guarda das entradas vazias, logo essas frases nunca podem ser
 * cobertas — e contá-las no denominador empurra a medida para baixo sem que
 * exista trabalho a fazer. A régua é ter uma palavra de quatro letras ou mais.
 */
function temTextoTraduzivel(frase: string): boolean {
  return /[A-Za-zÀ-ÿ]{4,}/.test(frase);
}

function cobertos(frases: Set<string>): number {
  return [...frases].filter((frase) => DICIONARIO[frase] !== undefined).length;
}

describe('traduções de resolução, dica e diagnóstico', () => {
  it('o dicionário não tem chave que seja código-fonte', () => {
    // Foi assim que o dicionário anterior nasceu inútil: as chaves vinham do
    // `.ts` e traziam `${...}` e sobras de concatenação (`' +`).
    const suspeitas = Object.keys(DICIONARIO).filter(
      (chave) => chave.includes('${') || chave.includes("' +") || chave.includes('` +'),
    );

    expect(suspeitas.slice(0, 5), `${suspeitas.length} chaves com código-fonte`).toEqual([]);
  });

  it('cada entrada tem francês e inglês de verdade', () => {
    const vazias = Object.entries(DICIONARIO).filter(
      ([chave, valor]) => !valor.fr || !valor.en || (valor.fr === chave && valor.en === chave),
    );

    expect(
      vazias.slice(0, 5).map(([chave]) => chave),
      `${vazias.length} entradas vazias`,
    ).toEqual([]);
  });

  /**
   * Os curingas de número casam entre as três línguas.
   *
   * `#` é um número que volta ao texto na hora de exibir. Se a tradução tem
   * menos curingas que o original, um número some da frase — e a frase passa a
   * dizer outra coisa. É a mesma exigência que o banco de enunciados faz das
   * três línguas.
   */
  it('os curingas de número batem nas três línguas', () => {
    const divergentes: string[] = [];

    for (const [chave, valor] of Object.entries(DICIONARIO)) {
      const quantos = (chave.match(/#/g) ?? []).length;
      if ((valor.fr?.match(/#/g) ?? []).length !== quantos) {
        divergentes.push(`fr: ${chave}`);
      }
      if ((valor.en?.match(/#/g) ?? []).length !== quantos) {
        divergentes.push(`en: ${chave}`);
      }
    }

    expect(divergentes.slice(0, 10), `${divergentes.length} divergentes`).toEqual([]);
  });

  it('a cobertura das dicas não cai', () => {
    const total = FRASES.dicas.size;
    const prontas = cobertos(FRASES.dicas);

    expect(
      prontas / total,
      `${prontas}/${total} dicas traduzidas. Faltam ${total - prontas}.`,
    ).toBeGreaterThanOrEqual(PISO_DAS_DICAS);
  });

  it('a cobertura das descrições de passo não cai', () => {
    const total = FRASES.passos.size;
    const prontas = cobertos(FRASES.passos);
    const fracao = prontas / total;

    expect(
      fracao,
      `${prontas}/${total} descrições de passo traduzidas ` +
        `(${(fracao * 100).toFixed(1)}%). Faltam ${total - prontas}.`,
    ).toBeGreaterThanOrEqual(PISO_DOS_PASSOS);
  });

  it('a cobertura dos diagnósticos não cai', () => {
    const total = FRASES.diagnosticos.size;
    const prontas = cobertos(FRASES.diagnosticos);

    // Os diagnósticos chegaram a 100%: o piso aqui é 1, e qualquer frase nova
    // sem tradução derruba o teste no mesmo dia em que for escrita.
    expect(
      prontas / total,
      [...FRASES.diagnosticos].filter((frase) => DICIONARIO[frase] === undefined).join(' | '),
    ).toBeGreaterThanOrEqual(1);
  });
});
