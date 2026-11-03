import {
  classificarCritico,
  derivadaDirecionalComPassos,
  gradienteComPassos,
  gradienteEm,
  pontoCriticoComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorGradiente } from '@features/calculo-3/gradiente-e-direcional/gradiente-e-direcional.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(33_333);
  return Array.from({ length: quantidade }, () => geradorGradiente.gerar(nivel, rng));
}

describe('geradorGradiente', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorGradiente.formatar(exercicio.gabarito);
        expect(corrigir(geradorGradiente, exercicio, exibido).veredito, exibido).toBe('correto');
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorGradiente.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil cobra direcional e ponto crítico', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('gradiente.direcional')).toBe(true);
    expect(conceitos.has('gradiente.ponto-critico')).toBe(true);
  });

  it('a armadilha de não normalizar está sempre nos exercícios direcionais', () => {
    const direcionais = amostra('dificil', 250).filter((exercicio) =>
      exercicio.enunciado.includes('derivada direcional'),
    );

    expect(direcionais.length).toBeGreaterThan(0);
    for (const exercicio of direcionais) {
      expect(
        exercicio.armadilhas.some((a) => a.diagnostico.includes('Faltou normalizar')),
        exercicio.enunciado,
      ).toBe(true);
    }
  });

  it('diagnostica quem soma as componentes em vez de aplicar Pitágoras', () => {
    const exercicio = amostra('facil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('componentes foram somadas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('componentes foram somadas'),
    )!;
    const resultado = corrigir(
      geradorGradiente,
      exercicio,
      geradorGradiente.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('gradiente.vetor');
  });
});

/**
 * O motor do gradiente.
 *
 * As duas propriedades que o tópico existe para instalar são testadas
 * diretamente: ele aponta para a subida mais íngreme, e seu módulo é a taxa
 * máxima possível.
 */
describe('gradiente e derivada direcional', () => {
  const paraboloide = { a: 1, b: 3, c: 0, d: 0, e: 0, f0: 0 };

  it('o gradiente reúne as parciais', () => {
    expect(gradienteEm(paraboloide, 1, 2)).toEqual({ x: 2, y: 12 });
  });

  it('nenhuma direção supera o módulo do gradiente', () => {
    const maxima = gradienteComPassos(paraboloide, 1, 2).resultado;

    for (let graus = 0; graus < 360; graus += 15) {
      const radianos = (graus * Math.PI) / 180;
      const direcao = { x: Math.cos(radianos), y: Math.sin(radianos) };
      const taxa = derivadaDirecionalComPassos(paraboloide, 1, 2, direcao).resultado;

      expect(taxa, `${graus} graus`).toBeLessThanOrEqual(maxima + 1e-9);
    }
  });

  it('na direção do gradiente, a taxa é exatamente o módulo', () => {
    const g = gradienteEm(paraboloide, 1, 2);
    const { resultado } = derivadaDirecionalComPassos(paraboloide, 1, 2, g);

    expect(resultado).toBeCloseTo(Math.hypot(g.x, g.y), 10);
  });

  it('perpendicular ao gradiente, a taxa é nula', () => {
    const g = gradienteEm(paraboloide, 1, 2);
    const { resultado } = derivadaDirecionalComPassos(paraboloide, 1, 2, { x: -g.y, y: g.x });

    expect(resultado).toBeCloseTo(0, 10);
  });

  it('normalizar não muda o resultado: o comprimento da direção é irrelevante', () => {
    const curta = derivadaDirecionalComPassos(paraboloide, 1, 2, { x: 3, y: 4 }).resultado;
    const longa = derivadaDirecionalComPassos(paraboloide, 1, 2, { x: 30, y: 40 }).resultado;

    expect(curta).toBeCloseTo(longa, 10);
  });

  it('o ponto crítico é onde as duas parciais zeram', () => {
    const deslocada = { a: 1, b: 1, c: 0, d: -6, e: -4, f0: 0 };
    const { resultado } = pontoCriticoComPassos(deslocada);

    expect(resultado).toBeCloseTo(3, 10);
    expect(gradienteEm(deslocada, 3, 2)).toEqual({ x: 0, y: 0 });
  });

  it('o teste da hessiana distingue os três casos', () => {
    expect(classificarCritico({ a: 1, b: 1, c: 0, d: 0, e: 0, f0: 0 })).toBe('mínimo');
    expect(classificarCritico({ a: -1, b: -1, c: 0, d: 0, e: 0, f0: 0 })).toBe('máximo');
    expect(classificarCritico({ a: 1, b: -1, c: 0, d: 0, e: 0, f0: 0 })).toBe('sela');
  });

  it('a sela é o caso que não existe em uma variável', () => {
    const sela = { a: 1, b: -1, c: 0, d: 0, e: 0, f0: 0 };

    // Em x sobe, em y desce — e a origem é crítica nos dois.
    expect(gradienteEm(sela, 0, 0)).toEqual({ x: 0, y: 0 });
    expect(classificarCritico(sela)).toBe('sela');
  });
});
