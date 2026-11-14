import { balancear, estaBalanceada } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import {
  EQUACOES_DO_TOPICO,
  geradorBalanceamento,
} from '@features/quimica/equacoes-e-balanceamento/equacoes-e-balanceamento.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(181);
  return Array.from({ length: quantidade }, () => geradorBalanceamento.gerar(nivel, rng));
}

describe('geradorBalanceamento', () => {
  /**
   * A tabela de equações é a parte perigosa do tópico: uma equação impossível
   * ou ambígua viraria exercício sem resposta. O teste confere todas, uma por
   * uma, e é ele que autoriza acrescentar equações à lista.
   */
  it('cada equação da tabela balanceia de um jeito só', () => {
    for (const { reagentes, produtos } of EQUACOES_DO_TOPICO) {
      const coeficientes = balancear(reagentes, produtos);
      const nome = `${reagentes.join(' + ')} → ${produtos.join(' + ')}`;

      expect(coeficientes, nome).toBeDefined();
      expect(estaBalanceada(reagentes, produtos, coeficientes!), nome).toBe(true);
      expect(
        coeficientes!.every((valor) => Number.isInteger(valor) && valor > 0),
        nome,
      ).toBe(true);
    }
  });

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro positivo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito), exercicio.enunciado).toBe(true);
        expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorBalanceamento.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorBalanceamento.formatar(exercicio.gabarito);
        expect(corrigir(geradorBalanceamento, exercicio, escrito).veredito, escrito).toBe(
          'correto',
        );
      }
    });
  }

  /**
   * A equação do enunciado vem CRUA: pôr os coeficientes ali responderia a
   * pergunta antes de ela ser feita.
   */
  it('a equação do enunciado não traz coeficientes', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.enunciadoTex, exercicio.enunciado).toContain('\\to');
      expect(exercicio.enunciadoTex, exercicio.enunciado).not.toContain('\\,');
    }
  });

  /**
   * A espécie perguntada tem coeficiente maior que um: perguntar por uma de
   * coeficiente 1 deixaria a resposta certa por preguiça.
   */
  it('o coeficiente pedido nunca é um', () => {
    const coeficientes = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('bal-coef')),
    );

    expect(coeficientes.length).toBeGreaterThan(20);

    for (const exercicio of coeficientes) {
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(1);
    }
  });

  /** A soma leva os dois lados, e por isso é maior que o número de espécies. */
  it('a soma dos coeficientes é maior que a contagem de substâncias', () => {
    const somas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('bal-soma')),
    );

    expect(somas.length).toBeGreaterThan(20);

    for (const exercicio of somas) {
      const substancias = exercicio.enunciadoTex.split(/\+|\\to/).length;

      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(substancias);
    }
  });

  it('diagnostica os índices somados sem os coeficientes', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('sem os coeficientes')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sem os coeficientes'),
    )!;
    const resultado = corrigir(geradorBalanceamento, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('multiplicam');
  });

  it('diagnostica a soma de um lado só', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('lado esquerdo')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('lado esquerdo'))!;
    const resultado = corrigir(geradorBalanceamento, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('dois lados');
  });

  it('o enunciado vem nas três línguas, com dica', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
      expect(exercicio.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  it('as três perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 60)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['coef', 'soma', 'atomos']));
  });
});
