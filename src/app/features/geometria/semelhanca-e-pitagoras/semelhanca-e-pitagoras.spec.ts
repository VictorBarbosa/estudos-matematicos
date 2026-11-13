import { classificarTriangulo, escalaComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorSemelhanca } from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1123);
  return Array.from({ length: quantidade }, () => geradorSemelhanca.gerar(nivel, rng));
}

describe('geradorSemelhanca', () => {
  it('a dica da escala chega à tela, com o número do enunciado', () => {
    // Estava presa no Fácil, nível em que a escala não é sorteada: escrita no
    // código, nunca vista. E dizia «k^2», cru, em texto corrido.
    // Outras perguntas do Médio também têm dica agora; esta trava é a da escala.
    const comDica = amostra('medio', 200).filter(
      (e) => e.dica !== undefined && e.enunciado.includes('Ampliando'),
    );

    expect(comDica.length).toBeGreaterThan(0);

    for (const exercicio of comDica) {
      const k = /k = (\d+(?:,\d+)?)/.exec(exercicio.dica!)![1]!;
      expect(exercicio.enunciado).toContain(`por ${k}`);
      expect(exercicio.dica).toContain(`o fator é ${k}²`);
      expect(exercicio.dica).not.toContain('^');
    }
  });

  it('a resolução da escala substitui o k pelo número', () => {
    // «k² = 16» não mostra de onde veio o 16.
    const escala = amostra('medio', 200).filter((e) => e.enunciado.includes('Ampliando'));
    expect(escala.length).toBeGreaterThan(0);

    for (const exercicio of escala) {
      const k = /por (\d+(?:,\d+)?)/.exec(exercicio.enunciado)![1]!.replace(',', '{,}');
      const textos = exercicio.resolucao.passos.map((passo) => passo.tex);

      expect(textos.some((tex) => tex.includes(`${k}^{2}`))).toBe(true);
    }
  });

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorSemelhanca.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, todo exercício traz resolução e conceitos`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.resultado).toBe(exercicio.gabarito);
      }
    });
  }

  it('a hipotenusa fecha Pitágoras e forma triângulo retângulo', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('Quanto mede a hipotenusa'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, b, c] = /b = (\d+) \\qquad c = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito ** 2).toBeCloseTo(Number(b) ** 2 + Number(c) ** 2, 6);
      expect(classificarTriangulo(Number(b), Number(c), exercicio.gabarito).angulo).toBe(
        'retangulo',
      );
    }
  });

  it('a hipotenusa é sempre o maior lado', () => {
    for (const exercicio of amostra('facil', 90).filter((e) =>
      e.enunciado.includes('Quanto mede a hipotenusa'),
    )) {
      const [, b, c] = /b = (\d+) \\qquad c = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeGreaterThan(Number(b));
      expect(exercicio.gabarito).toBeGreaterThan(Number(c));
      expect(exercicio.gabarito).toBeLessThan(Number(b) + Number(c));
    }
  });

  it('o cateto que falta confere com a subtração dos quadrados', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('outro cateto'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, a, b] = /a = (\d+) \\qquad b = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito ** 2).toBeCloseTo(Number(a) ** 2 - Number(b) ** 2, 6);
      expect(exercicio.gabarito).toBeLessThan(Number(a));
    }
  });

  it('Tales mantém a proporção', () => {
    const exercicios = amostra('medio', 120).filter((e) => e.enunciado.includes('transversais'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, a, b, c] = /\\frac\{(\d+)\}\{(\d+)\} = \\frac\{(\d+)\}\{x\}/.exec(
        exercicio.enunciadoTex,
      )!;

      expect(Number(a) / Number(b)).toBeCloseTo(Number(c) / exercicio.gabarito, 6);
    }
  });

  it('a área escala com k² e o volume com k³', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('Ampliando'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const k = Number(/k = ([\d{},]+)/.exec(exercicio.enunciadoTex)![1].replace('{,}', '.'));
      const original = Number(/[AV] = (\d+)/.exec(exercicio.enunciadoTex)![1]);
      const dimensao = exercicio.enunciadoTex.includes('A = ') ? 2 : 3;

      expect(exercicio.gabarito).toBeCloseTo(
        original * escalaComPassos(k, dimensao as 2 | 3).resultado,
        6,
      );
    }
  });

  it('diagnostica quem soma os catetos', () => {
    const exercicio = amostra('facil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('não se somam diretamente')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('não se somam diretamente'),
    )!;

    const resultado = corrigir(geradorSemelhanca, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('semelhanca.pitagoras');
  });

  it('diagnostica quem escala a área por k em vez de k²', () => {
    const exercicio = amostra('dificil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('multiplica COMPRIMENTOS')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('multiplica COMPRIMENTOS'),
    )!;

    const resultado = corrigir(geradorSemelhanca, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('semelhanca.razao');
  });

  it('aceita decimal com vírgula e fração', () => {
    expect(geradorSemelhanca.analisar('7,5')).toBe(7.5);
    expect(geradorSemelhanca.analisar('15/2')).toBe(7.5);
    expect(geradorSemelhanca.analisar('13')).toBe(13);
    expect(geradorSemelhanca.analisar('treze')).toBeNull();
  });
});

/**
 * O enunciado mostra a figura antes de dar nome a ela.
 *
 * «Quanto mede a projeção do cateto de 63 cm sobre a hipotenusa?» era tudo o
 * que a pergunta dizia, e o nome supõe uma figura que quem está aprendendo
 * ainda não sabe desenhar. O termo continua — tirá-lo abandonaria o aluno na
 * prova —, mas agora vem depois do desenho.
 */
describe('geradorSemelhanca: o enunciado se explica', () => {
  const metricas = amostra('extremo', 200).filter((e) => e.enunciado.includes('ângulo reto'));

  it('há relações métricas na amostra', () => {
    expect(metricas.length).toBeGreaterThan(0);
  });

  it('diz de onde o segmento sai e que ângulo ele faz, antes de nomeá-lo', () => {
    for (const exercicio of metricas) {
      expect(exercicio.enunciado).toContain('Do vértice do ângulo reto');
      expect(exercicio.enunciado).toContain('formando 90°');

      const nome = exercicio.enunciado.includes('projeção')
        ? 'projeção'
        : 'altura relativa à hipotenusa';
      const ondeExplica = exercicio.enunciado.indexOf('formando 90°');
      const ondeNomeia = exercicio.enunciado.indexOf(nome);

      // O desenho vem primeiro; o nome, depois.
      expect(ondeNomeia).toBeGreaterThan(ondeExplica);
    }
  });

  it('a dica das relações métricas diz o caminho em palavras, não em letras soltas', () => {
    const comDica = amostra('dificil', 200).filter(
      (e) => e.enunciado.includes('ângulo reto') && e.dica !== undefined,
    );

    expect(comDica.length).toBeGreaterThan(0);

    for (const exercicio of comDica) {
      // Era `a·h = b·c, e c² = a·m.`: quatro letras que ninguém apresentou.
      expect(exercicio.dica).toContain('hipotenusa');
      expect(exercicio.dica).not.toMatch(/a·h|a \\cdot h/);
    }
  });

  it('Tales localiza cada pedaço em vez de dizer «correspondente»', () => {
    const tales = amostra('medio', 200).filter((e) => e.enunciado.includes('transversais'));

    expect(tales.length).toBeGreaterThan(0);

    for (const exercicio of tales) {
      expect(exercicio.enunciado).toContain('1ª e a 2ª paralela');
      expect(exercicio.enunciado).not.toContain('feixe de paralelas');
    }
  });

  it('a escala concorda em gênero: a área e o volume', () => {
    const escalas = amostra('dificil', 200).filter((e) => e.enunciado.includes('Ampliando'));

    expect(escalas.length).toBeGreaterThan(0);

    for (const exercicio of escalas) {
      // Saía «qual é a nova volume?».
      expect(exercicio.enunciado).not.toContain('a nova volume');
      expect(exercicio.enunciado).toMatch(/a nova área|o novo volume/);
    }
  });

  it('a sombra da vara nunca é igual à altura dela', () => {
    const sombras = amostra('facil', 200).filter((e) => e.enunciado.includes('sombra'));

    expect(sombras.length).toBeGreaterThan(0);

    for (const exercicio of sombras) {
      const [, vara, sombraVara] = /vara de (\d+) m projeta uma sombra de (\d+) m/.exec(
        exercicio.enunciado,
      )!;

      // Razão 1 faz a altura do prédio ser a própria sombra: não treina nada.
      expect(vara).not.toBe(sombraVara);
    }
  });

  it('as nove formas de pergunta estão nas três línguas', () => {
    const formas = new Set<string>();

    for (const nivel of ['facil', 'medio', 'dificil', 'extremo'] as const) {
      for (const exercicio of amostra(nivel, 200)) {
        formas.add(exercicio.enunciado.replace(/\d+(,\d+)?/g, '#'));

        expect(exercicio.traducoes?.fr?.enunciado, exercicio.enunciado).toBeTruthy();
        expect(exercicio.traducoes?.en?.enunciado, exercicio.enunciado).toBeTruthy();

        if (exercicio.dica !== undefined) {
          expect(exercicio.traducoes?.fr?.dica, exercicio.enunciado).toBeTruthy();
          expect(exercicio.traducoes?.en?.dica, exercicio.enunciado).toBeTruthy();
        }
      }
    }

    expect(formas.size).toBe(9);
  });
});
