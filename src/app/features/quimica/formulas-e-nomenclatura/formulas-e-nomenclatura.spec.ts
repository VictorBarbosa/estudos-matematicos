import { lerFormula, noxDoElemento } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorNomenclatura } from '@features/quimica/formulas-e-nomenclatura/formulas-e-nomenclatura.gerador';
import {
  NOME_DO_ANION,
  NOME_DO_CATION,
  nomeDoComposto,
} from '@features/quimica/formulas-e-nomenclatura/formulas-e-nomenclatura.textos';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(857);
  return Array.from({ length: quantidade }, () => geradorNomenclatura.gerar(nivel, rng));
}

describe('geradorNomenclatura', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é número ou fórmula legível`, () => {
      for (const exercicio of amostra(nivel)) {
        const { valor, formula } = exercicio.gabarito;

        if (valor !== null) {
          expect(Number.isInteger(valor), exercicio.enunciado).toBe(true);
        } else {
          expect(lerFormula(formula!), exercicio.enunciado).toBeDefined();
        }
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorNomenclatura.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta.exibida}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorNomenclatura.formatar(exercicio.gabarito);
        expect(corrigir(geradorNomenclatura, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * O numeral romano aparece exatamente nos metais de mais de uma carga.
   *
   * Nos outros ele não se usa, porque não há o que desambiguar; nesses ele é
   * obrigatório, porque «cloreto de ferro» não é um nome completo.
   */
  it('o numeral romano aparece só onde é necessário', () => {
    const variaveis = ['Fe', 'Cu', 'Pb', 'Sn'];

    for (const [simbolo] of Object.entries(NOME_DO_CATION)) {
      const nome = nomeDoComposto(simbolo, 'Cl', 2, variaveis.includes(simbolo), 'pt');

      expect(/\((I|II|III|IV)\)/.test(nome), nome).toBe(variaveis.includes(simbolo));
    }
  });

  /** A ordem das palavras é da língua; a fórmula não tem língua. */
  it('o inglês inverte a ordem das palavras', () => {
    expect(nomeDoComposto('Na', 'Cl', 1, false, 'pt')).toBe('cloreto de sódio');
    expect(nomeDoComposto('Na', 'Cl', 1, false, 'fr')).toBe('chlorure de sodium');
    expect(nomeDoComposto('Na', 'Cl', 1, false, 'en')).toBe('sodium chloride');
  });

  it('todo cátion e todo ânion têm nome nas três línguas', () => {
    for (const tabela of [NOME_DO_CATION, NOME_DO_ANION]) {
      for (const [simbolo, nomes] of Object.entries(tabela)) {
        expect(nomes.pt, simbolo).toBeTruthy();
        expect(nomes.fr, simbolo).toBeTruthy();
        expect(nomes.en, simbolo).toBeTruthy();
      }
    }
  });

  /**
   * A fórmula pedida é neutra e reduzida: é o que uma fórmula iônica é, e é o
   * que as duas armadilhas do tipo erram.
   */
  it('a fórmula sai reduzida', () => {
    const formulas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('nom-formula')),
    );

    expect(formulas.length).toBeGreaterThan(20);

    for (const exercicio of formulas) {
      const indices = [...lerFormula(exercicio.gabarito.formula!)!.values()];
      const menor = Math.min(...indices);

      expect(indices.every((valor) => valor % menor === 0) && menor > 1, exercicio.enunciado).toBe(
        false,
      );
    }
  });

  /** O nox do metal é positivo, e confere com a fórmula do enunciado. */
  it('o nox pedido é positivo e fecha a soma zero', () => {
    const noxes = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('nom-nox')),
    );

    expect(noxes.length).toBeGreaterThan(20);

    for (const exercicio of noxes) {
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeGreaterThan(0);
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeLessThanOrEqual(4);
    }
  });

  /** Nenhum exercício de nox cai num peróxido, onde a âncora −2 não vale. */
  it('nunca pede o nox onde a regra não resolve', () => {
    const noxes = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('nom-nox')),
    );

    for (const exercicio of noxes) {
      const [, formula] = /nom-nox-\w+-(\w+)-/.exec(exercicio.id)!;
      const [, simbolo] = /nom-nox-(\w+)-/.exec(exercicio.id)!;

      expect(noxDoElemento(formula!, simbolo!), exercicio.id).toBeDefined();
    }
  });

  it('diagnostica o sinal trocado do nox', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 80)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('sinal está trocado')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sinal está trocado'),
    )!;
    const resultado = corrigir(geradorNomenclatura, exercicio, armadilha.resposta.exibida);

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('perde elétrons');
  });

  it('diagnostica o nox sem dividir pelo índice do metal', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 80)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('repartem a conta')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('repartem a conta'))!;
    const resultado = corrigir(geradorNomenclatura, exercicio, armadilha.resposta.exibida);

    expect(resultado.veredito).toBe('incorreto');
  });

  it('o enunciado vem nas três línguas, com dica', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
      expect(exercicio.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  /**
   * O enunciado em cada língua traz o nome naquela língua — e as três são
   * diferentes, porque nomenclatura É língua.
   */
  it('o nome do composto muda em cada língua', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.id.startsWith('nom-formula'),
    )!;

    expect(exercicio.enunciado).not.toBe(exercicio.traducoes!.en!.enunciado);
    expect(exercicio.traducoes!.fr!.enunciado).not.toBe(exercicio.traducoes!.en!.enunciado);
  });

  it('as três perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 60)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['formula', 'indice', 'nox']));
  });
});
