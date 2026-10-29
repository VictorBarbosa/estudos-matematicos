import { mdc, mmc } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorMmcMdc } from './mmc-mdc.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1234);
  return Array.from({ length: quantidade }, () => geradorMmcMdc.gerar(nivel, rng));
}

describe('geradorMmcMdc', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com o motor`, () => {
      for (const exercicio of amostra(nivel)) {
        const [, a, b] = /\((\d+), (\d+)\)/.exec(exercicio.enunciadoTex)!;
        const esperado = exercicio.enunciadoTex.includes('mdc')
          ? mdc(Number(a), Number(b))
          : mmc(Number(a), Number(b));

        expect(exercicio.gabarito).toBe(esperado);
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

  it('no nível médio, os números têm fator comum, então o MDC não é trivial', () => {
    const comMdcMaiorQueUm = amostra('medio').filter((exercicio) => {
      const [, a, b] = /\((\d+), (\d+)\)/.exec(exercicio.enunciadoTex)!;
      return mdc(Number(a), Number(b)) > 1;
    });

    expect(comMdcMaiorQueUm.length).toBe(60);
  });

  it('lê apenas respostas inteiras', () => {
    expect(geradorMmcMdc.analisar(' 36 ')).toBe(36);
    expect(geradorMmcMdc.analisar('3,5')).toBeNull();
    expect(geradorMmcMdc.analisar('trinta')).toBeNull();
  });

  it('avisa quando o aluno troca MDC por MMC', () => {
    // Quando a = b os dois coincidem, e aí trocar um pelo outro não é erro.
    const exercicio = amostra('medio', 40).find((candidato) => {
      const [, a, b] = /\((\d+), (\d+)\)/.exec(candidato.enunciadoTex)!;
      return mdc(Number(a), Number(b)) !== mmc(Number(a), Number(b));
    })!;

    const [, a, b] = /\((\d+), (\d+)\)/.exec(exercicio.enunciadoTex)!;
    const respostaTrocada = exercicio.enunciadoTex.includes('mdc')
      ? mmc(Number(a), Number(b))
      : mdc(Number(a), Number(b));

    const resultado = corrigir(geradorMmcMdc, exercicio, String(respostaTrocada));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toMatch(/MMC|MDC/);
  });
});
