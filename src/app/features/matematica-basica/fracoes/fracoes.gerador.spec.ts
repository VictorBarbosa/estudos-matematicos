import { Fracao, mdc, resolverComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorFracoes } from './fracoes.gerador';

/** Gera uma amostra de exercícios de um nível, de forma determinística. */
function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2024);
  return Array.from({ length: quantidade }, () => geradorFracoes.gerar(nivel, rng));
}

describe('determinismo', () => {
  it('a mesma semente produz o mesmo exercício', () => {
    const primeiro = geradorFracoes.gerar('medio', criarRng(7));
    const segundo = geradorFracoes.gerar('medio', criarRng(7));

    expect(primeiro.enunciadoTex).toBe(segundo.enunciadoTex);
    expect(primeiro.gabarito.toString()).toBe(segundo.gabarito.toString());
  });
});

describe('consistência dos exercícios', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com o motor matemático`, () => {
      for (const exercicio of amostra(nivel)) {
        const esperado = exercicio.resolucao.resultado;
        expect(exercicio.gabarito.igualA(esperado)).toBe(true);
      }
    });

    it(`no nível ${nivel}, todo exercício tem enunciado, conceitos e resolução`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.enunciadoTex).toContain('=');
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
        expect(exercicio.resolucao.passos.length).toBeGreaterThanOrEqual(3);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta.igualA(exercicio.gabarito)).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }
});

describe('calibração dos níveis', () => {
  it('no fácil, um denominador é múltiplo do outro e o resultado não é negativo', () => {
    for (const exercicio of amostra('facil')) {
      const [, esquerda, direita] = /\\frac\{-?\d+\}\{(\d+)\}.*\\frac\{-?\d+\}\{(\d+)\}/.exec(
        exercicio.enunciadoTex,
      ) ?? [undefined, undefined, undefined];

      const d1 = Number(esquerda);
      const d2 = Number(direita);
      expect(Math.max(d1, d2) % Math.min(d1, d2)).toBe(0);
      expect(exercicio.gabarito.ehNegativa).toBe(false);
    }
  });

  it('no médio, os denominadores são coprimos, exigindo o cálculo real do MMC', () => {
    for (const exercicio of amostra('medio')) {
      const encontrados = [...exercicio.enunciadoTex.matchAll(/\\frac\{-?\d+\}\{(\d+)\}/g)].map(
        (encontro) => Number(encontro[1]),
      );

      expect(encontrados.length).toBe(2);
      expect(mdc(encontrados[0]!, encontrados[1]!)).toBe(1);
    }
  });

  it('no difícil, a divisão nunca aparece com divisor zero', () => {
    // Se algum divisor fosse zero, `gerar` teria lançado ao resolver.
    expect(() => amostra('dificil', 200)).not.toThrow();
  });
});

describe('correção das respostas', () => {
  const exercicio = geradorFracoes.gerar('facil', criarRng(11));

  it('aceita a resposta correta', () => {
    const resultado = corrigir(geradorFracoes, exercicio, exercicio.gabarito.toString());
    expect(resultado.veredito).toBe('correto');
  });

  it('aceita uma forma equivalente não simplificada', () => {
    const gabarito = exercicio.gabarito;
    const equivalente = Fracao.criar(gabarito.numerador * 3, gabarito.denominador * 3);

    const resultado = corrigir(geradorFracoes, exercicio, equivalente.toString());
    expect(resultado.veredito).toBe('correto');
  });

  it('aceita a forma decimal quando ela é exata', () => {
    const resultado = corrigir(
      geradorFracoes,
      { ...exercicio, gabarito: Fracao.criar(1, 2) },
      '0,5',
    );
    expect(resultado.veredito).toBe('correto');
  });

  it('marca como inválido o que não é uma fração', () => {
    const resultado = corrigir(geradorFracoes, exercicio, 'não sei');
    expect(resultado.veredito).toBe('invalido');
  });

  it('diagnostica o erro de somar numeradores e denominadores', () => {
    // 1/4 + 1/6: quem soma os dois termos chega a 2/10.
    const a = Fracao.criar(1, 4);
    const b = Fracao.criar(1, 6);
    const resolucao = resolverComPassos(a, 'somar', b);

    const comArmadilha = {
      ...geradorFracoes.gerar('facil', criarRng(3)),
      gabarito: resolucao.resultado,
      resolucao,
      armadilhas: [
        {
          resposta: Fracao.criar(2, 10),
          diagnostico: 'Somou numeradores com numeradores e denominadores com denominadores.',
          conceito: 'fracoes.operacoes',
          passo: 3,
        },
      ],
    };

    const resultado = corrigir(geradorFracoes, comArmadilha, '2/10');
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('denominadores');
    expect(resultado.conceitoAssociado).toBe('fracoes.operacoes');
    expect(resultado.passoDivergente).toBe(3);
  });

  it('informa o gabarito quando o erro não é um dos previstos', () => {
    const resultado = corrigir(geradorFracoes, exercicio, '999/1000');
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.mensagem).toContain(exercicio.gabarito.toString());
  });
});
