import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS } from '@core/treino/models/treino.model';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo/geradores.catalogo';
import { pedacosComTermos, todosOsTermos } from '@core/enunciados/glossario/termos-do-enunciado';

/**
 * A legenda que explica a palavra do enunciado.
 *
 * «Qual é a abscissa do vértice desta parábola?» não se responde sem saber o
 * que é abscissa, e isso não é a conta que o exercício quer ensinar. O termo
 * ganha um pontilhado e a explicação aparece ao lado.
 */
describe('termos explicados no enunciado', () => {
  const TERMOS = todosOsTermos();

  it('todo termo tem as três línguas, com definição que explica', () => {
    for (const [chave, porIdioma] of Object.entries(TERMOS)) {
      for (const idioma of ['pt', 'fr', 'en'] as const) {
        const entrada = porIdioma[idioma];
        expect(entrada, `${chave}/${idioma}`).toBeDefined();
        expect(entrada.termo.length, `${chave}/${idioma}: termo`).toBeGreaterThan(2);
        // Definição curta não explica nada; esta é a diferença entre a
        // legenda e o glossário, que só traduz a palavra.
        expect(entrada.definicao.length, `${chave}/${idioma}: definição`).toBeGreaterThan(30);
      }
    }
  });

  it('reconhece o termo inteiro, e uma vez só', () => {
    const pedacos = pedacosComTermos('Qual é a abscissa do vértice desta parábola?', 'pt');
    const marcados = pedacos.filter((p) => p.definicao !== undefined).map((p) => p.valor);

    expect(marcados).toEqual(['abscissa', 'vértice']);
    // O texto continua inteiro: a marcação parte, não reescreve.
    expect(pedacos.map((p) => p.valor).join('')).toBe(
      'Qual é a abscissa do vértice desta parábola?',
    );
  });

  it('não marca a palavra dentro de outra', () => {
    const pedacos = pedacosComTermos('As raízes e a raiz quadrada', 'pt');
    const marcados = pedacos.filter((p) => p.definicao !== undefined).map((p) => p.valor);

    // «raízes» não é «raiz»; «raiz quadrada» começa com a palavra inteira.
    expect(marcados).toEqual(['raiz']);
  });

  it('reconhece a palavra na língua da tela', () => {
    const frances = pedacosComTermos("Quelle est l'abscisse du sommet ?", 'fr');
    const ingles = pedacosComTermos('What is the abscissa of the vertex?', 'en');

    expect(frances.filter((p) => p.definicao).map((p) => p.valor)).toEqual(['abscisse', 'sommet']);
    expect(ingles.filter((p) => p.definicao).map((p) => p.valor)).toEqual(['abscissa', 'vertex']);
  });

  it('os termos aparecem de verdade nos enunciados do site', () => {
    /*
     * Um glossário de palavras que ninguém vê é peso morto. Este teste gera
     * exercícios de todos os tópicos e confere que cada termo cadastrado
     * aparece em algum enunciado — se não aparece, ou a palavra está errada,
     * ou ela não pertence a este catálogo.
     */
    const vistos = new Set<string>();

    for (const [, gerador] of TODOS_OS_GERADORES) {
      for (const nivel of NIVEIS) {
        for (const semente of Array.from({ length: 40 }, (_, i) => i * 11 + 1)) {
          const exercicio = gerador.gerar(nivel, criarRng(semente));
          for (const pedaco of pedacosComTermos(exercicio.enunciado, 'pt')) {
            if (pedaco.definicao !== undefined) {
              vistos.add(pedaco.valor.toLowerCase());
            }
          }
        }
      }
    }

    const nunca = Object.values(TERMOS)
      .map((porIdioma) => porIdioma.pt.termo)
      .filter((termo) => !vistos.has(termo.toLowerCase()));

    expect(nunca, `${nunca.length} termos nunca aparecem num enunciado`).toEqual([]);
  });
});
