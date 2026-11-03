import {
  Polinomio,
  analisarRacional,
  assintotaOuBuracoComPassos,
  avaliarRacional,
  quocienteDaDivisao,
  racionalParaTex,
  raizesInteiras,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorFuncoesRacionais } from '@features/funcoes/funcoes-racionais/funcoes-racionais.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(13_577);
  return Array.from({ length: quantidade }, () => geradorFuncoesRacionais.gerar(nivel, rng));
}

describe('geradorFuncoesRacionais', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciadoTex).toBe(true);

        const exibido = geradorFuncoesRacionais.formatar(exercicio.gabarito);
        expect(corrigir(geradorFuncoesRacionais, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorFuncoesRacionais.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciadoTex,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil cobra buraco e assíntota oblíqua', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('racionais.buraco')).toBe(true);
    expect(conceitos.has('racionais.assintota-obliqua')).toBe(true);
  });

  it('nos exercícios de buraco, o zero pedido é mesmo um buraco', () => {
    // É a propriedade que o exercício depende: o fator precisa estar nos dois
    // lados, senão a resposta certa seria uma assíntota.
    for (const exercicio of amostra('dificil', 250)) {
      if (!exercicio.enunciado.includes('BURACO')) {
        continue;
      }

      expect(exercicio.conceitos).toContain('racionais.buraco');
      expect(Number.isInteger(exercicio.gabarito), exercicio.enunciadoTex).toBe(true);
    }
  });

  it('diagnostica quem confunde o zero da função com a assíntota', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('ZERO da função')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('ZERO da função'),
    )!;
    const resultado = corrigir(
      geradorFuncoesRacionais,
      exercicio,
      geradorFuncoesRacionais.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('racionais.assintota-vertical');
  });
});

/**
 * O motor das funções racionais.
 *
 * A distinção entre assíntota e buraco é testada nos dois sentidos, porque é
 * ela que o tópico existe para instalar.
 */
describe('funções racionais', () => {
  const comBuraco = {
    numerador: Polinomio.de(-3, 1).multiplicar(Polinomio.de(1, 1)),
    denominador: Polinomio.de(-3, 1).multiplicar(Polinomio.de(-5, 1)),
  };

  it('separa buraco de assíntota pelo numerador', () => {
    const analise = analisarRacional(comBuraco);

    expect(analise.buracos).toEqual([3]);
    expect(analise.assintotasVerticais).toEqual([5]);
  });

  it('o zero que vira buraco não conta como zero da função', () => {
    expect(analisarRacional(comBuraco).zeros).toEqual([-1]);
  });

  it('no buraco, o limite existe e é finito', () => {
    const { resultado } = assintotaOuBuracoComPassos(comBuraco, 3);

    expect(resultado).toBe(true);
    expect(avaliarRacional(comBuraco, 3 + 1e-9)).toBeCloseTo(-2, 6);
  });

  it('na assíntota, a função dispara', () => {
    const { resultado } = assintotaOuBuracoComPassos(comBuraco, 5);

    expect(resultado).toBe(false);
    expect(Math.abs(avaliarRacional(comBuraco, 5 + 1e-6))).toBeGreaterThan(1e5);
  });

  it('grau menor em cima leva a função a zero', () => {
    const f = { numerador: Polinomio.de(1, 1), denominador: Polinomio.de(0, 0, 1) };
    const analise = analisarRacional(f);

    expect(analise.tipoFinal).toBe('horizontal-zero');
    expect(analise.horizontal).toBe(0);
  });

  it('graus iguais deixam a razão dos líderes', () => {
    const f = { numerador: Polinomio.de(1, 3), denominador: Polinomio.de(-4, 2) };
    const analise = analisarRacional(f);

    expect(analise.tipoFinal).toBe('horizontal-razao');
    expect(analise.horizontal).toBeCloseTo(1.5, 12);
  });

  it('um grau a mais produz assíntota oblíqua', () => {
    const f = { numerador: Polinomio.de(1, 0, 1), denominador: Polinomio.de(-1, 1) };
    const analise = analisarRacional(f);

    expect(analise.tipoFinal).toBe('obliqua');
    // (x² + 1)/(x − 1) = x + 1 + 2/(x − 1)
    expect(analise.obliqua?.coeficiente(1)).toBeCloseTo(1, 12);
    expect(analise.obliqua?.coeficiente(0)).toBeCloseTo(1, 12);
  });

  it('dois graus a mais não têm assíntota no infinito', () => {
    const f = { numerador: Polinomio.de(0, 0, 0, 1), denominador: Polinomio.de(0, 1) };

    expect(analisarRacional(f).tipoFinal).toBe('nenhuma');
  });

  it('a divisão de polinômios devolve o quociente certo', () => {
    const q = quocienteDaDivisao(Polinomio.de(1, 0, 1), Polinomio.de(-1, 1));

    expect(q.coeficiente(0)).toBeCloseTo(1, 12);
    expect(q.coeficiente(1)).toBeCloseTo(1, 12);
  });

  it('as raízes inteiras saem por varredura exata', () => {
    expect(raizesInteiras(Polinomio.de(-6, 1, 1))).toEqual([-3, 2]);
    expect(raizesInteiras(Polinomio.de(1, 0, 1))).toEqual([]);
  });

  it('a escrita em fração sai pronta para o enunciado', () => {
    const f = { numerador: Polinomio.de(1, 1), denominador: Polinomio.de(-2, 1) };

    expect(racionalParaTex(f)).toContain('\\frac{');
  });
});
