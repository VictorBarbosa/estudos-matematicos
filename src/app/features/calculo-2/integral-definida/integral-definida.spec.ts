import { integralNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorDefinida } from './integral-definida.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(6464);
  return Array.from({ length: quantidade }, () => geradorDefinida.gerar(nivel, rng));
}

describe('geradorDefinida', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorDefinida.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, nenhum exercício exige o teorema fundamental`, () => {
      // A integral definida vem duas etapas ANTES do TFC na trilha: nada aqui
      // pode depender de achar uma primitiva.
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.conceitos).not.toContain('tfc.enunciado');

        for (const passo of exercicio.resolucao.passos) {
          expect(passo.tex).not.toContain('F(b)');
          // "sem usar primitivas" no enunciado é permitido; a resolução é que
          // não pode recorrer a elas.
          expect(passo.descricao.toLowerCase()).not.toContain('primitiva');
        }
      }
    });
  }

  it('a área do trapézio confere com a integração numérica', () => {
    const trapezios = amostra('medio', 150).filter((e) => e.enunciado.includes('trapézio'));

    expect(trapezios.length).toBeGreaterThan(5);

    for (const exercicio of trapezios) {
      const [, de, ate, reta] =
        /\\int_\{(-?\d+)\}\^\{(-?\d+)\} \\left\((.+?)\\right\) dx/.exec(exercicio.enunciadoTex)!;
      const [, mTexto, sinal, kTexto] = /^(-?\d*)x(?: ([+-]) (\d+))?$/.exec(reta!)!;

      const m = mTexto === '' ? 1 : mTexto === '-' ? -1 : Number(mTexto);
      const k = kTexto === undefined ? 0 : (sinal === '-' ? -1 : 1) * Number(kTexto);

      const numerica = integralNumerica((x) => m * x + k, Number(de), Number(ate));
      expect(exercicio.gabarito).toBeCloseTo(numerica, 6);
    }
  });

  it('a função sob a reta é positiva em todo o intervalo, para que a integral seja área', () => {
    const trapezios = amostra('dificil', 150).filter((e) => e.enunciado.includes('trapézio'));

    for (const exercicio of trapezios) {
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('a integral da constante é o retângulo, com signo', () => {
    const constantes = amostra('facil', 120).filter((e) => e.enunciado.includes('constante'));

    expect(constantes.length).toBeGreaterThan(5);

    for (const exercicio of constantes) {
      const [, valor, de, ate] =
        /\\int_\{(-?\d+)\}\^\{(-?\d+)\} (-?\d+)\\,dx/.exec(exercicio.enunciadoTex)
          ? (() => {
              const m = /\\int_\{(-?\d+)\}\^\{(-?\d+)\} (-?\d+)\\,dx/.exec(
                exercicio.enunciadoTex,
              )!;
              return [m[0], m[3], m[1], m[2]];
            })()
          : [];

      expect(exercicio.gabarito).toBe(Number(valor) * (Number(ate) - Number(de)));
    }
  });

  it('a aditividade soma os trechos consecutivos', () => {
    const aditivos = amostra('medio', 200).filter((e) => e.enunciado.includes('a integral de'));

    expect(aditivos.length).toBeGreaterThan(5);

    for (const exercicio of aditivos) {
      // Ancorado: sem o ^ a expressão casava também com o segundo par de
      // integrais de outro tipo de exercício.
      const somados = /^\\int_\{(-?\d+)\}\^\{(-?\d+)\} f = (-?\d+) \\qquad \\int_\{(-?\d+)\}\^\{(-?\d+)\} f = (-?\d+)/.exec(
        exercicio.enunciadoTex,
      );

      if (somados === null) {
        continue;
      }

      const [, , meio, primeira, outroMeio, , segunda] = somados;
      expect(meio).toBe(outroMeio);
      expect(exercicio.gabarito).toBe(Number(primeira) + Number(segunda));
    }
  });

  it('inverter os limites troca o sinal', () => {
    const invertidos = amostra('dificil', 200).filter((e) =>
      e.enunciado.includes('quanto vale a integral de'),
    );

    for (const exercicio of invertidos) {
      const m = /^\\int_\{(-?\d+)\}\^\{(-?\d+)\} f = (-?\d+) \\qquad \\int_\{(-?\d+)\}\^\{(-?\d+)\} f = \\;\?$/.exec(
        exercicio.enunciadoTex,
      );

      if (m === null) {
        continue;
      }

      const [, a, b, valor, de, ate] = m;
      expect([de, ate]).toEqual([b, a]);
      expect(exercicio.gabarito).toBe(-Number(valor));
    }
  });

  it('o valor médio de uma reta é a média das alturas nos extremos', () => {
    const medios = amostra('dificil', 150).filter((e) => e.enunciado.includes('valor MÉDIO'));

    expect(medios.length).toBeGreaterThan(5);

    for (const exercicio of medios) {
      const [, reta, de, ate] =
        /f\(x\) = (.+?) \\qquad \[(-?\d+),\\, (-?\d+)\]/.exec(exercicio.enunciadoTex)!;
      const [, mTexto, sinal, kTexto] = /^(-?\d*)x(?: ([+-]) (\d+))?$/.exec(reta!)!;

      const m = mTexto === '' ? 1 : mTexto === '-' ? -1 : Number(mTexto);
      const k = kTexto === undefined ? 0 : (sinal === '-' ? -1 : 1) * Number(kTexto);

      const media = (m * Number(de) + k + (m * Number(ate) + k)) / 2;
      expect(exercicio.gabarito).toBeCloseTo(media, 9);
    }
  });

  it('no nível difícil aparecem limites negativos', () => {
    const comNegativo = amostra('dificil', 150).filter((e) =>
      /\\int_\{-\d+\}/.test(e.enunciadoTex),
    );

    expect(comNegativo.length).toBeGreaterThan(0);
  });

  it('diagnostica quem toma a média das alturas como se fosse a área', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('média das duas alturas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('média das duas alturas'),
    )!;

    const resultado = corrigir(geradorDefinida, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('integral-def.area-geometrica');
  });

  it('diagnostica quem soma os trechos com o sinal errado', () => {
    const exercicio = amostra('dificil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('trechos se SOMAM')),
    )!;

    expect(exercicio).toBeDefined();
  });
});
