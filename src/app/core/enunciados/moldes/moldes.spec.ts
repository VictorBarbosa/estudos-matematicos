import { CURRICULO } from '@curriculo/curriculo';
import { citadosEm } from '@core/enunciados/models/enunciado.model';
import {
  moldesDe,
  textoDoMolde,
  textosDoMolde,
  todosOsMoldes,
} from '@core/enunciados/moldes/moldes.model';

/**
 * O guarda dos moldes de enunciado.
 *
 * Os moldes são o texto que os geradores vestem com os números sorteados. Um
 * molde mal escrito não quebra a compilação — ele chega à tela como uma frase
 * com lacuna, ou como uma frase que, em francês, cita os números noutra ordem
 * e descreve outra conta. É aqui que isso é barrado.
 */

const MOLDES = todosOsMoldes();

const TOPICOS = new Set(CURRICULO.flatMap((area) => area.topicos.map((topico) => topico.id)));

describe('moldes de enunciado', () => {
  it('há moldes (senão este guarda não guarda nada)', () => {
    expect(MOLDES.length).toBeGreaterThan(0);
  });

  for (const [indice, molde] of MOLDES.entries()) {
    describe(`${indice}: ${molde.topico} / ${molde.forma}`, () => {
      it('aponta para um tópico que existe', () => {
        expect(TOPICOS.has(molde.topico), molde.topico).toBe(true);
      });

      it('traz o texto em português', () => {
        expect(molde.enunciado.br?.trim().length, 'br').toBeGreaterThan(10);
      });

      /**
       * Tradução que existe tem de ser tradução de verdade.
       *
       * O campo é opcional, mas um `fr` com três palavras é pior que nenhum:
       * a tela mostraria um pedaço de frase onde antes mostrava a pergunta
       * inteira em português.
       */
      it('a tradução que existe não é um pedaço de frase', () => {
        for (const idioma of ['fr', 'en'] as const) {
          if (molde.enunciado[idioma] !== undefined) {
            expect(molde.enunciado[idioma]!.trim().length, idioma).toBeGreaterThan(10);
          }
        }
      });

      /**
       * As três línguas citam os mesmos valores, na mesma ordem.
       *
       * É a mesma exigência de `textos-traduzidos.spec.ts`: trocar de idioma
       * não pode trocar os números de lugar, porque aí a pergunta passa a ser
       * outra. Num molde o risco é maior que num texto pronto, porque a frase
       * francesa tem ordem natural diferente da portuguesa.
       */
      it('as três línguas citam os valores na mesma ordem', () => {
        const pt = citadosEm(molde.enunciado.br).join(',');

        for (const idioma of ['fr', 'en'] as const) {
          if (molde.enunciado[idioma] !== undefined) {
            expect(citadosEm(molde.enunciado[idioma]!).join(','), idioma).toBe(pt);
          }
        }
      });

      it('vestido com números, não deixa lacuna na tela', () => {
        const valores = Object.fromEntries(citadosEm(molde.enunciado.br).map((nome) => [nome, 7]));
        const textos = textosDoMolde(molde, valores);

        for (const [idioma, texto] of Object.entries(textos)) {
          expect(texto, idioma).not.toContain('{dados-calculo.');
        }
      });
    });
  }

  it('o número decimal sai com o separador de cada língua', () => {
    const molde = {
      topico: 'teste',
      forma: 'teste',
      enunciado: {
        br: 'Mede {dados-calculo.medida} metros.',
        fr: 'Mesure {dados-calculo.medida} mètres.',
        en: 'It measures {dados-calculo.medida} metres.',
      },
    };

    expect(textoDoMolde(molde, { medida: 7.5 }, 'pt')).toContain('7,5');
    expect(textoDoMolde(molde, { medida: 7.5 }, 'fr')).toContain('7,5');
    expect(textoDoMolde(molde, { medida: 7.5 }, 'en')).toContain('7.5');
  });

  /**
   * Pedir uma forma que não existe estoura, em vez de devolver vazio.
   *
   * Um `[]` silencioso viraria `rng.escolher([])`, e daí um enunciado vazio na
   * tela — o defeito que mais custa a diagnosticar, porque parece problema de
   * renderização.
   */
  it('forma inexistente estoura em vez de devolver nada', () => {
    expect(() => moldesDe('razao-proporcao', 'forma-que-nao-existe')).toThrow();
  });
});
