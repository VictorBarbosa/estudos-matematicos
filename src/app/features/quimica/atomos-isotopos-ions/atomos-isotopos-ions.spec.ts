import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorAtomos } from '@features/quimica/atomos-isotopos-ions/atomos-isotopos-ions.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1789);
  return Array.from({ length: quantidade }, () => geradorAtomos.gerar(nivel, rng));
}

describe('geradorAtomos', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e não negativo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);
        expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThanOrEqual(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorAtomos.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorAtomos.formatar(exercicio.gabarito);
        expect(corrigir(geradorAtomos, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * As contagens fecham entre si.
   *
   * É a verificação que vale mais num tópico de contagem: prótons mais
   * nêutrons têm de dar o número de massa, e elétrons só diferem de prótons
   * pela carga. Se o gerador sorteasse um isótopo impossível, isto acusaria.
   */
  it('os nêutrons pedidos conferem com A − Z', () => {
    const comNeutrons = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('quim-neutrons')),
    );

    expect(comNeutrons.length).toBeGreaterThan(20);

    for (const exercicio of comNeutrons) {
      const [, z, a] = /Z = (\d+) \\qquad A = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(Number(a) - Number(z));
      expect(exercicio.gabarito).toBeGreaterThanOrEqual(0);
    }
  });

  it('os elétrons do íon conferem com Z − carga', () => {
    const comIons = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('quim-eletrons')),
    );

    expect(comIons.length).toBeGreaterThan(20);

    for (const exercicio of comIons) {
      const [, z, valor, sinal] = /Z = (\d+) \\qquad \\text\{carga\} = (\d+)([+-])/.exec(
        exercicio.enunciadoTex,
      )!;
      const carga = sinal === '+' ? Number(valor) : -Number(valor);

      expect(exercicio.gabarito).toBe(Number(z) - carga);
    }
  });

  /**
   * A média ponderada nunca sai fora do intervalo das massas.
   *
   * É o teste que pega o erro de montar a ponderação ao contrário: trocar os
   * pesos dá um valor dentro do intervalo, mas inverter massa por abundância
   * sai dele na hora.
   */
  it('a massa média fica entre as duas massas', () => {
    const comMedia = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('quim-media')),
    );

    expect(comMedia.length).toBeGreaterThan(20);

    for (const exercicio of comMedia) {
      const [, m1, , m2] = /^(\d+) (\\;)\(\d+\\%\) \\qquad (\d+)/.exec(exercicio.enunciadoTex)!;
      const menor = Math.min(Number(m1), Number(m2));
      const maior = Math.max(Number(m1), Number(m2));

      expect(exercicio.gabarito).toBeGreaterThan(menor);
      expect(exercicio.gabarito).toBeLessThan(maior);
    }
  });

  /**
   * O erro clássico do tópico tem nome.
   *
   * Média simples em vez de ponderada é o que todo mundo faz na primeira vez,
   * e responder «não é isso» a isso desperdiça o melhor momento de ensino.
   */
  it('diagnostica a média simples', () => {
    const exercicio = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('quim-media')),
    ).find((e) => e.armadilhas.some((a) => a.diagnostico.includes('média SIMPLES')))!;

    expect(exercicio, 'nenhum exercício de média na amostra').toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('média SIMPLES'))!;
    const resultado = corrigir(
      geradorAtomos,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('abundância é peso');
  });

  it('diagnostica o sinal da carga trocado', () => {
    const exercicio = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('quim-eletrons')),
    ).find((e) => e.armadilhas.some((a) => a.diagnostico.includes('FALTA')))!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('FALTA'))!;
    const resultado = corrigir(geradorAtomos, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('subtraindo');
  });

  it('as quatro perguntas aparecem, e as três línguas também', () => {
    const todos = NIVEIS.flatMap((nivel) => amostra(nivel, 80));
    const tipos = new Set(todos.map((e) => e.id.split('-')[1]));

    expect(tipos).toEqual(new Set(['neutrons', 'eletrons', 'massa', 'media']));

    for (const exercicio of todos) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
    }
  });
});
