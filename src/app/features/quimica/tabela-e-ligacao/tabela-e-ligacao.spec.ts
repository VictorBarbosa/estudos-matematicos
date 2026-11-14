import { ELEMENTOS, cargaMaisProvavel, grupo, lerFormula } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorLigacao } from '@features/quimica/tabela-e-ligacao/tabela-e-ligacao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(617);
  return Array.from({ length: quantidade }, () => geradorLigacao.gerar(nivel, rng));
}

describe('geradorLigacao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é número ou fórmula legível`, () => {
      for (const exercicio of amostra(nivel)) {
        const { valor, formula } = exercicio.gabarito;

        if (valor !== null) {
          expect(Number.isFinite(valor), exercicio.enunciado).toBe(true);
        } else {
          expect(lerFormula(formula!), exercicio.enunciado).toBeDefined();
        }
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorLigacao.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta.exibida}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorLigacao.formatar(exercicio.gabarito);
        expect(corrigir(geradorLigacao, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /** O grupo pedido está sempre entre 1 e 18. */
  it('o grupo fica na faixa da tabela', () => {
    const grupos = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('lig-grupo')),
    );

    expect(grupos.length).toBeGreaterThan(20);

    for (const exercicio of grupos) {
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeGreaterThanOrEqual(1);
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeLessThanOrEqual(18);
    }
  });

  /**
   * Nenhuma pergunta de grupo ou carga vai para um elemento em que a leitura
   * pela última camada não vale — o bloco d fica de fora por construção.
   */
  it('só sorteia elementos de grupo definido', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      const simbolos = [...exercicio.enunciado.matchAll(/(\w+) \(Z = (\d+)\)/g)];

      for (const [, , z] of simbolos) {
        expect(grupo(Number(z)), exercicio.enunciado).toBeDefined();
      }
    }
  });

  /** A carga vem com sinal, e nunca é zero. */
  it('a carga pedida é positiva ou negativa, nunca nula', () => {
    const cargas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('lig-carga')),
    );

    expect(cargas.length).toBeGreaterThan(10);

    for (const exercicio of cargas) {
      expect(exercicio.gabarito.valor!, exercicio.enunciado).not.toBe(0);
      expect(Math.abs(exercicio.gabarito.valor!), exercicio.enunciado).toBeLessThanOrEqual(3);
    }
  });

  /**
   * O composto da pergunta é NEUTRO e está reduzido: é o que uma fórmula
   * iônica é, e o que as duas armadilhas do tipo erram.
   */
  it('o composto iônico sai neutro e reduzido', () => {
    const formulas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('lig-formula')),
    );

    expect(formulas.length).toBeGreaterThan(20);

    for (const exercicio of formulas) {
      const composicao = lerFormula(exercicio.gabarito.formula!)!;
      const simbolos = [...composicao.keys()];

      let soma = 0;
      for (const simbolo of simbolos) {
        const { numeroAtomico } = ELEMENTOS.find((atual) => atual.simbolo === simbolo)!;
        soma += cargaMaisProvavel(numeroAtomico)! * composicao.get(simbolo)!;
      }

      expect(soma, exercicio.enunciado).toBe(0);

      // Reduzido: os dois índices não têm divisor comum maior que um.
      const indices = [...composicao.values()];
      const menor = Math.min(...indices);
      expect(indices.every((valor) => valor % menor === 0) && menor > 1, exercicio.enunciado).toBe(
        false,
      );
    }
  });

  /** O hidrogênio não entra como cátion: HCl não é composto iônico. */
  it('nunca pede o composto iônico do hidrogênio', () => {
    const formulas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('lig-formula')),
    );

    for (const exercicio of formulas) {
      expect(exercicio.gabarito.formula!, exercicio.enunciado).not.toMatch(/^H/);
    }
  });

  it('diagnostica o cruzamento sem reduzir', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 80)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('falta reduzir')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('falta reduzir'))!;
    const resultado = corrigir(geradorLigacao, exercicio, armadilha.resposta.exibida);

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('PROPORÇÃO');
  });

  it('diagnostica o sinal trocado da carga', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 80)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('sinal está trocado')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sinal está trocado'),
    )!;
    const resultado = corrigir(geradorLigacao, exercicio, armadilha.resposta.exibida);

    expect(resultado.veredito).toBe('incorreto');
  });

  /**
   * A diferença de eletronegatividade é pergunta; o RÓTULO da ligação não é.
   * A régua de 1,7 é convenção de ensino, e cobrá-la como fato seria ensinar
   * uma fronteira onde há uma faixa.
   */
  it('a diferença é sempre positiva, e o rótulo não é cobrado', () => {
    const deltas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('lig-delta')),
    );

    expect(deltas.length).toBeGreaterThan(20);

    for (const exercicio of deltas) {
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeGreaterThanOrEqual(0);
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeLessThan(4);
      expect(exercicio.enunciado, exercicio.enunciado).not.toContain('iônica');
    }
  });

  it('o enunciado vem nas três línguas, com dica', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
      expect(exercicio.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  it('as quatro perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 60)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['grupo', 'carga', 'formula', 'delta']));
  });
});
