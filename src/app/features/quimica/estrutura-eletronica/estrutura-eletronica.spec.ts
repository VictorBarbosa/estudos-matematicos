import { ELEMENTOS, SEGUE_A_REGRA, camadas } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEletrons } from '@features/quimica/estrutura-eletronica/estrutura-eletronica.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(443);
  return Array.from({ length: quantidade }, () => geradorEletrons.gerar(nivel, rng));
}

/** O símbolo que o enunciado nomeia. */
function elementoDoEnunciado(enunciado: string): string {
  const [, simbolo] = /(\w+) \(Z = \d+\)/.exec(enunciado)!;
  return simbolo!;
}

describe('geradorEletrons', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro e não negativo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito), exercicio.enunciado).toBe(true);
        expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThanOrEqual(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorEletrons.saoEquivalentes!(armadilha.resposta, exercicio.gabarito),
            `${exercicio.enunciado} → ${armadilha.resposta}`,
          ).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito exibido é aceito de volta`, () => {
      for (const exercicio of amostra(nivel, 30)) {
        const escrito = geradorEletrons.formatar(exercicio.gabarito);
        expect(corrigir(geradorEletrons, exercicio, escrito).veredito, escrito).toBe('correto');
      }
    });
  }

  /**
   * Nenhum exercício sorteia um elemento em que a regra diagonal falha.
   *
   * Cobrar a regra onde ela não acerta a configuração medida ensinaria a regra
   * errada, e o aluno levaria isso para a prova.
   */
  it('nunca sorteia as exceções da regra diagonal', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      const simbolo = elementoDoEnunciado(exercicio.enunciado);
      const elemento = ELEMENTOS.find((atual) => atual.simbolo === simbolo)!;

      expect(elemento, exercicio.enunciado).toBeDefined();
      expect(SEGUE_A_REGRA(elemento.numeroAtomico), exercicio.enunciado).toBe(true);
    }
  });

  /**
   * A pergunta de última camada só vai para os representativos: nos metais de
   * transição a valência não é só a última camada, e a resposta seria uma
   * simplificação apresentada como verdade.
   */
  it('a última camada só é pedida dos representativos', () => {
    const ultimas = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('elet-ultima')),
    );

    expect(ultimas.length).toBeGreaterThan(20);

    for (const exercicio of ultimas) {
      const simbolo = elementoDoEnunciado(exercicio.enunciado);
      const { numeroAtomico } = ELEMENTOS.find((atual) => atual.simbolo === simbolo)!;

      expect(numeroAtomico <= 20 || [35, 53].includes(numeroAtomico), exercicio.enunciado).toBe(
        true,
      );
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThanOrEqual(8);
    }
  });

  /** Nenhuma camada tem mais elétrons do que cabe nela. */
  it('a resposta de camada nunca passa de 2n²', () => {
    const porCamada = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 60).filter((e) => e.id.startsWith('elet-camada')),
    );

    expect(porCamada.length).toBeGreaterThan(20);

    for (const exercicio of porCamada) {
      const [, n] = /camada (\d)/.exec(exercicio.enunciado)!;

      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThanOrEqual(2 * Number(n) ** 2);
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
    }
  });

  /**
   * O subnível vazio é resposta legítima — é o caso do 3d do potássio, e é
   * justamente onde a ordem de energia cobra.
   */
  it('o subnível vazio aparece, com gabarito zero', () => {
    const vazios = NIVEIS.flatMap((nivel) =>
      amostra(nivel, 80).filter((e) => e.id.startsWith('elet-sub') && e.gabarito === 0),
    );

    expect(vazios.length).toBeGreaterThan(0);
  });

  /** As camadas somadas dão o número atômico: a distribuição não perde elétron. */
  it('a distribuição conserva os elétrons', () => {
    for (const elemento of ELEMENTOS) {
      const soma = camadas(elemento.numeroAtomico).reduce((total, valor) => total + valor, 0);

      expect(soma, elemento.simbolo).toBe(elemento.numeroAtomico);
    }
  });

  it('diagnostica o preenchimento na ordem dos números', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 80)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('ordem dos NÚMEROS')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('ordem dos NÚMEROS'),
    )!;
    const resultado = corrigir(geradorEletrons, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('4s');
  });

  it('diagnostica o número atômico dado como última camada', () => {
    const exercicio = NIVEIS.flatMap((nivel) => amostra(nivel, 60)).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('total de elétrons do átomo')),
    )!;

    expect(exercicio).toBeDefined();

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('total de elétrons do átomo'),
    )!;
    const resultado = corrigir(geradorEletrons, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('ÚLTIMA');
  });

  /** O enunciado não mostra a distribuição: montá-la é a tarefa. */
  it('o enunciado não entrega a distribuição', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.enunciadoTex, exercicio.enunciado).toBe('');
    }
  });

  it('o enunciado vem nas três línguas, com dica', () => {
    for (const exercicio of NIVEIS.flatMap((nivel) => amostra(nivel, 60))) {
      expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();
      expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
      expect(exercicio.dica, exercicio.enunciado).toBeTruthy();
    }
  });

  it('as quatro perguntas aparecem', () => {
    const tipos = new Set(
      NIVEIS.flatMap((nivel) => amostra(nivel, 60)).map((e) => e.id.split('-')[1]),
    );

    expect(tipos).toEqual(new Set(['ultima', 'camada', 'sub', 'periodo']));
  });
});
