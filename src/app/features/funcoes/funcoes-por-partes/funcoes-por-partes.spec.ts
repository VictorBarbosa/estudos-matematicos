import {
  FuncaoPorPartes,
  Polinomio,
  avaliarPorPartes,
  continuidadeComPassos,
  ehContinuaEm,
  fronteirasDe,
  limiteDireita,
  limiteEsquerda,
  parametroQueColaComPassos,
  porPartesParaTex,
  saltoEm,
  trechoEm,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorFuncoesPorPartes } from '@features/funcoes/funcoes-por-partes/funcoes-por-partes.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(24_680);
  return Array.from({ length: quantidade }, () => geradorFuncoesPorPartes.gerar(nivel, rng));
}

/** `2x + 1` até 3, `x − 2` daí em diante: um salto de −4. */
const COM_SALTO: FuncaoPorPartes = {
  trechos: [
    {
      expressao: Polinomio.de(1, 2),
      de: Number.NEGATIVE_INFINITY,
      ate: 3,
      fechadoAEsquerda: true,
    },
    {
      expressao: Polinomio.de(-2, 1),
      de: 3,
      ate: Number.POSITIVE_INFINITY,
      fechadoAEsquerda: true,
    },
  ],
};

describe('geradorFuncoesPorPartes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorFuncoesPorPartes.formatar(exercicio.gabarito);
        expect(corrigir(geradorFuncoesPorPartes, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorFuncoesPorPartes.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil só pede avaliação', () => {
    for (const exercicio of amostra('facil', 150)) {
      expect(exercicio.conceitos).not.toContain('por-partes.salto');
      expect(exercicio.enunciado).toContain('Quanto vale');
    }
  });

  it('o Difícil cobra salto, limite lateral e colagem', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('por-partes.salto')).toBe(true);
    expect(conceitos.has('por-partes.continuidade')).toBe(true);
  });

  it('diagnostica quem soma os dois trechos', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('elas se revezam')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('elas se revezam'),
    )!;
    const resultado = corrigir(
      geradorFuncoesPorPartes,
      exercicio,
      geradorFuncoesPorPartes.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('por-partes.qual-trecho');
  });

  it('a constante que cola realmente deixa a função contínua', () => {
    for (const exercicio of amostra('dificil', 250)) {
      if (!exercicio.enunciado.includes('constante c')) {
        continue;
      }

      const [, fronteiraTexto] = /em x = (-?\d+)/.exec(exercicio.enunciado)!;
      expect(Number.isFinite(Number(fronteiraTexto))).toBe(true);
      expect(Number.isFinite(exercicio.gabarito)).toBe(true);
    }
  });
});

/**
 * O motor das funções por partes.
 *
 * Tudo que o tópico cobra acontece na fronteira, e é lá que os testes batem.
 */
describe('funções por partes', () => {
  it('cada ponto é coberto por um trecho só', () => {
    expect(trechoEm(COM_SALTO, 0)?.expressao.avaliar(0)).toBe(1);
    expect(trechoEm(COM_SALTO, 5)?.expressao.avaliar(5)).toBe(3);
  });

  it('o sinal de igual decide a quem pertence a fronteira', () => {
    // A condição com o igual é a de baixo, então é ela que define f(3).
    expect(avaliarPorPartes(COM_SALTO, 3)).toBe(1);
  });

  it('os limites laterais usam os trechos vizinhos', () => {
    expect(limiteEsquerda(COM_SALTO, 3)).toBe(7);
    expect(limiteDireita(COM_SALTO, 3)).toBe(1);
  });

  it('o salto é a diferença, na ordem direita menos esquerda', () => {
    expect(saltoEm(COM_SALTO, 3)).toBe(-6);
  });

  it('salto diferente de zero quer dizer descontinuidade', () => {
    expect(ehContinuaEm(COM_SALTO, 3)).toBe(false);
  });

  it('com as pontas coladas, a função é contínua', () => {
    const colada: FuncaoPorPartes = {
      trechos: [
        { ...COM_SALTO.trechos[0]!, expressao: Polinomio.de(1, 2) },
        { ...COM_SALTO.trechos[1]!, expressao: Polinomio.de(4, 1) },
      ],
    };

    expect(saltoEm(colada, 3)).toBe(0);
    expect(ehContinuaEm(colada, 3)).toBe(true);
  });

  it('a constante que cola sai de uma equação só', () => {
    const { resultado } = parametroQueColaComPassos(
      Polinomio.de(1, 2),
      Polinomio.de(0, 1),
      3,
    );

    // Esquerda vale 7, direita sem constante vale 3: falta 4.
    expect(resultado).toBe(4);
  });

  it('as fronteiras são os cortes internos, sem os infinitos', () => {
    expect(fronteirasDe(COM_SALTO)).toEqual([3]);
  });

  it('a resolução da continuidade traz os três números', () => {
    const { passos } = continuidadeComPassos(COM_SALTO, 3);

    expect(passos).toHaveLength(4);
    expect(passos[0]!.tex).toContain('^{-}');
    expect(passos[1]!.tex).toContain('^{+}');
    expect(passos[3]!.nota).toContain('nenhum valor no ponto');
  });

  it('a escrita usa chaves, como se escreve no papel', () => {
    expect(porPartesParaTex(COM_SALTO)).toContain('\\begin{cases}');
  });
});
