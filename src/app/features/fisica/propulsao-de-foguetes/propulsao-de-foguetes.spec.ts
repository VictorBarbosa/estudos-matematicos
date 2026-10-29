import { tsiolkovskyComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPropulsao } from '@features/fisica/propulsao-de-foguetes/propulsao-de-foguetes.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1961);
  return Array.from({ length: quantidade }, () => geradorPropulsao.gerar(nivel, rng));
}

describe('geradorPropulsao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorPropulsao.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, o gabarito é positivo e documentado`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
      }
    });
  }

  it('o empuxo é vazão × exaustão, em kN', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('Qual é o empuxo'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, vazao, exaustao] =
        /\\dot\{m\} = (\d+)\\,\\text\{kg\/s\} \\qquad v_e = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo((Number(vazao) * Number(exaustao)) / 1000, 6);
    }
  });

  it('o impulso específico é vₑ/g₀ e fica na faixa de motores reais', () => {
    const exercicios = amostra('facil', 120).filter((e) =>
      e.enunciado.includes('impulso específico'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const exaustao = Number(/v_e = (\d+)/.exec(exercicio.enunciadoTex)![1]);

      expect(exercicio.gabarito).toBeCloseTo(exaustao / 9.81, 6);
      // Motores químicos ficam entre ~200 e ~460 s.
      expect(exercicio.gabarito).toBeGreaterThan(150);
      expect(exercicio.gabarito).toBeLessThan(500);
    }
  });

  it('o delta-v cresce com o logaritmo da razão de massas', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('delta-v disponível'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, razao, exaustao] =
        /\\frac\{m_0\}\{m_f\} = (\d+) \\qquad v_e = (\d+)/.exec(exercicio.enunciadoTex)!;

      const esperado = (Number(exaustao) * Math.log(Number(razao))) / 1000;
      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);

      // A assinatura do logaritmo: dobrar a razão de massas acrescenta sempre
      // o MESMO delta-v (vₑ·ln2), não importa de onde se parta. É isso que
      // torna cada km/s adicional progressivamente mais caro.
      const comRazaoDobrada = (Number(exaustao) * Math.log(2 * Number(razao))) / 1000;
      expect(comRazaoDobrada - esperado).toBeCloseTo((Number(exaustao) * Math.LN2) / 1000, 6);
    }
  });

  it('a razão de massas exigida cresce exponencialmente com o delta-v', () => {
    const exercicios = amostra('dificil', 180).filter((e) =>
      e.enunciado.includes('razão de massas é necessária'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, deltaV, exaustao] =
        /\\Delta v = ([\d{},]+)\\,\\text\{km\/s\} \\qquad v_e = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const dv = Number(deltaV.replace('{,}', '.')) * 1000;
      expect(exercicio.gabarito).toBeCloseTo(Math.exp(dv / Number(exaustao)), 4);
      expect(exercicio.gabarito).toBeGreaterThan(1);
    }
  });

  it('ir à órbita com exaustão de 3 km/s exige mais de 95% de propelente', () => {
    // 9,4 km/s de delta-v, que é o custo real da órbita baixa.
    const { resultado } = tsiolkovskyComPassos(Math.exp(9400 / 3000), 1, 3000);

    expect(resultado.deltaV / 1000).toBeCloseTo(9.4, 6);
    expect(resultado.fracaoCombustivel).toBeGreaterThan(0.95);
  });

  it('a fração de propelente fica entre 0 e 1', () => {
    const exercicios = amostra('medio', 180).filter((e) => e.enunciado.includes('era propelente'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, inicial, final] =
        /m_0 = (\d+)\\,\\text\{kg\} \\qquad m_f = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(1 - Number(final) / Number(inicial), 4);
      expect(exercicio.gabarito).toBeGreaterThan(0);
      expect(exercicio.gabarito).toBeLessThan(1);
    }
  });

  it('diagnostica quem multiplica em vez de usar o logaritmo', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('dentro de um LOGARITMO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('dentro de um LOGARITMO'),
    )!;

    const resultado = corrigir(geradorPropulsao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('propulsao.tsiolkovsky');
  });

  it('diagnostica quem usa logaritmo decimal', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('NATURAL')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('NATURAL'))!;
    const resultado = corrigir(geradorPropulsao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('propulsao.tsiolkovsky');
  });

  it('aceita decimal e exponencial', () => {
    expect(geradorPropulsao.analisar('6,24')).toBeCloseTo(6.24, 9);
    expect(geradorPropulsao.analisar('7.5e2')).toBeCloseTo(750, 9);
    expect(geradorPropulsao.analisar('decola')).toBeNull();
  });
});
