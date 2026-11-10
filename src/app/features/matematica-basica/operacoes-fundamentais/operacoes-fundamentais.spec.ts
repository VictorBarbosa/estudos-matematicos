import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, SEM_FORMULA, corrigir } from '@core/treino/models/treino.model';
import { geradorOperacoes } from '@features/matematica-basica/operacoes-fundamentais/operacoes-fundamentais.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(777);
  return Array.from({ length: quantidade }, () => geradorOperacoes.gerar(nivel, rng));
}

describe('geradorOperacoes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro ou decimal finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, a resolução tem ao menos duas etapas`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThanOrEqual(2);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta).not.toBe(exercicio.gabarito);
        }
      }
    });
  }

  it('a armadilha da esquerda para a direita aparece na maioria dos exercícios', () => {
    const comArmadilha = amostra('facil').filter((e) => e.armadilhas.length > 0);
    expect(comArmadilha.length).toBeGreaterThan(40);
  });

  it('diagnostica quem ignora a precedência', () => {
    const exercicio = amostra('facil', 20).find((e) => e.armadilhas.length > 0)!;
    const armadilha = exercicio.armadilhas[0]!;

    const resultado = corrigir(geradorOperacoes, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('esquerda para a direita');
    expect(resultado.conceitoAssociado).toBe('operacoes.ordem');
  });

  it('a história não entrega a conta: o enunciado é só texto', () => {
    // Montar a expressão é metade do exercício; exibi-la responderia a parte
    // que a situação existe para treinar.
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 120)) {
        if (exercicio.id.includes('historia')) {
          expect(exercicio.enunciadoTex, exercicio.enunciado).toBe(SEM_FORMULA);
          expect(exercicio.enunciado.length).toBeGreaterThan(40);
          expect(exercicio.enunciado.trim().endsWith('?')).toBe(true);
        }
      }
    }
  });

  it('todo nível mistura a conta escrita com a conta contada', () => {
    for (const nivel of NIVEIS) {
      const exercicios = amostra(nivel, 200);
      const comHistoria = exercicios.filter((e) => e.id.includes('historia'));

      expect(comHistoria.length, nivel).toBeGreaterThan(40);
      expect(comHistoria.length, nivel).toBeLessThan(160);
    }
  });

  it('as histórias existem em francês e inglês', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 80).filter((e) => e.id.includes('historia'))) {
        expect(exercicio.traducoes?.fr?.enunciado.length ?? 0).toBeGreaterThan(40);
        expect(exercicio.traducoes?.en?.enunciado.length ?? 0).toBeGreaterThan(40);
      }
    }
  });

  it('aceita negativos e decimais', () => {
    expect(geradorOperacoes.analisar('-3')).toBe(-3);
    expect(geradorOperacoes.analisar('2,5')).toBeCloseTo(2.5);
    expect(geradorOperacoes.analisar('2 + 3')).toBeNull();
  });
});
