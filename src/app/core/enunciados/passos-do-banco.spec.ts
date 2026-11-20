import { todosOsEnunciados } from '@core/enunciados/models/enunciado.model';
import { avaliarLatex } from '@core/enunciados/models/regras-de-passos';
import {
  passosDoBanco,
  temResolvedor,
  type DadosDoBanco,
} from '@core/enunciados/models/passos-do-banco';
import { vestirTexto } from '@core/enunciados/models/enunciado.model';

/**
 * O guarda dos passos de resolução do banco.
 *
 * Uma entrada do banco é texto escrito à mão com os números no arquivo. Até
 * pouco tempo, a resolução dela era genérica — os dados e a resposta —, e
 * genérica não ensina: quem errava «divida 150 em partes proporcionais a 1 e 4»
 * via o número certo e nenhuma pista do caminho.
 *
 * Este guarda faz duas coisas:
 *
 * 1. confere que o resolvedor RECALCULA a resposta certa: ele não copia o
 *    `total`, ele refaz a conta e devolve o número. Se a fórmula estiver
 *    errada, o teste acusa em todas as entradas daquela forma;
 * 2. mede a cobertura, para o que falta aparecer como dívida e não como
 *    esquecimento.
 */

const ENTRADAS = todosOsEnunciados();

/**
 * O piso da cobertura — hoje baixo, e é o retrato honesto do trabalho.
 *
 * O banco tem 7380 entradas em 1943 formas de texto, e uma forma só ganha
 * passos quando alguém escreve a fórmula dela. Cada tópico traduzido sobe este
 * número; ele nunca desce. Hoje: 5645 entradas (76,5%).
 *
 * O número CAIU de 5679 para 5645 quando os passos começaram a rejeitar contas
 * inválidas: antes, uma regra que produzia `NaN` contava como cobertura e o
 * aluno via «= NaN» na tela. O que parece regressão é a mentira que saiu.
 *
 * E caiu de novo, de 5645 para 4273 (76,5% → 57,9%), pelo mesmo motivo e com
 * a mesma honestidade: a trilha passou a ser recusada quando sobra `#` nela.
 * São 246 formas de fórmula que pedem mais marcadores do que o texto tem — a
 * conta ia à tela com `\max(0, # - #)`, que não é LaTeX válido, e o KaTeX
 * mostrava a fórmula CRUA. Essas 1 372 entradas contavam como cobertas e não
 * estavam: o aluno via defeito, não resolução.
 *
 * Cada uma dessas formas consertada — trocar `#` por `#1`, `#2`… onde a
 * fórmula repete um valor — devolve as entradas dela a este número. As cinco
 * primeiras (o efeito Doppler, em duas formas, e o arranjo, em três)
 * devolveram 36 entradas: 4273 → 4309.
 *
 * Depois delas, as 283 formas restantes, uma a uma: 4273 → 5557 (75,3%). O
 * trabalho é sempre o mesmo e rende por família — uma regra consertada devolve
 * todas as entradas que a usam. Cinco delas não tinham como ser escritas com
 * marcadores (o numerador da fração geratriz, a carga do íon, os lados
 * ordenados do triângulo): essas passaram a calcular a própria linha.
 *
 * O que falta agora são 85 tópicos SEM NENHUMA regra — e esses pedem escrever
 * a fórmula de cada forma de pergunta, não mais consertar índice.
 */
const COBERTURA_MINIMA = 0.7529;

/**
 * Quantas substituições ainda mostram conta diferente da resposta.
 *
 * Zero é o alvo. Eram 538 medidas com uma régua torta: `avaliarLatex` não
 * sabia elevar um parêntese — `3,14 \cdot (15)^2` virava um OU-exclusivo em
 * JavaScript e valia 45 em vez de 706,86 —, e isso tanto escondia erro quanto
 * inventava erro que não existia. Com a potência lida de verdade, a conta
 * honesta deu 590; corrigir os índices dos marcadores em 60 regras baixou para
 * 120.
 *
 * As que ficam são de três tipos, e nenhuma é índice trocado: a substituição
 * que mostra uma COMPARAÇÃO e não a resposta (quantas soluções tem |x − a| = d),
 * a que mostra uma diferença cujo módulo a conta toma (a fem induzida de um
 * campo que cai), e a que carrega um fator em símbolo (o `z` da normal, a
 * constante de um gás).
 */
const TETO_DE_SUBSTITUICOES_INCOERENTES = 120;

function dadosDe(entrada: (typeof ENTRADAS)[number]): DadosDoBanco {
  const { total: _fora, ...resto } = entrada['dados-calculo'] ?? {};
  return resto;
}

function textoDe(entrada: (typeof ENTRADAS)[number]): string {
  return vestirTexto(entrada.enunciado.br, entrada['dados-calculo'] ?? {}, 'pt');
}

const semResolver = ENTRADAS.filter(
  (entrada) => passosDoBanco(entrada.topico, dadosDe(entrada), textoDe(entrada)) === null,
);

describe('passos de resolução do banco', () => {
  it('o resolvedor recalculado bate com o total do arquivo', () => {
    const erradas: string[] = [];

    for (const entrada of ENTRADAS) {
      const resolucao = passosDoBanco(entrada.topico, dadosDe(entrada), textoDe(entrada));

      if (resolucao === null) {
        continue;
      }

      const esperado = Number(entrada['dados-calculo']?.['total']);
      const obtido = Number(resolucao.valor);

      // Frações e decimais não passam por `Number`; a comparação é só onde os
      // dois lados são numéricos.
      if (!Number.isFinite(esperado) || !Number.isFinite(obtido)) {
        continue;
      }

      if (Math.abs(esperado - obtido) > 0.011) {
        erradas.push(
          `${entrada.topico}: total ${esperado}, resolvido ${obtido} — ${entrada.enunciado.br.slice(0, 60)}`,
        );
      }
    }

    expect(erradas.slice(0, 8), `${erradas.length} entradas com conta divergente`).toEqual([]);
  });

  it('a conta mostrada na substituição fecha com a resposta', () => {
    /*
     * O guarda anterior compara a resposta recalculada com o arquivo, e isso
     * pega fórmula errada. Não pega a SUBSTITUIÇÃO errada: a regra do valor
     * mínimo da quadrática escrevia `y_v = 6 - 8^2/4` (= −10) e devolvia −1 —
     * a conta em JS estava certa, e a tela mostrava outra conta.
     *
     * Aqui o lado direito da substituição é lido de volta como número. Só
     * reprova quando os dois lados são numéricos: uma expressão que o avaliador
     * não entende é pulada, e não vira alarme falso.
     */
    const incoerentes: string[] = [];

    for (const entrada of ENTRADAS) {
      const resolucao = passosDoBanco(entrada.topico, dadosDe(entrada), textoDe(entrada));
      const substituicao = resolucao?.passos[1]?.tex;
      const resposta = Number(resolucao?.valor);

      if (substituicao === undefined || !Number.isFinite(resposta)) {
        continue;
      }

      const mostrado = avaliarLatex(substituicao);

      if (mostrado === null) {
        continue;
      }

      // A tolerância acompanha o arredondamento do próprio campo.
      if (Math.abs(mostrado - resposta) > 0.02) {
        incoerentes.push(
          `${entrada.topico}: mostra ${mostrado.toFixed(2)}, responde ${resposta.toFixed(2)} — ${entrada.enunciado.br.slice(0, 60)}`,
        );
      }
    }

    /*
     * A dívida medida, não escondida.
     *
     * Eram 1138 quando este guarda nasceu; as correções automáticas de ordem
     * de grupo baixaram para perto de 500. O piso só desce: uma regra nova com
     * a substituição trocada REPROVA, e a mensagem diz qual.
     */
    expect(
      incoerentes.length,
      `${incoerentes.length} substituições não fecham com a resposta. ` +
        `Primeiras: ${incoerentes.slice(0, 3).join(' | ')}`,
    ).toBeLessThanOrEqual(TETO_DE_SUBSTITUICOES_INCOERENTES);
  });

  it('todo resolvedor devolve pelo menos dois passos', () => {
    const magras: string[] = [];

    for (const entrada of ENTRADAS) {
      const resolucao = passosDoBanco(entrada.topico, dadosDe(entrada), textoDe(entrada));
      if (resolucao !== null && resolucao.passos.length < 2) {
        magras.push(entrada.topico);
      }
    }

    expect(magras).toEqual([]);
  });

  it('a cobertura não cai', () => {
    const total = ENTRADAS.length;
    const comPassos = total - semResolver.length;

    expect(
      comPassos / total,
      `${comPassos}/${total} entradas com passos próprios. Sem resolvedor: ` +
        `${new Set(semResolver.map((e) => e.topico)).size} tópicos, ` +
        `${semResolver.length} entradas.`,
    ).toBeGreaterThanOrEqual(COBERTURA_MINIMA);
  });

  it('a divisão proporcional do exemplo tem passos de verdade', () => {
    // «Divida 150 em partes proporcionais a 1 e 4. Qual é a MENOR parte?»
    const resolucao = passosDoBanco(
      'razao-proporcao',
      { valor: '150', p1: '1', p2: '4' },
      'Divida 150 em partes proporcionais a 1 e 4.',
    );

    expect(resolucao).not.toBeNull();
    expect(resolucao!.valor).toBe('30');
    // Somar as partes, dividir o valor pela soma, multiplicar pela menor.
    expect(resolucao!.passos.length).toBe(3);
    expect(resolucao!.passos[0]!.tex).toContain('1 + 4 = 5');
    expect(resolucao!.passos[1]!.tex).toContain('frac{150}{5}');
    expect(resolucao!.passos[2]!.tex).toContain('= 30');
  });
});
