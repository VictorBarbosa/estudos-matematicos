import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { NIVEIS } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';
import { formaDaPergunta } from '@core/prova/models/prova.model';

/**
 * Toda forma de pergunta tem dica no nível em que estreia.
 *
 * A dica é o que segura quem vê uma pergunta pela primeira vez; ela não precisa
 * aparecer nos níveis seguintes, mas no de estreia, sim. Em 09/11/2026, 573
 * das 1046 formas estreavam sem nenhuma.
 *
 * Foi uma catraca enquanto havia pendências; em 10/11/2026 a lista zerou e a
 * regra passou a ser absoluta. Quem cria uma pergunta já a cria com dica.
 *
 * «Forma» é o enunciado com os números trocados por N (a mesma régua da prova
 * final), e «estreia» é o primeiro nível, do Fácil ao Extremo, em que ela é
 * sorteada numa amostra fixa.
 */
const AMOSTRA_POR_NIVEL = 120;
const SEMENTE = 20261109;

function formasSemDicaNaEstreia(): Map<string, string[]> {
  const resultado = new Map<string, string[]>();

  for (const [topico, gerador] of TODOS_OS_GERADORES) {
    const rng = criarRng(SEMENTE);
    const estreia = new Map<string, { nivel: string; comDica: boolean }>();

    for (const nivel of NIVEIS) {
      const noNivel = new Map<string, boolean>();
      for (let i = 0; i < AMOSTRA_POR_NIVEL; i++) {
        const exercicio = gerador.gerar(nivel, rng);
        const forma = formaDaPergunta(exercicio.enunciado);
        noNivel.set(forma, (noNivel.get(forma) ?? false) || !!exercicio.dica);
      }
      for (const [forma, comDica] of noNivel) {
        if (!estreia.has(forma)) estreia.set(forma, { nivel, comDica });
      }
    }

    const sem = [...estreia]
      .filter(([, { comDica }]) => !comDica)
      .map(([forma, { nivel }]) => `${nivel} | ${forma}`)
      .sort();
    if (sem.length > 0) resultado.set(topico, sem);
  }

  return resultado;
}

describe('dicas na estreia de cada forma de pergunta', () => {
  it('nenhuma forma de pergunta estreia sem dica', () => {
    const sem: string[] = [];
    for (const [topico, formas] of formasSemDicaNaEstreia()) {
      sem.push(...formas.map((f) => `${topico}: ${f}`));
    }
    expect(sem).toEqual([]);
  }, 120_000);
});
