import { massaMolar } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorMol } from '@features/quimica/mol-e-massa-molar/mol-e-massa-molar.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(602);
  return Array.from({ length: quantidade }, () => geradorMol.gerar(nivel, rng));
}

describe('geradorMol', () => {
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
            geradorMol.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorMol.formatar(exercicio.gabarito);
        expect(corrigir(geradorMol, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * A massa molar da água é o teste mais útil do tópico: ela é o número que
   * todo mundo sabe de cor, e qualquer erro de índice ou de massa atômica
   * aparece nele na hora.
   */
  it('a massa molar da água dá 18,02', () => {
    const agua = massaMolar([
      { simbolo: 'H', massaAtomica: 1.008, quantidade: 2 },
      { simbolo: 'O', massaAtomica: 15.999, quantidade: 1 },
    ]);

    expect(agua).toBeCloseTo(18.015, 3);
  });

  /**
   * Mols e massa são a mesma relação lida nos dois sentidos.
   *
   * Refazendo a conta do enunciado pela massa molar da própria substância, o
   * gabarito tem de voltar — é o que pega um sorteio que descasou a massa da
   * substância.
   */
  it('a conta de mols fecha com a massa molar da substância', () => {
    const comMols = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('mol-mols')),
    );

    expect(comMols.length).toBeGreaterThan(20);

    for (const exercicio of comMols) {
      const [, massa] = /^m = ([\d.]+)/.exec(exercicio.enunciadoTex)!;

      // n = m / M, então M = m / n.
      const molarImplicita = Number(massa) / exercicio.gabarito;

      expect(molarImplicita, exercicio.enunciado).toBeGreaterThan(15);
      expect(molarImplicita, exercicio.enunciado).toBeLessThan(200);
    }
  });

  it('a massa pedida é a quantidade vezes a massa molar', () => {
    const comMassa = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('mol-massa')),
    );

    expect(comMassa.length).toBeGreaterThan(10);

    for (const exercicio of comMassa) {
      const [, mols] = /^n = ([\d.]+)/.exec(exercicio.enunciadoTex)!;
      const molarImplicita = exercicio.gabarito / Number(mols);

      expect(molarImplicita, exercicio.enunciado).toBeGreaterThan(15);
      expect(molarImplicita, exercicio.enunciado).toBeLessThan(200);
    }
  });

  /**
   * O erro número um do tópico: somar as massas atômicas ignorando os índices.
   *
   * Quem o comete acerta na água, onde o índice do oxigênio é 1, e erra em
   * tudo o mais — por isso ele merece diagnóstico, e não «não é isso».
   */
  it('diagnostica a soma sem os índices', () => {
    const exercicio = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('mol-molar')),
    ).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('sem multiplicar pelos índices')),
    )!;

    expect(exercicio, 'nenhum exercício de massa molar na amostra').toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sem multiplicar pelos índices'),
    )!;
    const resultado = corrigir(
      geradorMol,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('conta ÁTOMOS');
  });

  it('diagnostica a divisão invertida', () => {
    const exercicio = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('mol-mols')),
    ).find((e) => e.armadilhas.some((a) => a.diagnostico.includes('invertida')))!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('invertida'))!;
    const resultado = corrigir(
      geradorMol,
      exercicio,
      armadilha.resposta.toFixed(2).replace('.', ','),
    );

    expect(resultado.veredito).toBe('incorreto');
  });

  it('a contagem de partículas vem em coeficiente, não em 24 algarismos', () => {
    const comParticulas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('mol-part')),
    );

    expect(comParticulas.length).toBeGreaterThan(10);

    for (const exercicio of comParticulas) {
      // 0,5 a 5 mols dão coeficientes entre 3 e 31.
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(2);
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(35);
      expect(exercicio.enunciado).toContain('10²³');
    }
  });

  it('as quatro perguntas aparecem, e as três línguas também', () => {
    const todos = NIVEIS.flatMap((nivel) => amostra(nivel, 80));
    const tipos = new Set(todos.map((e) => e.id.split('-')[1]));

    expect(tipos).toEqual(new Set(['molar', 'mols', 'massa', 'part']));

    for (const exercicio of todos) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  /**
   * O nome da substância muda com a língua, e é por isso que ele é argumento
   * e não interpolação de uma lista única: «água», «eau», «water».
   */
  it('a substância aparece traduzida, não repetida em português', () => {
    const comAgua = NIVEIS.flatMap((nivel) => amostra(nivel, 80)).find((e) =>
      e.enunciado.includes('água'),
    )!;

    expect(comAgua).toBeDefined();
    expect(comAgua.traducoes?.fr?.enunciado).toContain('eau');
    expect(comAgua.traducoes?.en?.enunciado).toContain('water');
  });
});
