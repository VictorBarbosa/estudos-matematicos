import katex from 'katex';
import { TODAS_AS_TEORIAS } from '@core/teoria/teorias.catalogo/teorias.catalogo';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS } from '@core/treino/models/treino.model';

/**
 * Renderiza TODA fórmula do site com o KaTeX e exige que ela compile.
 *
 * Em produção o KaTeX roda com `throwOnError: false`, para não derrubar a tela
 * por causa de uma fórmula — o que também significa que um erro de LaTeX passa
 * silencioso. Aqui ele roda com o erro ligado, que é o único lugar onde esse
 * tipo de problema aparece.
 *
 * Foi essa classe de problema que deixou 622 ocorrências de `\;` escritas com
 * uma barra só: em JavaScript `'\;'` é apenas `;`, e o KaTeX desenhava
 * "x = 0 ;⇒; …" onde devia haver um espaço fino.
 *
 * **Um caso de teste por tópico**, de propósito: compilar os 75 tópicos de uma
 * vez custava ~45 mil renderizações num único `it`, o que passava longe aqui e
 * estourava o limite de 5 s no runner de duas CPUs da integração contínua. Em
 * casos separados, cada um faz algumas centenas — e, quando falha, o nome do
 * teste já diz qual tópico olhar.
 */

/** Exercícios sorteados por tópico e nível. Baixo porque o custo é o KaTeX. */
const AMOSTRAS = 8;

/** Folga generosa: o custo depende da máquina, e falhar por lentidão é ruído. */
const TEMPO_LIMITE = 30_000;

/** Sequências que o TypeScript engole e que viram lixo visível no KaTeX. */
const ESCAPES_PERDIDOS = /(?<!\\)[;,:!]\s*(?:\\(?:Rightarrow|Longrightarrow|implies|to|iff))/;

/**
 * Quantas fórmulas foram compiladas.
 *
 * Existe para que cada caso termine numa asserção: `compila` reprova
 * lançando, então um laço que não executasse nada passaria calado — e um teste
 * sem asserção é um teste que não protege nada.
 */
let compiladas = 0;

function compila(tex: string, descricao: string): void {
  compiladas++;

  try {
    // `strict: false` é o que a aplicação usa: aceita acentos e símbolos
    // Unicode dentro de `\text{}`. O que muda aqui é `throwOnError`, que em
    // produção fica desligado para não derrubar a tela — e, de quebra, escondia
    // erros de LaTeX.
    katex.renderToString(tex, { displayMode: false, throwOnError: true, strict: false });
  } catch (erro) {
    throw new Error(`${descricao}\nLaTeX: ${tex}\n${(erro as Error).message}`);
  }
}

describe('fórmulas da teoria', () => {
  for (const [topico, teorias] of TODAS_AS_TEORIAS) {
    it(
      `${topico}: fórmulas, demonstração e exemplo compilam no KaTeX`,
      () => {
        compiladas = 0;

        for (const teoria of teorias) {
          for (const formula of teoria.formulas) {
            compila(formula.tex, `${topico}/${teoria.id}: fórmula`);
          }
          for (const passo of teoria.demonstracao) {
            compila(passo.tex, `${topico}/${teoria.id}: demonstração`);
          }
          for (const passo of teoria.exemplo?.passos ?? []) {
            compila(passo.tex, `${topico}/${teoria.id}: exemplo`);
          }
        }

        expect(compiladas, `${topico} não tem fórmula nenhuma na teoria`).toBeGreaterThan(0);
      },
      TEMPO_LIMITE,
    );
  }
});

describe('fórmulas dos exercícios', () => {
  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    it(
      `${topico}: enunciados e resoluções compilam no KaTeX`,
      () => {
        compiladas = 0;

        for (const nivel of NIVEIS) {
          const rng = criarRng(161_803);

          for (let i = 0; i < AMOSTRAS; i++) {
            const exercicio = gerador.gerar(nivel, rng);
            compila(exercicio.enunciadoTex, `${topico}/${nivel}: enunciado`);

            for (const [indice, passo] of exercicio.resolucao.passos.entries()) {
              compila(passo.tex, `${topico}/${nivel}: passo ${indice} da resolução`);
            }
          }
        }

        // Pelo menos um enunciado por nível, mais os passos de cada resolução.
        expect(compiladas, `${topico} não gerou fórmula nenhuma`).toBeGreaterThanOrEqual(
          NIVEIS.length * AMOSTRAS,
        );
      },
      TEMPO_LIMITE,
    );
  }
});

describe('escapes perdidos', () => {
  /** `\;` escrito com uma barra só chega ao KaTeX como `;`. */
  function suspeitas(tex: string, onde: string): readonly string[] {
    return ESCAPES_PERDIDOS.test(tex) ? [`${onde}: ${tex}`] : [];
  }

  it('nenhuma fórmula da teoria traz pontuação onde devia haver espaço fino', () => {
    const achados: string[] = [];

    for (const [topico, teorias] of TODAS_AS_TEORIAS) {
      for (const teoria of teorias) {
        for (const formula of teoria.formulas) {
          achados.push(...suspeitas(formula.tex, `${topico}/${teoria.id}`));
        }
        for (const passo of teoria.demonstracao) {
          achados.push(...suspeitas(passo.tex, `${topico}/${teoria.id}`));
        }
      }
    }

    expect(achados).toEqual([]);
  });

  it(
    'nenhum exercício traz pontuação onde devia haver espaço fino',
    () => {
      const achados: string[] = [];

      for (const [topico, gerador] of TODOS_OS_GERADORES) {
        for (const nivel of NIVEIS) {
          const rng = criarRng(271_828);

          for (let i = 0; i < AMOSTRAS; i++) {
            const exercicio = gerador.gerar(nivel, rng);
            achados.push(...suspeitas(exercicio.enunciadoTex, `${topico}/${nivel}`));

            for (const passo of exercicio.resolucao.passos) {
              achados.push(...suspeitas(passo.tex, `${topico}/${nivel}`));
            }
          }
        }
      }

      expect(achados).toEqual([]);
    },
    TEMPO_LIMITE,
  );
});
