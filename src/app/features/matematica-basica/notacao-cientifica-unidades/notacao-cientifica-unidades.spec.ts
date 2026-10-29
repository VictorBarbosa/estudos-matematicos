import { algarismosSignificativos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorNotacao } from './notacao-cientifica-unidades.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5521);
  return Array.from({ length: quantidade }, () => geradorNotacao.gerar(nivel, rng));
}

describe('geradorNotacao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorNotacao.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício traz resolução e conceitos`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.resultado).toBe(exercicio.gabarito);
      }
    });
  }

  it('o expoente pedido é o da notação científica', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('expoente de 10'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const valor = Number(exercicio.enunciadoTex.replace('{,}', '.'));
      const esperado = Math.floor(Math.log10(Math.abs(valor)));

      expect(exercicio.gabarito).toBe(esperado);
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
    }
  });

  it('a conversão de prefixos confere com a razão das potências', () => {
    const exercicios = amostra('dificil', 120).filter((e) => e.enunciado.startsWith('Converta'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      // O enunciado em TeX carrega valor e as duas unidades.
      const [, valor, origem, destino] =
        /^([\d{},]+)\\,\\text\{(\S*?)[a-zA-Z]\} = \\;\?\\;\\text\{(\S*?)[a-zA-Z]\}$/.exec(
          exercicio.enunciadoTex,
        )!;

      expect(Number(valor.replace('{,}', '.'))).toBeGreaterThan(0);
      expect(origem).not.toBe(destino);
      expect(Number.isFinite(exercicio.gabarito)).toBe(true);
    }
  });

  it('a conversão nunca deixa o valor inalterado', () => {
    for (const exercicio of amostra('dificil', 120).filter((e) =>
      e.enunciado.startsWith('Converta'),
    )) {
      const valor = Number(
        /^([\d{},]+)/.exec(exercicio.enunciadoTex)![1].replace('{,}', '.'),
      );

      expect(exercicio.gabarito).not.toBe(valor);
    }
  });

  it('a contagem de significativos confere com o core', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('algarismos significativos'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const escrito = /número (\S+)\?/.exec(exercicio.enunciado)![1];
      expect(exercicio.gabarito).toBe(algarismosSignificativos(escrito));
    }
  });

  it('diagnostica quem multiplica os expoentes em vez de somá-los', () => {
    const exercicio = amostra('dificil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('se SOMAM')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('se SOMAM'))!;
    const resultado = corrigir(geradorNotacao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('potencias.propriedades');
  });

  it('diagnostica quem inverte o sentido da conversão', () => {
    const exercicio = amostra('medio', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('sentido da conversão foi invertido')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sentido da conversão foi invertido'),
    )!;

    const resultado = corrigir(geradorNotacao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('notacao.unidades');
  });

  it('compara respostas por grandeza relativa, não por diferença absoluta', () => {
    // Dois valores enormes e distintos não podem passar por equivalentes.
    expect(geradorNotacao.saoEquivalentes(6.02e23, 6.03e23)).toBe(false);
    // E dois minúsculos e distintos também não.
    expect(geradorNotacao.saoEquivalentes(1e-12, 2e-12)).toBe(false);
    expect(geradorNotacao.saoEquivalentes(1500, 1500)).toBe(true);
  });

  it('aceita vírgula decimal, negativos e notação exponencial', () => {
    expect(geradorNotacao.analisar('-4')).toBe(-4);
    expect(geradorNotacao.analisar('2,5')).toBe(2.5);
    // Num tópico sobre potências de dez, esta é a forma natural de responder.
    expect(geradorNotacao.analisar('3e8')).toBe(3e8);
    expect(geradorNotacao.analisar('2,5E-9')).toBe(2.5e-9);
    expect(geradorNotacao.analisar('x')).toBeNull();
    expect(geradorNotacao.analisar('3e')).toBeNull();
  });
});
