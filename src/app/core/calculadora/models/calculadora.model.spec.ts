import {
  ESTADO_INICIAL,
  calcularInteiros,
  EstadoCalculadora,
  alternarSinal,
  apagar,
  calcular,
  digitar,
  emGraus,
  fecharPendentes,
  formatarValor,
  inverso,
  limpar,
  porcentagem,
} from '@core/calculadora/models/calculadora.model';

/** Digita uma sequência de teclas, como quem aperta uma a uma. */
function teclar(sequencia: readonly string[]): EstadoCalculadora {
  return sequencia.reduce((estado, tecla) => digitar(estado, tecla), ESTADO_INICIAL);
}

/** O valor que a calculadora mostra depois do igual. */
function conta(expressao: string, angulo: 'rad' | 'deg' = 'rad'): string | null {
  return calcular({ ...ESTADO_INICIAL, expressao }, angulo).resultado;
}

describe('a conta', () => {
  it('respeita a ordem das operações', () => {
    // O visor mostra a expressão inteira justamente para que isto fique claro:
    // num site que ensina precedência, 2+3×4 não pode dar 20.
    expect(conta('2+3×4')).toBe('14');
  });

  it('soma decimais sem o lixo do ponto flutuante', () => {
    expect(conta('0,1+0,2')).toBe('0,3');
  });

  it('lê a vírgula como separador decimal', () => {
    expect(conta('1,5×4')).toBe('6');
  });

  it('calcula potência, raiz e logaritmo', () => {
    expect(conta('2^10')).toBe('1024');
    expect(conta('√(144)')).toBe('12');
    expect(conta('log(1000)')).toBe('3');
    expect(conta('ln(e)')).toBe('1');
  });

  it('conhece π e o número de Euler', () => {
    expect(conta('π')).toBe('3,14159265359');
    expect(conta('e^0')).toBe('1');
  });

  it('fecha sozinha os parênteses que ficaram abertos', () => {
    // Quem escreve sin(30 e aperta igual quer o seno de trinta, não um erro.
    expect(fecharPendentes('sin(30')).toBe('sin(30)');
    expect(fecharPendentes('((1+2)')).toBe('((1+2))');
    expect(conta('√(4', 'rad')).toBe('2');
  });

  it('avisa quando a conta não fecha', () => {
    const estado = calcular({ ...ESTADO_INICIAL, expressao: '2+' }, 'rad');

    expect(estado.resultado).toBeNull();
    expect(estado.erro).toContain('calcular');
  });

  it('divisão por zero não vira resultado', () => {
    expect(conta('1÷0')).toBeNull();
  });

  it('o igual numa tela vazia não faz nada', () => {
    expect(calcular(ESTADO_INICIAL, 'rad')).toEqual(ESTADO_INICIAL);
  });
});

describe('graus e radianos', () => {
  it('em radianos, o seno de π vale zero', () => {
    // π não cabe num `double`: o valor exato sai 1,22·10⁻¹⁶, que é zero com
    // poeira binária em cima. Mostrar isso faria a calculadora parecer quebrada.
    expect(conta('sin(π)', 'rad')).toBe('0');
  });

  it('em graus, o cosseno de 90 vale zero', () => {
    expect(conta('cos(90)', 'deg')).toBe('0');
  });

  it('número minúsculo sem trigonometria continua inteiro', () => {
    // 6,6·10⁻³⁴ é a constante de Planck, não ruído: arredondar para zero aqui
    // seria dar uma resposta errada.
    expect(conta('1÷10^20')).toContain('e-20');
    expect(formatarValor(6.626e-34)).toContain('e-34');
  });

  it('em graus, o seno de 30 vale meio', () => {
    expect(conta('sin(30)', 'deg')).toBe('0,5');
  });

  it('converte o argumento inteiro, e não só o primeiro número', () => {
    // `sin(30+60)` é o seno de noventa. Converter só o 30 daria outro número —
    // do tipo que passa despercebido porque continua parecendo plausível.
    expect(emGraus('sin(30+60)')).toContain('(30+60)');
    expect(conta('sin(30+60)', 'deg')).toBe('1');
  });

  it('converte também o seno de dentro de outro', () => {
    const convertido = emGraus('cos(sin(30))');

    expect(convertido.match(/0\.017453/g)?.length).toBe(2);
  });

  it('não mexe em nada quando não há trigonometria', () => {
    expect(emGraus('2+3×4')).toBe('2+3×4');
  });

  it('parêntese aberto não trava a conversão', () => {
    expect(emGraus('sin(30')).toBe('sin(30');
  });
});

describe('as teclas', () => {
  it('o igual guarda a conta e o resultado', () => {
    const estado = calcular(teclar(['1', '2', '+', '3']), 'rad');

    expect(estado.expressao).toBe('12+3');
    expect(estado.resultado).toBe('15');
  });

  it('depois do resultado, um operador continua a conta', () => {
    const depois = digitar(calcular(teclar(['8', '+', '2']), 'rad'), '×');

    expect(depois.expressao).toBe('10×');
    expect(depois.resultado).toBeNull();
  });

  it('depois do resultado, um algarismo começa outra', () => {
    const depois = digitar(calcular(teclar(['8', '+', '2']), 'rad'), '7');

    expect(depois.expressao).toBe('7');
  });

  it('apagar remove a função inteira, não uma letra', () => {
    // `sin(` é um token: tirar só o parêntese deixaria `sin`, que não é nada.
    expect(apagar(teclar(['3', 'sin('])).expressao).toBe('3');
    expect(apagar(teclar(['1', '2'])).expressao).toBe('1');
  });

  it('limpar devolve a tela ao começo', () => {
    expect(limpar()).toEqual(ESTADO_INICIAL);
  });

  it('o sinal vale para o último número, não para a conta inteira', () => {
    // Em 5×3, o ± é do 3: trocar o sinal da conta toda mudaria o 5 também.
    expect(alternarSinal(teclar(['5', '×', '3'])).expressao).toBe('5×-3');
  });

  it('o sinal volta atrás quando apertado de novo', () => {
    expect(alternarSinal(alternarSinal(teclar(['5', '×', '3']))).expressao).toBe('5×3');
  });

  it('o sinal não apaga a subtração', () => {
    // Em 8-3 aquele menos é a operação; removê-lo apagaria a conta.
    expect(alternarSinal(teclar(['8', '-', '3'])).expressao).toBe('8--3');
  });

  it('a porcentagem divide o último número por cem', () => {
    const estado = porcentagem(teclar(['2', '0', '0', '+', '1', '0']));

    expect(estado.expressao).toBe('200+(10÷100)');
    expect(calcular(estado, 'rad').resultado).toBe('200,1');
  });

  it('o inverso se aplica ao que está na tela', () => {
    expect(calcular(inverso(teclar(['2', '+', '3'])), 'rad').resultado).toBe('0,2');
  });

  it('o inverso de uma tela vazia não faz nada', () => {
    expect(inverso(ESTADO_INICIAL)).toEqual(ESTADO_INICIAL);
  });
});

describe('o número exibido', () => {
  it('não mostra casas que o ponto flutuante inventou', () => {
    expect(formatarValor(0.1 + 0.2)).toBe('0,3');
  });

  it('usa vírgula, como o resto do site', () => {
    expect(formatarValor(1.5)).toBe('1,5');
  });

  it('cai para notação científica quando o número foge da escala', () => {
    expect(formatarValor(1e15)).toContain('e+15');
    expect(formatarValor(1e-9)).toContain('e-9');
  });

  it('um valor impossível não vira número', () => {
    expect(formatarValor(Number.NaN)).toBe('—');
    expect(formatarValor(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

/**
 * As teclas que não podem acontecer.
 *
 * A calculadora aceitava qualquer tecla a qualquer momento: dava para escrever
 * `5-----333---` e `5××××2`, e o aviso só vinha no igual, quando a conta
 * inteira já estava perdida.
 */
describe('teclas impossíveis', () => {
  it('operador em cima de operador troca, não acumula', () => {
    expect(teclar(['5', '-', '-', '-', '-']).expressao).toBe('5-');
    expect(teclar(['5', '×', '×', '×', '×', '2']).expressao).toBe('5×2');
  });

  it('a última tecla é a que vale', () => {
    expect(teclar(['9', '+', '×', '÷', '2']).expressao).toBe('9÷2');
  });

  it('o menos depois de × nega o próximo número', () => {
    // `5×-3` é uma conta legítima: é cinco vezes menos três.
    expect(teclar(['5', '×', '-', '3']).expressao).toBe('5×-3');
    expect(calcular(teclar(['5', '×', '-', '3']), 'rad').resultado).toBe('-15');
  });

  it('mas um segundo menos ali também troca', () => {
    expect(teclar(['5', '×', '-', '-', '-']).expressao).toBe('5-');
  });

  it('a conta não começa com uma operação', () => {
    expect(teclar(['+']).expressao).toBe('');
    expect(teclar(['×']).expressao).toBe('');
  });

  it('mas começa com um menos, que é sinal', () => {
    expect(teclar(['-', '7']).expressao).toBe('-7');
  });

  it('só uma vírgula por número', () => {
    expect(teclar(['1', ',', '5', ',', ',']).expressao).toBe('1,5');
  });

  it('cada número ganha a sua vírgula', () => {
    expect(teclar(['1', ',', '5', '+', '2', ',', '5']).expressao).toBe('1,5+2,5');
  });

  it('vírgula solta vira zero vírgula', () => {
    expect(teclar([',', '5']).expressao).toBe('0,5');
    expect(teclar(['2', '+', ',', '5']).expressao).toBe('2+0,5');
  });

  it('não fecha parênteses que não foram abertos', () => {
    expect(teclar([')']).expressao).toBe('');
    expect(teclar(['2', '+', '3', ')']).expressao).toBe('2+3');
  });

  it('nem fecha um parênteses vazio', () => {
    expect(teclar(['(', ')']).expressao).toBe('(');
  });

  it('fecha o que foi aberto', () => {
    expect(teclar(['(', '2', '+', '3', ')', '×', '4']).expressao).toBe('(2+3)×4');
  });

  it('x² precisa de alguma coisa para elevar', () => {
    expect(teclar(['^2']).expressao).toBe('');
    expect(teclar(['2', '+', '^2']).expressao).toBe('2+');
    expect(teclar(['3', '^2']).expressao).toBe('3^2');
  });

  it('a tecla recusada não apaga o resultado da tela', () => {
    const comResultado = calcular(teclar(['2', '+', '2']), 'rad');
    const depois = digitar(comResultado, ')');

    expect(depois).toEqual(comResultado);
  });
});

/**
 * A aba de MMC e MDC.
 *
 * Aqui a vírgula separa números, e não casas decimais: as duas contas só
 * existem entre inteiros, então não há ambiguidade a resolver.
 */
describe('MMC e MDC', () => {
  it('calcula o MMC de dois números', () => {
    expect(calcularInteiros('12, 18', 'mmc').valor).toBe(36);
  });

  it('calcula o MDC de dois números', () => {
    expect(calcularInteiros('12, 18', 'mdc').valor).toBe(6);
  });

  it('aceita mais de dois números', () => {
    expect(calcularInteiros('12, 18, 24', 'mmc').valor).toBe(72);
    expect(calcularInteiros('12, 18, 24', 'mdc').valor).toBe(6);
  });

  it('separa por vírgula, ponto e vírgula ou espaço', () => {
    for (const entrada of ['12,18', '12; 18', '12 18', '  12 ,  18  ']) {
      expect(calcularInteiros(entrada, 'mdc').valor, entrada).toBe(6);
    }
  });

  it('mostra a fatoração de cada número', () => {
    // É de onde a resposta sai: 12 = 2²·3 e 18 = 2·3² explicam o MMC 2²·3².
    expect(calcularInteiros('12, 18', 'mmc').fatoracoes).toEqual(['12 = 2² · 3', '18 = 2 · 3²']);
  });

  it('coprimos têm MDC 1 e MMC igual ao produto', () => {
    expect(calcularInteiros('8, 9', 'mdc').valor).toBe(1);
    expect(calcularInteiros('8, 9', 'mmc').valor).toBe(72);
  });

  it('a tela vazia não é erro', () => {
    const vazia = calcularInteiros('   ', 'mmc');

    expect(vazia.valor).toBeNull();
    expect(vazia.erro).toBeNull();
  });

  it('um número só pede o segundo', () => {
    expect(calcularInteiros('7', 'mmc').erro).toContain('pelo menos dois');
  });

  it('o que não é inteiro é recusado pelo nome', () => {
    expect(calcularInteiros('12, abc', 'mmc').erro).toContain('"abc"');
    expect(calcularInteiros('12, 1.5', 'mmc').erro).toContain('1.5');
    expect(calcularInteiros('12, -4', 'mdc').erro).toContain('-4');
  });

  it('o zero fica de fora', () => {
    // mdc(0, n) = n e mmc(n, 0) = 0: respostas verdadeiras e inúteis para
    // quem está aprendendo o que as duas contas significam.
    expect(calcularInteiros('0, 12', 'mmc').erro).toContain('zero');
  });

  it('não devolve resultado que o ponto flutuante não aguenta', () => {
    const gigante = calcularInteiros('999999937, 999999893, 999999929', 'mmc');

    expect(gigante.valor).toBeNull();
    expect(gigante.erro).toContain('exat');
  });
});
