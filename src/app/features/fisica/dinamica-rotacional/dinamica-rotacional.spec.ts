import {
  CORPOS_RIGIDOS,
  corpoPorNome,
  energiaDeRotacaoComPassos,
  momentoDeInercia,
  rolamentoComPassos,
  segundaLeiRotacionalComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorDinamicaRotacional } from '@features/fisica/dinamica-rotacional/dinamica-rotacional.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(81_341);
  return Array.from({ length: quantidade }, () => geradorDinamicaRotacional.gerar(nivel, rng));
}

describe('geradorDinamicaRotacional', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorDinamicaRotacional.formatar(exercicio.gabarito);
        expect(corrigir(geradorDinamicaRotacional, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorDinamicaRotacional.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('a barra nunca aparece, porque o raio dela é outra coisa', () => {
    // Na barra o "r" da fórmula é o comprimento, não a distância ao eixo:
    // misturá-la com os demais corpos tornaria o enunciado ambíguo.
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 120)) {
        expect(exercicio.enunciado, exercicio.enunciado).not.toContain('barra');
      }
    }
  });

  it('o Difícil chega ao rolamento', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('rotacional.rolamento')).toBe(true);
    expect(conceitos.has('rotacional.energia')).toBe(true);
  });

  it('diagnostica quem esquece o fator de forma', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou o fator de forma')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Faltou o fator de forma'),
    )!;
    const resultado = corrigir(
      geradorDinamicaRotacional,
      exercicio,
      geradorDinamicaRotacional.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('rotacional.inercia');
  });
});

/**
 * O motor da rotação.
 *
 * O fato central é que o momento de inércia depende de onde a massa está —
 * e os testes abaixo medem isso de todas as formas que o tópico cobra.
 */
describe('dinâmica rotacional', () => {
  const disco = corpoPorNome('disco ou cilindro maciço')!;
  const aro = corpoPorNome('casca cilíndrica')!;
  const esfera = corpoPorNome('esfera maciça')!;

  it('o aro resiste ao dobro do disco, com mesma massa e raio', () => {
    expect(momentoDeInercia(aro, 2, 0.5)).toBeCloseTo(2 * momentoDeInercia(disco, 2, 0.5), 12);
  });

  it('a barra pela ponta resiste quatro vezes mais que pelo centro', () => {
    const centro = corpoPorNome('barra pelo centro')!;
    const ponta = corpoPorNome('barra pela ponta')!;

    expect(ponta.fator / centro.fator).toBeCloseTo(4, 12);
  });

  it('o raio entra ao quadrado', () => {
    expect(momentoDeInercia(disco, 1, 2)).toBeCloseTo(4 * momentoDeInercia(disco, 1, 1), 12);
  });

  it('todo corpo da tabela tem fator entre zero e um', () => {
    for (const corpo of CORPOS_RIGIDOS) {
      expect(corpo.fator, corpo.nome).toBeGreaterThan(0);
      expect(corpo.fator, corpo.nome).toBeLessThanOrEqual(1);
      expect(corpo.observacao.length, corpo.nome).toBeGreaterThan(20);
    }
  });

  it('a segunda lei rotacional é a de Newton com outras letras', () => {
    const { resultado } = segundaLeiRotacionalComPassos(disco, 2, 0.5, 3);

    // I = ½·2·0,25 = 0,25 ⟹ α = 3/0,25 = 12
    expect(resultado).toBeCloseTo(12, 12);
  });

  it('a energia de rotação cresce com o quadrado da velocidade angular', () => {
    const devagar = energiaDeRotacaoComPassos(disco, 2, 0.5, 5).resultado;
    const rapido = energiaDeRotacaoComPassos(disco, 2, 0.5, 10).resultado;

    expect(rapido).toBeCloseTo(4 * devagar, 10);
  });

  it('na rampa, a esfera chega antes do aro', () => {
    const daEsfera = rolamentoComPassos(esfera, 2).resultado;
    const doAro = rolamentoComPassos(aro, 2).resultado;

    expect(daEsfera).toBeGreaterThan(doAro);
  });

  it('e os dois chegam mais devagar que quem apenas desliza', () => {
    const deslizando = Math.sqrt(2 * 9.81 * 2);

    for (const corpo of [esfera, disco, aro]) {
      expect(rolamentoComPassos(corpo, 2).resultado, corpo.nome).toBeLessThan(deslizando);
    }
  });

  it('a velocidade do rolamento não depende da massa nem do raio', () => {
    // Massa e raio se cancelam na conta: só o formato decide.
    const { resultado, passos } = rolamentoComPassos(esfera, 3);

    expect(resultado).toBeCloseTo(Math.sqrt((2 * 9.81 * 3) / 1.4), 10);
    expect(passos[2]!.nota).toContain('não depende da massa');
  });

  it('o aro guarda metade da energia na rotação', () => {
    const { passos } = rolamentoComPassos(aro, 1);

    expect(passos[3]!.nota).toContain('50');
  });
});
