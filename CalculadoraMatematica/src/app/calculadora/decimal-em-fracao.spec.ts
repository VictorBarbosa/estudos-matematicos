import { decimalEmFracao } from './decimal-em-fracao';

/** A fração como `3/8`, para a asserção caber numa linha. */
const fracao = (texto: string): string => {
  const { fracao: f } = decimalEmFracao(texto);
  return f === null ? 'nenhuma' : `${f.numerador}/${f.denominador}`;
};

describe('decimal em fração', () => {
  it('converte o decimal que termina', () => {
    expect(fracao('0,5')).toBe('1/2');
    expect(fracao('0,375')).toBe('3/8');
    expect(fracao('2,75')).toBe('11/4');
    expect(fracao('0,0625')).toBe('1/16');
  });

  it('o ponto vale pela vírgula', () => {
    expect(fracao('0.375')).toBe('3/8');
  });

  it('guarda o sinal', () => {
    expect(fracao('-0,375')).toBe('-3/8');
    expect(fracao('-2,5')).toBe('-5/2');
    expect(fracao('+1,5')).toBe('3/2');
  });

  it('o inteiro vira fração de denominador 1', () => {
    expect(fracao('7')).toBe('7/1');
    expect(fracao('-3')).toBe('-3/1');
  });

  it('converte a dízima periódica simples', () => {
    expect(fracao('0,(3)')).toBe('1/3');
    expect(fracao('0,(6)')).toBe('2/3');
    expect(fracao('0,(9)')).toBe('1/1');
    expect(fracao('0,(142857)')).toBe('1/7');
  });

  it('converte a dízima com parte não periódica', () => {
    expect(fracao('0,1(6)')).toBe('1/6');
    expect(fracao('1,2(45)')).toBe('137/110');
    expect(fracao('0,8(3)')).toBe('5/6');
  });

  it('a dízima negativa também', () => {
    expect(fracao('-0,(3)')).toBe('-1/3');
    expect(fracao('-0,1(6)')).toBe('-1/6');
  });

  it('período de zeros não é dízima', () => {
    expect(fracao('0,1(0)')).toBe('1/10');
    expect(fracao('2,5(0)')).toBe('5/2');
  });

  it('mostra o caminho da dízima, com a subtração que mata a cauda', () => {
    const { passos, periodica } = decimalEmFracao('0,1(6)');

    expect(periodica).toBe(true);
    expect(passos.map((p) => p.conta)).toEqual([
      'x = 0,1(6)',
      '10x = 1,(6)',
      '100x = 16,(6)',
      '90x = 15',
      '15/90 = 1/6',
    ]);
  });

  it('mostra o caminho do decimal que termina', () => {
    const { passos, periodica } = decimalEmFracao('0,375');

    expect(periodica).toBe(false);
    expect(passos[0]!.conta).toBe('0,375 = 375/1000');
    expect(passos.at(-1)!.conta).toBe('375/1000 = 3/8');
  });

  it('as reticências pedem a notação de parênteses', () => {
    expect(decimalEmFracao('0,333...').erro?.chave).toBe('decimal.useParenteses');
    expect(decimalEmFracao('0,333…').erro?.chave).toBe('decimal.useParenteses');
  });

  it('o que não é decimal é recusado', () => {
    expect(decimalEmFracao('abc').erro?.chave).toBe('decimal.naoEntendi');
    expect(decimalEmFracao('1,2,3').erro?.chave).toBe('decimal.naoEntendi');
    expect(decimalEmFracao('(3)').erro?.chave).toBe('decimal.naoEntendi');
  });

  it('campo vazio não é erro, é pergunta por fazer', () => {
    expect(decimalEmFracao('').erro).toBeNull();
    expect(decimalEmFracao('   ').fracao).toBeNull();
  });

  it('algarismos demais param antes de dar resposta errada', () => {
    // Além do inteiro exato do JavaScript a conta mentiria em silêncio.
    expect(decimalEmFracao('0,12345678901234567890').erro?.chave).toBe('decimal.algarismosDemais');
  });

  it('a fração devolvida é mesmo o número', () => {
    for (const texto of ['0,375', '-2,5', '0,(3)', '1,2(45)', '0,8(3)', '0,(142857)']) {
      const { fracao: f } = decimalEmFracao(texto);
      const valor = f!.numerador / f!.denominador;
      const esperado = Number(
        texto.includes('(')
          ? // Compara a dízima pelos primeiros doze dígitos.
            expandir(texto, 12)
          : texto.replace(',', '.'),
      );
      expect(Math.abs(valor - esperado), texto).toBeLessThan(1e-9);
    }
  });
});

/** Escreve a dízima com `casas` decimais, para conferir o valor. */
function expandir(texto: string, casas: number): string {
  const [, sinal, inteira, fixa = '', periodo = ''] =
    /^([+-]?)(\d+)(?:[.,](\d*))?(?:\((\d+)\))?$/.exec(texto.trim())!;
  let decimais = fixa;
  while (decimais.length < casas) {
    decimais += periodo;
  }
  return `${sinal}${inteira}.${decimais.slice(0, casas)}`;
}
