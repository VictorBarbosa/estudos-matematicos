import { Linear2, trabalhoNoSegmentoComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorIntegraisDeLinha } from '@features/calculo-3/integrais-de-linha/integrais-de-linha.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(45_454);
  return Array.from({ length: quantidade }, () => geradorIntegraisDeLinha.gerar(nivel, rng));
}

const constante = (valor: number): Linear2 => ({ kx: 0, ky: 0, k0: valor });

describe('geradorIntegraisDeLinha', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorIntegraisDeLinha.formatar(exercicio.gabarito);
        expect(corrigir(geradorIntegraisDeLinha, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorIntegraisDeLinha.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil chega ao caminho fechado e ao campo conservativo', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('linha.caminho-fechado')).toBe(true);
    expect(conceitos.has('linha.conservativo')).toBe(true);
  });

  it('no caminho fechado, o gabarito é sempre zero', () => {
    // Ida e volta pelo mesmo caminho se cancelam em qualquer campo — e é esse
    // o fato que o exercício existe para mostrar.
    for (const exercicio of amostra('dificil', 250)) {
      if (!exercicio.enunciado.includes('voltar pelo mesmo caminho')) {
        continue;
      }
      expect(exercicio.gabarito, exercicio.enunciado).toBeCloseTo(0, 9);
    }
  });

  it('diagnostica quem multiplica os módulos', () => {
    const exercicio = amostra('facil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('módulos foram multiplicados')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('módulos foram multiplicados'),
    )!;
    const resultado = corrigir(
      geradorIntegraisDeLinha,
      exercicio,
      geradorIntegraisDeLinha.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('linha.trabalho');
  });
});

/**
 * O motor das integrais de linha.
 *
 * O que se testa é a propriedade física: só a componente ao longo do caminho
 * realiza trabalho, e o sentido do percurso decide o sinal.
 */
describe('integrais de linha', () => {
  it('com campo constante, o trabalho é o produto escalar', () => {
    const { resultado } = trabalhoNoSegmentoComPassos(
      constante(3),
      constante(4),
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    );

    expect(resultado).toBeCloseTo(6, 10);
  });

  it('campo perpendicular ao caminho não realiza trabalho', () => {
    const { resultado } = trabalhoNoSegmentoComPassos(
      constante(0),
      constante(5),
      { x: 0, y: 0 },
      { x: 3, y: 0 },
    );

    expect(resultado).toBeCloseTo(0, 10);
  });

  it('inverter o percurso inverte o sinal', () => {
    const ida = trabalhoNoSegmentoComPassos(
      { kx: 1, ky: 0, k0: 0 },
      { kx: 0, ky: 2, k0: 0 },
      { x: 1, y: 1 },
      { x: 4, y: 3 },
    ).resultado;

    const volta = trabalhoNoSegmentoComPassos(
      { kx: 1, ky: 0, k0: 0 },
      { kx: 0, ky: 2, k0: 0 },
      { x: 4, y: 3 },
      { x: 1, y: 1 },
    ).resultado;

    expect(volta).toBeCloseTo(-ida, 10);
  });

  it('num campo conservativo, o trabalho é a diferença do potencial', () => {
    // F = (2x, 2y) é o gradiente de x² + y².
    const { resultado } = trabalhoNoSegmentoComPassos(
      { kx: 2, ky: 0, k0: 0 },
      { kx: 0, ky: 2, k0: 0 },
      { x: 1, y: 1 },
      { x: 3, y: 2 },
    );

    const potencial = (x: number, y: number) => x * x + y * y;
    expect(resultado).toBeCloseTo(potencial(3, 2) - potencial(1, 1), 8);
  });

  it('e nesse campo o caminho não importa', () => {
    const direto = trabalhoNoSegmentoComPassos(
      { kx: 2, ky: 0, k0: 0 },
      { kx: 0, ky: 2, k0: 0 },
      { x: 0, y: 0 },
      { x: 2, y: 2 },
    ).resultado;

    const emL =
      trabalhoNoSegmentoComPassos(
        { kx: 2, ky: 0, k0: 0 },
        { kx: 0, ky: 2, k0: 0 },
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ).resultado +
      trabalhoNoSegmentoComPassos(
        { kx: 2, ky: 0, k0: 0 },
        { kx: 0, ky: 2, k0: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
      ).resultado;

    expect(emL).toBeCloseTo(direto, 8);
  });

  it('num campo não conservativo, o caminho importa', () => {
    // F = (−y, x) é o exemplo clássico de circulação não nula.
    const direto = trabalhoNoSegmentoComPassos(
      { kx: 0, ky: -1, k0: 0 },
      { kx: 1, ky: 0, k0: 0 },
      { x: 0, y: 0 },
      { x: 2, y: 2 },
    ).resultado;

    const emL =
      trabalhoNoSegmentoComPassos(
        { kx: 0, ky: -1, k0: 0 },
        { kx: 1, ky: 0, k0: 0 },
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ).resultado +
      trabalhoNoSegmentoComPassos(
        { kx: 0, ky: -1, k0: 0 },
        { kx: 1, ky: 0, k0: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
      ).resultado;

    expect(emL).not.toBeCloseTo(direto, 6);
  });

  it('a resolução mostra a parametrização e o vetor tangente', () => {
    const { passos } = trabalhoNoSegmentoComPassos(
      constante(1),
      constante(1),
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    );

    expect(passos[0]!.tex).toContain('\\vec{r}(t)');
    expect(passos[2]!.descricao).toContain('tangente é constante');
    expect(passos[3]!.nota).toContain('conservativo');
  });
});
