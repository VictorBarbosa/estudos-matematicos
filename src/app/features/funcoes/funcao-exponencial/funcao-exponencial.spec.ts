import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorExponencial } from '@features/funcoes/funcao-exponencial/funcao-exponencial.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(3030);
  return Array.from({ length: quantidade }, () => geradorExponencial.gerar(nivel, rng));
}

describe('geradorExponencial', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e não nulo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
        expect(exercicio.gabarito).not.toBe(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorExponencial.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
          ).toBe(false);
        }
      }
    });
  }

  it('o valor em x = 0 é sempre o coeficiente inicial', () => {
    const sobreInicial = amostra('facil', 80).filter((e) => e.enunciado.includes('x = 0'));

    for (const exercicio of sobreInicial) {
      const [, coeficiente] = /f\(x\) = (?:(\d+) \\cdot )?/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBe(coeficiente === undefined ? 1 : Number(coeficiente));
    }
  });

  it('no nível difícil aparecem expoentes negativos', () => {
    const comNegativo = amostra('dificil', 120).filter((e) => e.enunciado.includes('f(-'));
    expect(comNegativo.length).toBeGreaterThan(0);
  });

  it('aceita a resposta escrita como fração', () => {
    expect(geradorExponencial.analisar('1/8')).toBeCloseTo(0.125);
    expect(geradorExponencial.analisar('0,25')).toBeCloseTo(0.25);
  });

  it('diagnostica quem multiplica em vez de elevar', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('multiplicação')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('multiplicação'),
    )!;

    const resultado = corrigir(geradorExponencial, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toContain('exponencial');
  });

  it('diagnostica quem acha que f(0) é zero', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.resposta === 0),
    )!;

    const resultado = corrigir(geradorExponencial, exercicio, '0');
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('UM');
  });

  it('aceita o tempo de duplicação arredondado em 2 casas, como o enunciado pede', () => {
    const rng = criarRng(606);
    const duplicacoes = Array.from({ length: 200 }, () =>
      geradorExponencial.gerar('dificil', rng),
    ).filter((e) => e.enunciado.includes('DOBRAR'));

    expect(duplicacoes.length).toBeGreaterThan(10);

    for (const exercicio of duplicacoes) {
      const comDuasCasas = exercicio.gabarito.toFixed(2).replace('.', ',');
      expect(corrigir(geradorExponencial, exercicio, comDuasCasas).veredito).toBe('correto');
    }
  });
});
