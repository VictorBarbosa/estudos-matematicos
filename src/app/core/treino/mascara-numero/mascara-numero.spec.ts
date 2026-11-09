import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  cursorNaMascara,
  digitosAte,
  mascararNumero,
} from '@core/treino/mascara-numero/mascara-numero';

describe('mascararNumero', () => {
  it('põe o ponto de milhar enquanto se digita', () => {
    expect(mascararNumero('6')).toBe('6');
    expect(mascararNumero('60')).toBe('60');
    expect(mascararNumero('608')).toBe('608');
    expect(mascararNumero('6082')).toBe('6.082');
    expect(mascararNumero('1234567')).toBe('1.234.567');
  });

  it('resolve o caso que motivou tudo', () => {
    // Dois pontos não existem em convenção nenhuma: o último é o decimal.
    expect(mascararNumero('6.082.12')).toBe('6.082,12');
    expect(mascararNumero('6.082,12')).toBe('6.082,12');
    expect(mascararNumero('6082,12')).toBe('6.082,12');
    expect(mascararNumero('6082.12')).toBe('6.082,12');
  });

  it('deixa o ponto pendente enquanto ele é ambíguo', () => {
    /*
     * Digitando `6.082,12` tecla a tecla, o primeiro ponto é milhar — mas em
     * `6.` ainda não dá para saber. A máscara espera: decidir cedo a obrigaria
     * a voltar atrás na tecla seguinte, e ver o campo se contradizer é pior do
     * que vê-lo quieto. O corretor lê as duas formas, então esperar não custa.
     */
    expect(mascararNumero('6.')).toBe('6.');
    expect(mascararNumero('6.0')).toBe('6.0');
    expect(mascararNumero('6.08')).toBe('6.08');
    // No terceiro dígito a dúvida acaba: milhar.
    expect(mascararNumero('6.082')).toBe('6.082');
    expect(mascararNumero('6.082,')).toBe('6.082,');
  });

  it('com mais de três dígitos na frente, o ponto só pode ser decimal', () => {
    // Milhar vem depois de um a três dígitos; `6082.` não é milhar nenhum.
    expect(mascararNumero('6082.1')).toBe('6.082,1');
    expect(mascararNumero('6082.12')).toBe('6.082,12');
  });

  it('o milhar que a própria máscara pôs não vira decimal na tecla seguinte', () => {
    // `1234` vira `1.234`; o `5` seguinte não pode transformar o ponto em
    // vírgula e produzir 1,2345.
    expect(mascararNumero('1.2345')).toBe('12.345');
    expect(mascararNumero('12.3456')).toBe('123.456');
  });

  it('não atrapalha quem está no meio da digitação', () => {
    expect(mascararNumero('')).toBe('');
    expect(mascararNumero('-')).toBe('-');
    expect(mascararNumero('6,')).toBe('6,');
    expect(mascararNumero('6,0')).toBe('6,0');
    expect(mascararNumero('6,10')).toBe('6,10');
    expect(mascararNumero('0,')).toBe('0,');
  });

  it('mantém o sinal', () => {
    expect(mascararNumero('-6082,5')).toBe('-6.082,5');
    expect(mascararNumero('+1000')).toBe('+1.000');
  });

  it('não encosta no que não é número puro', () => {
    for (const texto of ['3/4', '√2', '(1+√5)/2', 'x ∈ [-3, 2]', '1,2e3', '2 1/3', 'f: ℕ → ℤ']) {
      expect(mascararNumero(texto)).toBe(texto);
    }
  });

  it('concorda com o corretor: o que se vê é o que será lido', () => {
    // Para o que já era legível, mascarar não muda o valor.
    for (const digitado of ['6082.12', '6082,12', '0.833', '1.375', '1234567', '-45,5', '0,5']) {
      expect(analisarNumero(mascararNumero(digitado))).toBeCloseTo(analisarNumero(digitado)!, 9);
    }
  });

  it('e conserta o que o corretor lia errado em silêncio', () => {
    /*
     * `6.082.12` não é número em convenção nenhuma, e o analisador o lia como
     * uma multiplicação implícita: 6,082 × 0,12 = 0,72984. O aluno via o
     * próprio texto na tela e levava um erro sem entender de onde.
     */
    expect(analisarNumero('6.082.12')).toBeCloseTo(0.72984, 9);
    expect(mascararNumero('6.082.12')).toBe('6.082,12');
    expect(analisarNumero(mascararNumero('6.082.12'))).toBeCloseTo(6082.12, 9);
  });

  it('o 1.375 ambíguo continua milhar, como no corretor', () => {
    expect(mascararNumero('1.375')).toBe('1.375');
    expect(analisarNumero('1.375')).toBe(1375);
  });

  it('o zero à esquerda some, menos o que sustenta a vírgula', () => {
    expect(mascararNumero('007')).toBe('7');
    expect(mascararNumero('0,75')).toBe('0,75');
  });
});

describe('cursor', () => {
  it('conta dígitos, não caracteres', () => {
    expect(digitosAte('6.082,12', 5)).toBe(4);
    expect(cursorNaMascara('6.082,12', 4)).toBe(5);
  });

  it('depois do milhar que acabou de nascer, fica depois do mesmo dígito', () => {
    // `6082|` vira `6.082|`: quatro dígitos antes do cursor nos dois.
    const antes = '6082';
    const posicao = antes.length;
    const depois = mascararNumero(antes);

    expect(cursorNaMascara(depois, digitosAte(antes, posicao))).toBe(depois.length);
  });

  it('no começo do texto, respeita o sinal', () => {
    expect(cursorNaMascara('-6.082', 0)).toBe(1);
    expect(cursorNaMascara('6.082', 0)).toBe(0);
  });
});
