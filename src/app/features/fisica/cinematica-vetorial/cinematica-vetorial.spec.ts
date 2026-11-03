import {
  anguloDeCompensacaoComPassos,
  componentesDaAceleracaoComPassos,
  deslocamentoVetorialComPassos,
  modulo,
  raioDeCurvaturaComPassos,
  travessiaDeRioComPassos,
  velocidadeRelativaComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorCinematicaVetorial } from '@features/fisica/cinematica-vetorial/cinematica-vetorial.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(52_983);
  return Array.from({ length: quantidade }, () => geradorCinematicaVetorial.gerar(nivel, rng));
}

describe('geradorCinematicaVetorial', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorCinematicaVetorial.formatar(exercicio.gabarito);
        expect(corrigir(geradorCinematicaVetorial, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorCinematicaVetorial.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil cobra compensação e raio de curvatura', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('cin-vetorial.curvatura')).toBe(true);
    expect(conceitos.has('cin-vetorial.travessia')).toBe(true);
  });

  it('a soma de módulos só deixa de ser armadilha quando ela acerta por acaso', () => {
    // Com vento quase alinhado ao rumo, somar módulos dá quase o mesmo número
    // que a soma vetorial — e aí a armadilha colide com o gabarito e sai. Fora
    // desse caso ela precisa estar lá, porque é o erro central do tópico.
    const relativos = amostra('facil', 200).filter((exercicio) =>
      exercicio.conceitos.includes('cin-vetorial.velocidade-relativa'),
    );

    expect(relativos.length).toBeGreaterThan(0);

    for (const exercicio of relativos) {
      const [ax, ay, vx, vy] = [
        ...exercicio.enunciadoTex.matchAll(/(-?\d+),\\;\s*(-?\d+)/g),
      ].flatMap((achado) => [Number(achado[1]), Number(achado[2])]);

      const somaDosModulos = Math.hypot(ax!, ay!) + Math.hypot(vx!, vy!);
      const temArmadilha = exercicio.armadilhas.some((a) =>
        a.diagnostico.includes('módulos foram somados'),
      );

      if (!temArmadilha) {
        expect(
          geradorCinematicaVetorial.saoEquivalentes(somaDosModulos, exercicio.gabarito),
          exercicio.enunciadoTex,
        ).toBe(true);
        continue;
      }

      expect(temArmadilha, exercicio.enunciadoTex).toBe(true);
    }
  });

  it('diagnostica quem soma os módulos em vez dos vetores', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('módulos foram somados')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('módulos foram somados'),
    )!;
    const resultado = corrigir(
      geradorCinematicaVetorial,
      exercicio,
      geradorCinematicaVetorial.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('cin-vetorial.velocidade-relativa');
  });

  it('o ângulo de compensação só é pedido quando ele existe', () => {
    for (const exercicio of amostra('dificil', 250)) {
      if (!exercicio.enunciado.includes('rio acima')) {
        continue;
      }
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(90);
    }
  });
});

/**
 * O motor da cinemática vetorial.
 *
 * O que ele precisa acertar é a distinção que o tópico ensina: deslocamento
 * não é distância, e somar velocidades é somar vetores.
 */
describe('cinemática vetorial', () => {
  it('o deslocamento é a hipotenusa, não a soma dos catetos', () => {
    const { resultado } = deslocamentoVetorialComPassos({ x: 0, y: 0 }, { x: 3, y: 4 }, 1);

    expect(resultado).toBeCloseTo(5, 12);
  });

  it('ida e volta dão velocidade média vetorial nula', () => {
    const { resultado } = deslocamentoVetorialComPassos({ x: 2, y: 7 }, { x: 2, y: 7 }, 10);

    expect(resultado).toBe(0);
  });

  it('velocidades se somam como vetores', () => {
    const { resultado } = velocidadeRelativaComPassos({ x: 200, y: 0 }, { x: 0, y: 50 });

    expect(resultado).toBeCloseTo(Math.hypot(200, 50), 10);
    expect(resultado).toBeLessThan(250);
  });

  it('só com vento alinhado os módulos se somam', () => {
    const { resultado } = velocidadeRelativaComPassos({ x: 200, y: 0 }, { x: 50, y: 0 });

    expect(resultado).toBeCloseTo(250, 10);
  });

  it('a correnteza não atrasa a travessia, só desloca', () => {
    const semCorrenteza = travessiaDeRioComPassos(4, 0, 100);
    const comCorrenteza = travessiaDeRioComPassos(4, 3, 100);

    expect(semCorrenteza.resultado).toBe(0);
    expect(comCorrenteza.resultado).toBeCloseTo(75, 10);
    expect(comCorrenteza.passos[1]!.tex).toContain('25');
  });

  it('o ângulo de compensação é um arco-seno', () => {
    const { resultado } = anguloDeCompensacaoComPassos(4, 2);

    expect(resultado).toBeCloseTo(30, 10);
  });

  it('não há compensação possível quando o rio vence o barco', () => {
    const { passos } = anguloDeCompensacaoComPassos(2, 5);

    expect(passos[1]!.nota).toContain('não tem solução');
  });

  it('aceleração perpendicular à velocidade não muda a rapidez', () => {
    const { resultado, passos } = componentesDaAceleracaoComPassos(
      { x: 3, y: 0 },
      { x: 0, y: 5 },
    );

    expect(resultado).toBeCloseTo(0, 12);
    expect(passos[2]!.nota).toContain('rapidez não muda');
  });

  it('aceleração alinhada com a velocidade é toda tangencial', () => {
    const { resultado } = componentesDaAceleracaoComPassos({ x: 3, y: 4 }, { x: 6, y: 8 });

    expect(resultado).toBeCloseTo(modulo({ x: 6, y: 8 }), 10);
  });

  it('aceleração oposta à velocidade freia', () => {
    const { resultado } = componentesDaAceleracaoComPassos({ x: 3, y: 0 }, { x: -2, y: 0 });

    expect(resultado).toBeCloseTo(-2, 12);
  });

  it('o raio de curvatura cresce com o quadrado da velocidade', () => {
    const devagar = raioDeCurvaturaComPassos({ x: 10, y: 0 }, { x: 0, y: 20 }).resultado;
    const rapido = raioDeCurvaturaComPassos({ x: 20, y: 0 }, { x: 0, y: 20 }).resultado;

    expect(devagar).toBeCloseTo(5, 10);
    expect(rapido).toBeCloseTo(20, 10);
  });

  it('sem componente normal a trajetória é reta', () => {
    const { resultado } = raioDeCurvaturaComPassos({ x: 5, y: 0 }, { x: 2, y: 0 });

    expect(Number.isFinite(resultado)).toBe(false);
  });
});
