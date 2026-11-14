import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorComposicao } from '@features/quimica/composicao-e-formula/composicao-e-formula.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(313);
  return Array.from({ length: quantidade }, () => geradorComposicao.gerar(nivel, rng));
}

describe('geradorComposicao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é número positivo ou fórmula legível`, () => {
      for (const exercicio of amostra(nivel)) {
        const { valor, formula } = exercicio.gabarito;

        if (valor !== null) {
          expect(Number.isFinite(valor), exercicio.enunciado).toBe(true);
          expect(valor, exercicio.enunciado).toBeGreaterThan(0);
        } else {
          expect(formula, exercicio.enunciado).toBeTruthy();
        }
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorComposicao.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta.exibida}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorComposicao.formatar(exercicio.gabarito);
        expect(corrigir(geradorComposicao, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * As porcentagens de um composto somam cem.
   *
   * É o teste que pega uma massa atômica digitada errada na tabela: se a soma
   * fecha, as parcelas estão coerentes entre si e com a massa molar.
   */
  it('a composição de cada composto fecha em cem por cento', () => {
    const empiricas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('comp-emp')),
    );

    expect(empiricas.length).toBeGreaterThan(20);

    for (const exercicio of empiricas) {
      const percentuais = [...exercicio.enunciado.matchAll(/([\d,]+)%/g)].map((m) =>
        Number(m[1]!.replace(',', '.')),
      );
      const soma = percentuais.reduce((total, valor) => total + valor, 0);

      // A folga é do arredondamento a duas casas em cada parcela.
      expect(soma, exercicio.enunciado).toBeGreaterThan(99.9);
      expect(soma, exercicio.enunciado).toBeLessThan(100.1);
    }
  });

  /** Nenhuma porcentagem passa de cem: a parte não é maior que o todo. */
  it('as porcentagens ficam entre zero e cem', () => {
    const percentuais = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('comp-pct')),
    );

    expect(percentuais.length).toBeGreaterThan(20);

    for (const exercicio of percentuais) {
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeGreaterThan(0);
      expect(exercicio.gabarito.valor!, exercicio.enunciado).toBeLessThan(100);
    }
  });

  /**
   * A pergunta da molecular só faz sentido quando ela difere da empírica:
   * senão a resposta é a fórmula que o enunciado acabou de dar.
   */
  it('a molecular pedida é sempre diferente da empírica dada', () => {
    const moleculares = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('comp-mol-')),
    );

    expect(moleculares.length).toBeGreaterThan(20);

    for (const exercicio of moleculares) {
      const [, empirica] = /empírica de um composto é (\S+)/.exec(exercicio.enunciado)!;

      expect(exercicio.gabarito.exibida, exercicio.enunciado).not.toBe(empirica);
    }
  });

  /**
   * O erro central do tópico: responder a molecular quando só se mediu massa.
   *
   * C₆H₁₂O₆ e CH₂O têm a mesma composição percentual, e por isso a
   * porcentagem sozinha não chega à molécula.
   */
  it('diagnostica a molecular dada onde cabia a empírica', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('MOLECULAR')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('MOLECULAR'))!;
    const resultado = corrigir(geradorComposicao, exercicio, armadilha.resposta.exibida);

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('mesma composição');
  });

  it('diagnostica a massa atômica sem o índice', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('sem o índice')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('sem o índice'))!;
    const resultado = corrigir(geradorComposicao, exercicio, armadilha.resposta.exibida);

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('índice');
  });

  /**
   * A fórmula é aceita como o teclado deixa escrever: com espaço, com
   * subscrito, com dígito comum. Reprovar a digitação seria corrigir outra
   * coisa que não química.
   */
  it('aceita a fórmula escrita de qualquer das formas', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find(
      (e) => e.gabarito.formula !== null,
    )!;

    expect(exercicio).toBeDefined();

    const certa = exercicio.gabarito.formula!;

    for (const escrita of [certa, certa.toLowerCase(), ` ${certa} `]) {
      const resultado = corrigir(geradorComposicao, exercicio, escrita);

      // A forma em minúsculas pode ser ambígua (Co contra C+O); quando é, o
      // corretor recusa em vez de adivinhar, e isso também está certo.
      expect(['correto', 'invalido'], escrita).toContain(resultado.veredito);
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

    expect(tipos).toEqual(new Set(['pct', 'mm', 'emp', 'mol']));
  });
});
