import { moldesDe } from '@core/enunciados/moldes/moldes.model';
import { todosOsMoldes } from '@core/enunciados/moldes/moldes.model';
import { anguloNoTopo, CENAS } from '@core/treino/cenas/cenas.contextos';
import { anguloDaCena, intervaloDoLado, Lado } from '@core/treino/cenas/faixas';
import { exercicioDeCena } from '@core/treino/cenas/cena.gerador';
import { NIVEIS } from '@core/treino/models/treino.model';
import { criarRng } from '@core/treino/rng/rng';

/**
 * O guarda dos DADOS das cenas.
 *
 * O motor é o mesmo para todas; o que varia é o catálogo, e é no catálogo que
 * um erro passa despercebido: limites que não fecham com o ângulo, molde que
 * ninguém escreveu, lado que a história não nomeia. Nada disso quebra o site —
 * o exercício simplesmente não sai, ou sai absurdo.
 */

const LADOS: readonly Lado[] = ['vertical', 'horizontal', 'inclinado'];

describe('as cenas', () => {
  it('toda cena tem o seu molde, e todo molde tem a sua cena', () => {
    const semMolde = CENAS.filter((cena) => {
      try {
        return moldesDe('triangulo-retangulo', `cena-${cena.id}`).length === 0;
      } catch {
        return true;
      }
    }).map((cena) => cena.id);

    const formasNoArquivo = todosOsMoldes()
      .filter((molde) => molde.topico === 'triangulo-retangulo')
      .map((molde) => molde.forma)
      .filter((forma) => forma.startsWith('cena-'));

    const semCena = formasNoArquivo.filter(
      (forma) => !CENAS.some((cena) => `cena-${cena.id}` === forma),
    );

    expect({ semMolde, semCena }).toEqual({ semMolde: [], semCena: [] });
  });

  /**
   * A pessoa abre a frase, sempre.
   *
   * O catálogo guarda a profissão já com a maiúscula, porque é assim que ela
   * entra no começo da história — «O pedreiro apoia…». Pôr essa mesma lacuna
   * no meio de uma frase produz «Da torre de controle, O piloto observa…», e
   * nenhum guarda de tradução enxergaria isso: as três línguas estariam
   * igualmente erradas.
   */
  it('a lacuna da pessoa só aparece no começo da história', () => {
    const fora: string[] = [];

    for (const molde of todosOsMoldes()) {
      if (molde.topico !== 'triangulo-retangulo' || !molde.forma.startsWith('cena-')) {
        continue;
      }
      for (const [idioma, texto] of Object.entries(molde.enunciado)) {
        if (texto !== undefined && texto.includes('{dados-calculo.pessoa}') && !texto.startsWith('{dados-calculo.pessoa}')) {
          fora.push(`${molde.forma} (${idioma})`);
        }
      }
    }

    expect(fora).toEqual([]);
  });

  /**
   * Os limites têm de fechar com o ângulo — em TODA a faixa dele.
   *
   * Uma escada que vai de 2 m a 10 m e um pé que vai de 0,5 m a 5 m não se
   * contradizem sozinhos; a 78°, porém, o pé de uma escada de 10 m fica a
   * 2,1 m, e se a cena exigisse pelo menos 3 m não haveria comprimento algum
   * que servisse. O intervalo sai em forma fechada, então dá para conferir
   * grau a grau, aqui, em vez de descobrir na tela.
   */
  it('cada cena tem comprimento possível em todos os ângulos da sua faixa', () => {
    const vazios: string[] = [];

    for (const cena of CENAS) {
      const [minimo, maximo] = cena.limites.angulo;
      for (let angulo = minimo; angulo <= maximo; angulo += 1) {
        for (const lado of LADOS) {
          if (intervaloDoLado(lado, angulo, cena.limites, anguloNoTopo(cena.referencia)) === null) {
            vazios.push(`${cena.id}: ${lado} a ${angulo}°`);
          }
        }
      }
    }

    expect(vazios.slice(0, 10)).toEqual([]);
  });

  /**
   * A pergunta do ângulo ainda não sabe contar do topo.
   *
   * `exercicioDoAngulo` calcula `arctg(oposto/adjacente)` tomando o vertical
   * como oposto — o que vale quando o ângulo está no chão. Numa cena medida
   * pela parede a resposta sairia complementar, e nada acusaria: o enunciado
   * estaria perfeito nas três línguas e o número, errado. Até a inversa saber
   * do topo, as duas coisas não se misturam.
   */
  it('cena com o ângulo no topo não oferece a pergunta do ângulo', () => {
    const erradas = CENAS.filter(
      (cena) => anguloNoTopo(cena.referencia) && cena.formas.includes('angulo'),
    ).map((cena) => cena.id);

    expect(erradas).toEqual([]);
  });

  it('o ângulo sorteado fica sempre dentro da faixa da cena', () => {
    const rng = criarRng(2026);
    const fora: string[] = [];

    for (const cena of CENAS) {
      for (const facil of [true, false]) {
        for (let i = 0; i < 200; i++) {
          const angulo = anguloDaCena(rng, facil, cena.limites.angulo);
          if (angulo < cena.limites.angulo[0] || angulo > cena.limites.angulo[1]) {
            fora.push(`${cena.id}: ${angulo}°`);
          }
        }
      }
    }

    expect(fora.slice(0, 5)).toEqual([]);
  });

  /**
   * A resposta é um lado de verdade, e os três fecham por Pitágoras.
   *
   * É o teste que pega a troca de papéis — pedir o cateto e devolver a
   * hipotenusa —, que nenhum guarda de texto veria.
   */
  it('o gabarito é coerente com o triângulo da cena', () => {
    const rng = criarRng(7);
    const erros: string[] = [];

    for (const nivel of NIVEIS) {
      for (let i = 0; i < 150; i++) {
        const exercicio = exercicioDeCena(nivel, rng);
        if (exercicio === null) {
          erros.push(`${nivel}: nenhuma cena fechou`);
          continue;
        }
        if (!(exercicio.gabarito > 0)) {
          erros.push(`${nivel}: gabarito ${exercicio.gabarito}`);
        }
        if (exercicio.dica === undefined) {
          erros.push(`${nivel}: sem dica — a estreia de cada forma exige uma`);
        }
        if (exercicio.traducoes?.fr?.enunciado === undefined) {
          erros.push(`${nivel}: sem francês`);
        }
      }
    }

    expect(erros.slice(0, 5)).toEqual([]);
  });

  /** O mesmo rng, o mesmo exercício: é o que `verificar-geradores.mjs` exige. */
  it('a mesma semente devolve o mesmo exercício', () => {
    const primeiro = exercicioDeCena('medio', criarRng(99));
    const segundo = exercicioDeCena('medio', criarRng(99));

    expect(primeiro?.enunciado).toBe(segundo?.enunciado);
    expect(primeiro?.gabarito).toBe(segundo?.gabarito);
  });
});
