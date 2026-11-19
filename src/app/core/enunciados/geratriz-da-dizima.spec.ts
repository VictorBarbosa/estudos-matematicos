import { passosDoBanco } from '@core/enunciados/models/passos-do-banco';

/**
 * A resolução da fração geratriz mostra a CONTA, não uma descrição dela.
 *
 * O que estava na tela era «ext{geratriz: parte que repete sobre } 9» — duas
 * coisas erradas ao mesmo tempo: a barra de `\text` tinha virado tabulação no
 * TypeScript, e o conteúdo era uma frase, não uma fórmula. Quem errava a
 * pergunta lia a resposta certa e continuava sem saber de onde ela sai.
 *
 * O método é o dos deslocamentos: 1000x − 100x apaga a cauda infinita, porque
 * as duas têm a mesma, e o que sobra é inteiro.
 */
describe('fração geratriz', () => {
  const resolver = (texto: string) => passosDoBanco('numeros-decimais', {}, texto);

  it('mostra os dois deslocamentos da dízima composta', () => {
    const resolucao = resolver(
      'Encontre a fração geratriz da dízima periódica composta 1,2555....',
    );

    expect(resolucao?.valor).toBe('113/90');
    expect(resolucao?.passos[1]?.tex).toBe(
      String.raw`1000x - 100x = 1255 - 125 = 1130 \;\Rightarrow\; x = \frac{1130}{900} = \frac{113}{90}`,
    );
  });

  it('mostra os dois deslocamentos da dízima simples', () => {
    const resolucao = resolver('Encontre a fração geratriz da dízima periódica 0,333....');

    expect(resolucao?.valor).toBe('1/3');
    expect(resolucao?.passos[1]?.tex).toBe(
      String.raw`100x - 10x = 33 - 3 = 30 \;\Rightarrow\; x = \frac{30}{90} = \frac{1}{3}`,
    );
  });

  it('nenhum passo traz palavra solta onde deveria haver fórmula', () => {
    for (const texto of [
      'Encontre a fração geratriz da dízima periódica composta 1,2555....',
      'Encontre a fração geratriz da dízima periódica 0,333....',
    ]) {
      for (const passo of resolver(texto)?.passos ?? []) {
        // `ext{`, `rac{`, `qrt{`: o que sobra de `\text`, `\frac` e `\sqrt`
        // quando o compilador come a barra.
        expect(passo.tex).not.toMatch(/(?:^|[^\\a-z])(?:ext|rac|qrt|imes)\{/);
      }
    }
  });
});
