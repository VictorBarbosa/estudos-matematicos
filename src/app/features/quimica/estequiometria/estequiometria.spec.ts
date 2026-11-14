import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEstequiometria } from '@features/quimica/estequiometria/estequiometria.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(212);
  return Array.from({ length: quantidade }, () => geradorEstequiometria.gerar(nivel, rng));
}

describe('geradorEstequiometria', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e positivo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);
        expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorEstequiometria.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorEstequiometria.formatar(exercicio.gabarito);
        expect(corrigir(geradorEstequiometria, exercicio, escrito).veredito, escrito).toBe(
          'correto',
        );
      }
    });
  }

  /**
   * A conservação de massa não é verificável aqui, porque a pergunta liga
   * apenas DUAS substâncias da reação — mas a ordem de grandeza é: a massa
   * obtida não pode ser nem mil vezes maior nem mil vezes menor que a dada.
   * É o teste que pega uma massa molar digitada errada na tabela de reações.
   */
  it('a massa obtida fica na mesma ordem de grandeza da massa dada', () => {
    const comMassa = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter(
        (e) => e.id.startsWith('esteq-prod') || e.id.startsWith('esteq-reag'),
      ),
    );

    expect(comMassa.length).toBeGreaterThan(30);

    for (const exercicio of comMassa) {
      // «a partir de X g» e «para obter X g»: o número é o que precede o «g».
      const [, massa] = /([\d,]+) g/.exec(exercicio.enunciado)!;
      const dada = Number(massa.replace(',', '.'));
      const razao = exercicio.gabarito / dada;

      expect(razao, exercicio.enunciado).toBeGreaterThan(0.01);
      expect(razao, exercicio.enunciado).toBeLessThan(100);
    }
  });

  /**
   * O erro clássico do tópico: aplicar a proporção direto sobre as massas.
   *
   * Ele é perigoso porque sai plausível — mesma ordem de grandeza, nenhum
   * sinal de que está errado. Por isso merece diagnóstico, e por isso o teste
   * confere que ele está lá.
   */
  it('diagnostica a proporção aplicada às massas', () => {
    const exercicio = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('esteq-prod')),
    ).find((e) => e.armadilhas.some((a) => a.diagnostico.includes('direto sobre as massas')))!;

    expect(exercicio, 'nenhum exercício de massa na amostra').toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('direto sobre as massas'),
    )!;
    const resultado = corrigir(
      geradorEstequiometria,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('MOLÉCULAS');
  });

  it('diagnostica a razão invertida', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 80)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('invertida')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('invertida'))!;
    const resultado = corrigir(
      geradorEstequiometria,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
  });

  /**
   * A pergunta em mols não passa por massa nenhuma.
   *
   * O gabarito tem de ser a quantidade dada vezes a razão dos coeficientes —
   * um número pequeno, e sempre múltiplo racional simples da entrada.
   */
  it('a pergunta em mols é só a razão dos coeficientes', () => {
    const comMols = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('esteq-mols')),
    );

    expect(comMols.length).toBeGreaterThan(20);

    for (const exercicio of comMols) {
      const [, mols] = /([\d,]+) mol/.exec(exercicio.enunciado)!;
      const dados = Number(mols.replace(',', '.'));
      const razao = exercicio.gabarito / dados;

      // Os coeficientes das reações do tópico vão de 1 a 6. A folga de 1e-9
      // é do ponto flutuante: 3,2 × 6/3 dá 6,000000000000001.
      expect(razao, exercicio.enunciado).toBeGreaterThanOrEqual(1 / 6 - 1e-9);
      expect(razao, exercicio.enunciado).toBeLessThanOrEqual(6 + 1e-9);
    }
  });

  it('a equação aparece sempre, e nas três línguas', () => {
    const todos = NIVEIS.flatMap((nivel) => amostra(nivel, 80));

    for (const exercicio of todos) {
      expect(exercicio.enunciadoTex, exercicio.enunciado).toContain('\\to');
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  it('as três perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 80)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['mols', 'prod', 'reag']));
  });
});
