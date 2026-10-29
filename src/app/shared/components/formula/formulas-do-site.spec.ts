import katex from 'katex';
import { TODAS_AS_TEORIAS } from '@core/teoria/teorias.catalogo';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo';
import { criarRng } from '@core/treino/rng';
import { NIVEIS } from '@core/treino/treino.model';

/**
 * Renderiza TODA fórmula do site com o KaTeX e exige que ela compile.
 *
 * Em produção o KaTeX roda com `throwOnError: false`, para não derrubar a tela
 * por causa de uma fórmula — o que também significa que um erro de LaTeX passa
 * silencioso. Aqui ele roda em modo estrito, que é o único lugar onde esse tipo
 * de erro aparece.
 *
 * Foi essa classe de problema que deixou 622 ocorrências de `\;` escritas com
 * uma barra só: em JavaScript `'\;'` é apenas `;`, e o KaTeX desenhava
 * "x = 0 ;⇒; …" onde devia haver um espaço fino.
 */

/** Sequências que o TypeScript engole e que viram lixo visível no KaTeX. */
const ESCAPES_PERDIDOS = /(?<!\\)[;,:!]\s*(?:\\(?:Rightarrow|Longrightarrow|implies|to|iff))/;

function compila(tex: string, descricao: string): void {
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

describe('fórmulas do site', () => {
  it('toda fórmula da teoria compila no KaTeX', () => {
    for (const [topico, teorias] of TODAS_AS_TEORIAS) {
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
    }
  });

  it('todo enunciado e toda resolução compilam no KaTeX', () => {
    for (const [topico, gerador] of TODOS_OS_GERADORES) {
      for (const nivel of NIVEIS) {
        const rng = criarRng(161_803);

        for (let i = 0; i < 40; i++) {
          const exercicio = gerador.gerar(nivel, rng);
          compila(exercicio.enunciadoTex, `${topico}/${nivel}: enunciado`);

          for (const [indice, passo] of exercicio.resolucao.passos.entries()) {
            compila(passo.tex, `${topico}/${nivel}: passo ${indice} da resolução`);
          }
        }
      }
    }
  });

  it('nenhuma fórmula traz pontuação onde devia haver espaço fino', () => {
    const suspeitas: string[] = [];

    const conferir = (tex: string, onde: string): void => {
      if (ESCAPES_PERDIDOS.test(tex)) {
        suspeitas.push(`${onde}: ${tex}`);
      }
    };

    for (const [topico, teorias] of TODAS_AS_TEORIAS) {
      for (const teoria of teorias) {
        for (const formula of teoria.formulas) {
          conferir(formula.tex, `${topico}/${teoria.id}`);
        }
        for (const passo of teoria.demonstracao) {
          conferir(passo.tex, `${topico}/${teoria.id}`);
        }
      }
    }

    for (const [topico, gerador] of TODOS_OS_GERADORES) {
      for (const nivel of NIVEIS) {
        const rng = criarRng(271_828);
        for (let i = 0; i < 20; i++) {
          const exercicio = gerador.gerar(nivel, rng);
          conferir(exercicio.enunciadoTex, `${topico}/${nivel}`);
          for (const passo of exercicio.resolucao.passos) {
            conferir(passo.tex, `${topico}/${nivel}`);
          }
        }
      }
    }

    expect(suspeitas).toEqual([]);
  });
});
