import { cilindricasComPassos, esfericasComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorCoordenadasNoEspaco } from '@features/calculo-3/coordenadas-no-espaco/coordenadas-no-espaco.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(20_260);
  return Array.from({ length: quantidade }, () => geradorCoordenadasNoEspaco.gerar(nivel, rng));
}

describe('geradorCoordenadasNoEspaco', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorCoordenadasNoEspaco.formatar(exercicio.gabarito);
        expect(corrigir(geradorCoordenadasNoEspaco, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorCoordenadasNoEspaco.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil trabalha em esféricas', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('coordenadas.esfericas')).toBe(true);
  });

  it('todo enunciado em esféricas diz de onde o ângulo polar é medido', () => {
    // Sem isso, a convenção fica ambígua e o exercício deixa de ter resposta.
    for (const exercicio of amostra('dificil', 200)) {
      if (!exercicio.enunciado.includes('coordenadas esféricas ρ')) {
        continue;
      }
      expect(exercicio.enunciado, exercicio.enunciado).toContain('do eixo z');
    }
  });

  it('diagnostica quem troca seno e cosseno do ângulo polar', () => {
    const exercicio = amostra('dificil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('ângulo polar ficaram trocados')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('ângulo polar ficaram trocados'),
    )!;
    const resultado = corrigir(
      geradorCoordenadasNoEspaco,
      exercicio,
      geradorCoordenadasNoEspaco.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('coordenadas.esfericas');
  });
});

/**
 * O motor das coordenadas no espaço.
 *
 * A distinção que os testes protegem é a central do tópico: o r cilíndrico
 * mede a distância ao EIXO, e o rho esférico, à ORIGEM.
 */
describe('coordenadas no espaço', () => {
  it('em cilíndricas, o z não participa da conversão', () => {
    const { passos } = cilindricasComPassos(3, 0, 7);

    expect(passos[1]!.tex).toContain('z = 7');
  });

  it('o raio cilíndrico é a distância ao eixo', () => {
    const { passos } = cilindricasComPassos(5, 37, 100);

    // A altura é enorme, e mesmo assim o r continua valendo 5.
    expect(passos[2]!.tex).toContain('5');
  });

  it('no polo norte, o ponto sobe direto pelo eixo', () => {
    const { resultado } = esfericasComPassos(6, 0, 45);

    // O resultado devolvido é o z, que no polo vale o raio inteiro.
    expect(resultado).toBeCloseTo(6, 10);
  });

  it('no polo sul, ele desce o mesmo tanto', () => {
    expect(esfericasComPassos(6, 180, 45).resultado).toBeCloseTo(-6, 10);
  });

  it('no equador, a altura é nula e o raio fica todo no plano', () => {
    expect(esfericasComPassos(6, 90, 0).resultado).toBeCloseTo(0, 10);
  });

  it('o ângulo polar usa cosseno na altura, não seno', () => {
    // A 60 graus do eixo z, a altura é metade do raio — e não o seno dele.
    expect(esfericasComPassos(10, 60, 0).resultado).toBeCloseTo(5, 10);
  });

  it('a conversão preserva a distância à origem', () => {
    const { passos } = esfericasComPassos(7, 35, 110);

    expect(passos[2]!.tex).toContain('7');
  });

  it('a nota lembra qual é o elemento de volume esférico', () => {
    const { passos } = esfericasComPassos(2, 45, 45);

    expect(passos[2]!.nota).toContain('rho ao quadrado');
  });
});
