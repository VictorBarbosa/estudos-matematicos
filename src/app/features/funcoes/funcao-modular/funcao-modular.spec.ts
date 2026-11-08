import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorModular } from '@features/funcoes/funcao-modular/funcao-modular.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1212);
  return Array.from({ length: quantidade }, () => geradorModular.gerar(nivel, rng));
}

describe('geradorModular', () => {
  it('avisa «Responda como fração» exatamente quando a resposta não é inteira', () => {
    // Com 29/6 de resposta, «informe o valor de x» não dizia se era para
    // arredondar — e 29/6 não tem decimal exato, então arredondar era errar.
    let fracionarias = 0;
    let inteiras = 0;

    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel)) {
        const avisa = exercicio.enunciado.endsWith(' Responda como fração.');
        expect(avisa).toBe(!exercicio.gabarito.ehInteira);

        if (exercicio.gabarito.ehInteira) {
          inteiras++;
        } else {
          fracionarias++;
        }
      }
    }

    // Uma amostra que só tivesse um dos casos não provaria nada.
    expect(fracionarias).toBeGreaterThan(0);
    expect(inteiras).toBeGreaterThan(0);
  });

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
        }
      }
    });
  }

  it('o valor de f(x) nunca é negativo', () => {
    const valores = amostra('medio', 120).filter((e) => e.enunciado.startsWith('Qual é o valor'));

    for (const exercicio of valores) {
      expect(exercicio.gabarito.ehNegativa).toBe(false);
    }
  });

  it('diagnostica quem deixa o módulo negativo', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('nunca devolve')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('nunca devolve'))!;

    const resultado = corrigir(geradorModular, exercicio, armadilha.resposta.toString());
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('modular.distancia');
  });

  it('a equação modular registra as duas soluções na resolução', () => {
    const exercicio = amostra('dificil', 80).find((e) => e.enunciado.includes('MAIOR'))!;

    expect(exercicio.resolucao.passos[0]?.tex).toContain('\\text{ou}');
    expect(exercicio.resolucao.passos[1]?.tex).toContain('\\text{ou}');
  });

  it('avisa quem responde a menor das duas soluções', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('a menor')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('a menor'))!;
    const resultado = corrigir(geradorModular, exercicio, armadilha.resposta.toString());

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('DUAS respostas');
  });
});
