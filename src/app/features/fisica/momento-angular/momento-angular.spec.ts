import {
  conservacaoAngularComPassos,
  corpoPorNome,
  momentoAngularComPassos,
  momentoAngularDePartiComPassos,
  momentoDeInercia,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorMomentoAngular } from '@features/fisica/momento-angular/momento-angular.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(44_102);
  return Array.from({ length: quantidade }, () => geradorMomentoAngular.gerar(nivel, rng));
}

describe('geradorMomentoAngular', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorMomentoAngular.formatar(exercicio.gabarito);
        expect(corrigir(geradorMomentoAngular, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorMomentoAngular.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil usa ângulo reto, onde o seno não atrapalha', () => {
    for (const exercicio of amostra('facil', 150)) {
      if (!exercicio.conceitos.includes('angular.particula')) {
        continue;
      }
      expect(exercicio.enunciado, exercicio.enunciado).toContain('90 graus');
    }
  });

  it('o Difícil chega à energia que não se conserva', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('angular.energia-nao-se-conserva')).toBe(true);
    expect(conceitos.has('angular.conservacao')).toBe(true);
  });

  it('nos exercícios de conservação, zero é sempre uma armadilha nomeada', () => {
    const daEnergia = amostra('dificil', 250).filter((exercicio) =>
      exercicio.conceitos.includes('angular.energia-nao-se-conserva'),
    );

    expect(daEnergia.length).toBeGreaterThan(0);
    for (const exercicio of daEnergia) {
      const zero = exercicio.armadilhas.find((a) => a.resposta === 0);
      expect(zero?.diagnostico ?? '', exercicio.enunciado).toContain('energia NÃO se conserva');
    }
  });

  it('diagnostica quem inverte a razão das inércias', () => {
    const exercicio = amostra('medio', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('razão está invertida')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('razão está invertida'),
    )!;
    const resultado = corrigir(
      geradorMomentoAngular,
      exercicio,
      geradorMomentoAngular.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('angular.conservacao');
  });
});

/**
 * O motor do momento angular.
 *
 * O resultado que o tópico existe para instalar é a conservação — e o detalhe
 * que surpreende, que a energia não acompanha.
 */
describe('momento angular', () => {
  const disco = corpoPorNome('disco ou cilindro maciço')!;

  it('o momento angular é linear na velocidade angular', () => {
    const devagar = momentoAngularComPassos(disco, 2, 0.5, 5).resultado;
    const rapido = momentoAngularComPassos(disco, 2, 0.5, 10).resultado;

    expect(rapido).toBeCloseTo(2 * devagar, 12);
  });

  it('e vale inércia vezes velocidade angular', () => {
    const { resultado } = momentoAngularComPassos(disco, 4, 1, 3);

    expect(resultado).toBeCloseTo(momentoDeInercia(disco, 4, 1) * 3, 12);
  });

  it('com velocidade perpendicular ao raio, a partícula tem momento angular máximo', () => {
    const reto = momentoAngularDePartiComPassos(2, 5, 3, 90).resultado;
    const obliquo = momentoAngularDePartiComPassos(2, 5, 3, 30).resultado;

    expect(reto).toBeCloseTo(30, 12);
    expect(obliquo).toBeCloseTo(15, 12);
    expect(obliquo).toBeLessThan(reto);
  });

  it('com velocidade apontando para o ponto, o momento angular é zero', () => {
    expect(momentoAngularDePartiComPassos(2, 5, 3, 0).resultado).toBeCloseTo(0, 12);
    expect(momentoAngularDePartiComPassos(2, 5, 3, 180).resultado).toBeCloseTo(0, 12);
  });

  it('recolher a massa acelera o giro na mesma proporção', () => {
    const { resultado } = conservacaoAngularComPassos(4, 2, 1);

    expect(resultado).toBeCloseTo(8, 12);
  });

  it('o momento angular é o mesmo antes e depois', () => {
    const antes = 4 * 2;
    const { resultado } = conservacaoAngularComPassos(4, 2, 1);

    expect(1 * resultado).toBeCloseTo(antes, 12);
  });

  it('mas a energia de rotação não se conserva', () => {
    const { passos } = conservacaoAngularComPassos(4, 2, 1);

    // K = L²/2I: com L fixo, cortar a inércia em quatro quadruplica a energia.
    expect(passos[3]!.tex).toContain('32');
    expect(passos[3]!.nota).toContain('realizou trabalho');
  });

  it('e afastar a massa faz a energia cair', () => {
    const { passos } = conservacaoAngularComPassos(1, 8, 4);

    expect(passos[3]!.nota).toContain('consome trabalho');
  });
});
