import { todosOsEnunciados, vestirTexto } from '@core/enunciados/models/enunciado.model';
import { passosDoBanco } from '@core/enunciados/models/passos-do-banco';
import { paraRegex, TODAS_AS_REGRAS } from '@core/enunciados/models/regras.catalogo';
import {
  DESCRICAO_DA_CONTA,
  DESCRICAO_DA_FORMULA,
  DESCRICAO_DA_SUBSTITUICAO,
} from '@core/enunciados/models/regras-de-passos';
import dicionario from '@core/math/translations/math-translations.json';

/**
 * O guarda das traduções das regras do banco.
 *
 * ## O defeito que ele impede
 *
 * As regras nasceram escritas à mão, em português, e esse texto chega à tela de
 * quem estuda em francês ou inglês: a DESCRIÇÃO de cada passo e as palavras
 * dentro da fórmula (`\text{dias}`, `\text{soma}`). O `I18nService` não as
 * conhece — ele só tem as chaves da interface. Quem traduz o texto do motor é o
 * `MathTranslationsService`, que indexa por frase.
 *
 * Uma regra nova sem tradução não quebra nada e o aluno vê meia tela em
 * português. Este guarda fecha as duas portas.
 */

const DICIONARIO = dicionario as Readonly<Record<string, { fr?: string; en?: string }>>;

/** A forma escrita como texto de verdade: `#` vira número, `*` vira palavra. */
const textoDaForma = (forma: string): string => forma.replace(/#/g, '1').replace(/\*/g, 'x');

/**
 * As abreviações neutras que podem aparecer dentro da fórmula.
 *
 * `\mathrm{rad}` e `\mathrm{diag}` não são palavras de língua nenhuma: são
 * símbolos. Qualquer outra sequência de letras é texto que precisaria ser
 * traduzido — e, dentro da fórmula, não é.
 */
const SIMBOLOS_NEUTROS: readonly string[] = [
  'rad',
  'deg',
  'diag',
  'max',
  'min',
  'det',
  'log',
  'arg',
  'sen',
  'cos',
  'tan',
  'pH',
  'mod',
  'sup',
  'inf',
  'trace',
  'rank',
  'ker',
  'im',
];

/** Há palavra em português dentro da fórmula? */
function temPalavraEmPortugues(tex: string): boolean {
  const dentro = [...tex.matchAll(/\\[tr]ext\{([^}]*)\}|\\mathrm\{([^}]*)\}/g)].map(
    (achado) => achado[1] ?? achado[2] ?? '',
  );

  return dentro.some((trecho) => {
    // Acento é sinal definitivo: nenhum símbolo matemático tem acento.
    if (/[çãõáéíóúâêôà]/i.test(trecho)) {
      return true;
    }

    const palavras = trecho.match(/[a-z]{2,}/gi) ?? [];
    return palavras.some((palavra) => !SIMBOLOS_NEUTROS.includes(palavra));
  });
}

describe('tradução das regras do banco', () => {
  it('toda regra reconhece a própria forma', () => {
    // Uma regra que não casa com o texto que ela mesma descreve é código morto.
    const quebradas = TODAS_AS_REGRAS.filter(
      ({ regra }) => !paraRegex(regra[0]).test(textoDaForma(regra[0])),
    ).map(({ topico, regra }) => `${topico}: ${regra[0].slice(0, 70)}`);

    expect(
      quebradas.slice(0, 6),
      `${quebradas.length} regras não casam com a própria forma`,
    ).toEqual([]);
  });

  it('as três descrições fixas estão no dicionário', () => {
    // São as que TODA regra declarativa mostra, nas 5679 entradas cobertas.
    const fixas = [DESCRICAO_DA_FORMULA, DESCRICAO_DA_SUBSTITUICAO, DESCRICAO_DA_CONTA];

    expect(fixas.filter((frase) => DICIONARIO[frase] === undefined)).toEqual([]);
  });

  it('toda descrição que uma entrada real do banco mostra tem tradução', () => {
    /*
     * O caminho é o de verdade: cada entrada do banco, com os números do
     * arquivo, passando pelo resolvedor. É o que o aluno vê.
     */
    const semTraducao = new Map<string, string>();

    for (const entrada of todosOsEnunciados()) {
      const { total: _fora, ...dados } = entrada['dados-calculo'] ?? {};
      const texto = vestirTexto(entrada.enunciado.br, entrada['dados-calculo'] ?? {}, 'pt');
      const resolucao = passosDoBanco(entrada.topico, dados, texto);

      for (const passo of resolucao?.passos ?? []) {
        if (DICIONARIO[passo.descricao] === undefined) {
          semTraducao.set(passo.descricao, entrada.topico);
        }
      }
    }

    expect(
      [...semTraducao.entries()].slice(0, 8),
      `${semTraducao.size} descrições sem tradução`,
    ).toEqual([]);
  });

  it('a fórmula não carrega palavra em português', () => {
    const comPortugues: string[] = [];

    for (const { topico, regra } of TODAS_AS_REGRAS) {
      for (const tex of [regra[1], regra[2]]) {
        if (temPalavraEmPortugues(tex)) {
          comPortugues.push(`${topico}: ${tex.slice(0, 70)}`);
        }
      }
    }

    expect(
      comPortugues.slice(0, 6),
      `${comPortugues.length} fórmulas com texto que não se traduz`,
    ).toEqual([]);
  });
});
