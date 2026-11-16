import { todosOsEnunciados, vestirTexto } from '@core/enunciados/models/enunciado.model';
import { partesDoEnunciado } from '@core/enunciados/models/enunciado-em-partes';

/**
 * O guarda do enunciado em partes.
 *
 * O enunciado do banco é texto puro, e a matemática nele está escrita como no
 * teclado — `(x + 1)/(x − 2)`. Na tela, a barra engana: lê-se como divisão de
 * duas quantias. Fração precisa ser desenhada como fração, e é isto que este
 * guarda mede.
 */

/** As expressões reconhecidas num texto, na ordem. */
const expressoesDe = (texto: string): readonly string[] =>
  partesDoEnunciado(texto)
    .filter((parte) => parte.tipo === 'math')
    .map((parte) => (parte.tipo === 'math' ? parte.tex : ''));

/** O texto de volta, sem as fórmulas, para conferir que nada se perdeu. */
const textoDe = (texto: string): string =>
  partesDoEnunciado(texto)
    .filter((parte) => parte.tipo === 'texto')
    .map((parte) => (parte.tipo === 'texto' ? parte.valor : ''))
    .join('');

describe('enunciado em partes', () => {
  it('a fração do domínio vira fração desenhada', () => {
    // O caso que abriu este trabalho.
    const partes = partesDoEnunciado(
      'Qual é o único valor que NÃO pertence ao domínio de f(x) = (x + 1)/(x − 2)?',
    );

    expect(partes.map((parte) => parte.tipo)).toEqual(['texto', 'math', 'texto']);
    expect(partes[1]).toMatchObject({
      tipo: 'math',
      tex: 'f(x) = \\frac{\\left(x + 1\\right)}{\\left(x - 2\\right)}',
    });
    expect(
      textoDe('Qual é o único valor que NÃO pertence ao domínio de f(x) = (x + 1)/(x − 2)?'),
    ).toContain('domínio de ');
  });

  it('a fração numérica também é desenhada', () => {
    expect(expressoesDe('Some as frações 3/4 e 1/2 e dê o resultado.')).toEqual([
      '\\frac{3}{4}',
      '\\frac{1}{2}',
    ]);
  });

  it('a unidade NÃO é fração', () => {
    // Sem esta regra, metade da Física viraria fração.
    for (const texto of [
      'Converta 36 km/h para m/s. (duas casas decimais)',
      'Qual é a concentração, em mol/L?',
      'A condutividade é 205 W/(m·K).',
      'O calor específico é 500 J/(kg·K).',
    ]) {
      expect(expressoesDe(texto), texto).not.toContain('\\frac{36}{km}');
      expect(expressoesDe(texto).some((tex) => tex.includes('km') || tex.includes('mol'))).toBe(
        false,
      );
    }
  });

  it('a potência e a raiz são desenhadas', () => {
    expect(expressoesDe('Resolva a equação x² − 5x + 6 = 0.')).toEqual(['x^{2} - 5x + 6 = 0']);
    expect(expressoesDe('Qual é o volume ao girar y = √x em torno do eixo?')).toEqual([
      'y = \\sqrt{x}',
    ]);
  });

  it('a unidade com expoente fica como está: m² não é fórmula', () => {
    expect(expressoesDe('Quantos centímetros quadrados há em 2 m²?')).toEqual([]);
  });

  it('a fração com incógnita no numerador também é desenhada', () => {
    expect(expressoesDe('A concentração C(t) = 3t/(t + 2) tende a quanto?')).toEqual([
      'C(t) = \\frac{3t}{\\left(t + 2\\right)}',
    ]);
  });

  it('a prosa continua sendo prosa', () => {
    // Uma palavra de uma letra não pode virar fórmula: `a` e `e` são português.
    const texto = 'Uma pessoa guarda a quantia e depois gasta o resto.';
    expect(expressoesDe(texto)).toEqual([]);
  });

  it('nenhum enunciado do banco perde texto na conversão', () => {
    /*
     * O que sai como fórmula SOME do texto, e é o KaTeX que o redesenha. Se a
     * varredura engolir uma palavra, ela desaparece da tela — e o enunciado
     * fica sem sentido. Aqui a conferência é que a soma dos pedaços bate com o
     * original.
     */
    const perdidos: string[] = [];

    for (const entrada of todosOsEnunciados()) {
      const texto = vestirTexto(entrada.enunciado.br, entrada['dados-calculo'] ?? {}, 'pt');
      const partes = partesDoEnunciado(texto);

      // Cada pedaço ocupa um trecho do original, e os trechos têm de somar o
      // texto inteiro: se a varredura engolir uma palavra, ela some da tela.
      const consumido = partes.reduce(
        (total, parte) =>
          total + (parte.tipo === 'texto' ? parte.valor.length : parte.origem.length),
        0,
      );

      if (consumido !== texto.length) {
        perdidos.push(texto.slice(0, 90));
      }
    }

    expect(perdidos.slice(0, 5), `${perdidos.length} enunciados perderam texto`).toEqual([]);
  });

  it('nenhuma expressão reconhecida tem letra solta em português', () => {
    /*
     * Uma fórmula com `de`, `em` ou `para` dentro seria prosa desenhada como
     * matemática — o contrário do defeito que este trabalho corrige.
     */
    const suspeitas: string[] = [];

    for (const entrada of todosOsEnunciados()) {
      const texto = vestirTexto(entrada.enunciado.br, entrada['dados-calculo'] ?? {}, 'pt');

      for (const tex of expressoesDe(texto)) {
        // Sem os comandos de LaTeX, sobra o que foi escrito por nós.
        const semComandos = tex.replace(/\\operatorname\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+/g, '');
        const palavras = semComandos.match(/[a-zçãõáéíóúâê]{3,}/gi) ?? [];

        if (palavras.some((palavra) => !/^[xyztabcnkpqrsL]$/i.test(palavra))) {
          suspeitas.push(`${tex.slice(0, 60)} ← ${texto.slice(0, 50)}`);
        }
      }
    }

    expect(suspeitas.slice(0, 5), `${suspeitas.length} fórmulas com palavra`).toEqual([]);
  });
});
