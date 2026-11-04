import { CURRICULO } from '@curriculo/curriculo';
import {
  Dicionario,
  DicionarioBruto,
  IDIOMAS,
  Idioma,
  NOME_DO_IDIOMA,
  achatar,
  ehIdioma,
  preencher,
  traduzir,
} from '@core/i18n/models/i18n.model';
import en from '@core/i18n/dicionarios/en.json';
import fr from '@core/i18n/dicionarios/fr.json';
import pt from '@core/i18n/dicionarios/pt.json';
import { CHAVES_USADAS } from '@core/i18n/textos.catalogo/chaves-usadas';

/**
 * Travas dos dicionários de tradução.
 *
 * Uma chave que falte num idioma não quebra a compilação: ela produz uma frase
 * em português no meio de uma tela em francês, e ninguém percebe até alguém
 * reclamar. Estes testes fecham essa porta, comparando os três arquivos entre
 * si e contra o currículo.
 */

const DICIONARIOS: Readonly<Record<Idioma, Dicionario>> = {
  pt: achatar(pt as DicionarioBruto),
  fr: achatar(fr as DicionarioBruto),
  en: achatar(en as DicionarioBruto),
};

/** Os marcadores `{nome}` que uma frase usa. */
function marcadores(texto: string): readonly string[] {
  return [...texto.matchAll(/\{(\w+)\}/g)].map((achado) => achado[1]!).sort();
}

describe('dicionários de tradução', () => {
  it('os três idiomas têm exatamente as mesmas chaves', () => {
    const doPortugues = Object.keys(DICIONARIOS.pt).sort();

    for (const idioma of IDIOMAS) {
      expect(Object.keys(DICIONARIOS[idioma]).sort(), idioma).toEqual(doPortugues);
    }
  });

  it('nenhuma tradução está vazia', () => {
    for (const idioma of IDIOMAS) {
      for (const [chave, valor] of Object.entries(DICIONARIOS[idioma])) {
        expect(valor.trim().length, `${idioma}/${chave}`).toBeGreaterThan(0);
      }
    }
  });

  it('os marcadores são os mesmos em todas as línguas', () => {
    // A ordem das palavras muda entre idiomas, mas o conjunto de valores que a
    // frase recebe não pode mudar: um `{total}` esquecido no francês some da
    // tela sem aviso nenhum.
    for (const [chave, modelo] of Object.entries(DICIONARIOS.pt)) {
      const esperados = marcadores(modelo);

      for (const idioma of IDIOMAS) {
        expect(marcadores(DICIONARIOS[idioma][chave] ?? ''), `${idioma}/${chave}`).toEqual(
          esperados,
        );
      }
    }
  });

  it('nenhuma tradução ficou idêntica ao português por esquecimento', () => {
    // Palavras que coincidem entre as línguas existem — "Assistant" é a mesma
    // em francês e em inglês. O que não pode é uma frase longa idêntica, que
    // quase sempre significa tradução não feita.
    //
    // Contam-se só as palavras de três letras ou mais: assim `cos θ = {valor}`
    // e `2π ÷ B`, que são fórmulas e são iguais nas três línguas de direito,
    // não entram na conta.
    const suspeitas: string[] = [];

    for (const idioma of ['fr', 'en'] as const) {
      for (const [chave, valor] of Object.entries(DICIONARIOS[idioma])) {
        const original = DICIONARIOS.pt[chave] ?? '';
        const palavras = original.match(/[A-Za-zÀ-ÿ]{3,}/g) ?? [];
        if (valor === original && palavras.length > 3) {
          suspeitas.push(`${idioma}/${chave}`);
        }
      }
    }

    expect(suspeitas).toEqual([]);
  });

  it('todo tópico e toda área do currículo têm título e descrição nas três línguas', () => {
    const faltando: string[] = [];

    for (const area of CURRICULO) {
      for (const sufixo of ['titulo', 'descricao']) {
        const chave = `curriculo.area.${area.id}.${sufixo}`;
        for (const idioma of IDIOMAS) {
          if (DICIONARIOS[idioma][chave] === undefined) {
            faltando.push(`${idioma}/${chave}`);
          }
        }
      }

      for (const topico of area.topicos) {
        for (const sufixo of ['titulo', 'descricao']) {
          const chave = `curriculo.topico.${topico.id}.${sufixo}`;
          for (const idioma of IDIOMAS) {
            if (DICIONARIOS[idioma][chave] === undefined) {
              faltando.push(`${idioma}/${chave}`);
            }
          }
        }
      }
    }

    expect(faltando).toEqual([]);
  });

  it('o português do dicionário é o mesmo do currículo', () => {
    // Se alguém editar um título no `curriculo.ts` e esquecer do dicionário, a
    // tela passa a mostrar duas versões diferentes do mesmo tópico.
    const divergentes: string[] = [];

    for (const area of CURRICULO) {
      if (DICIONARIOS.pt[`curriculo.area.${area.id}.titulo`] !== area.titulo) {
        divergentes.push(`area/${area.id}/titulo`);
      }
      if (DICIONARIOS.pt[`curriculo.area.${area.id}.descricao`] !== area.descricao) {
        divergentes.push(`area/${area.id}/descricao`);
      }

      for (const topico of area.topicos) {
        if (DICIONARIOS.pt[`curriculo.topico.${topico.id}.titulo`] !== topico.titulo) {
          divergentes.push(`topico/${topico.id}/titulo`);
        }
        if (DICIONARIOS.pt[`curriculo.topico.${topico.id}.descricao`] !== topico.descricao) {
          divergentes.push(`topico/${topico.id}/descricao`);
        }
      }
    }

    expect(divergentes).toEqual([]);
  });

  it('não sobram chaves de currículo para tópicos que não existem mais', () => {
    const existentes = new Set(
      CURRICULO.flatMap((area) => [
        `curriculo.area.${area.id}`,
        ...area.topicos.map((topico) => `curriculo.topico.${topico.id}`),
      ]),
    );

    const orfas = Object.keys(DICIONARIOS.pt)
      .filter((chave) => chave.startsWith('curriculo.'))
      .filter((chave) => !existentes.has(chave.replace(/\.(titulo|descricao)$/, '')));

    expect(orfas).toEqual([]);
  });

  it('toda chave pedida pelo código existe no dicionário', () => {
    // Chave que falta não quebra nada: `t()` devolve a própria chave e a tela
    // mostra `folha.desfazer` onde devia estar «Desfazer». Aconteceu com a
    // folha de rascunho inteira. A lista vem de
    // `scripts/gerar-chaves-usadas.mjs`, que varre o código.
    const faltando = CHAVES_USADAS.filter(([chave]) => DICIONARIOS.pt[chave] === undefined).map(
      ([chave, onde]) => `${chave} (${onde})`,
    );

    expect(faltando).toEqual([]);
  });
});

describe('mecanismo de tradução', () => {
  it('preenche os marcadores pelo nome', () => {
    expect(preencher('{a} de {b}', { a: 3, b: 10 })).toBe('3 de 10');
  });

  it('deixa intacto o marcador sem valor', () => {
    expect(preencher('{a} de {b}', { a: 3 })).toBe('3 de {b}');
  });

  it('cai no português quando a chave falta no idioma escolhido', () => {
    const incompleto: Dicionario = {};

    expect(traduzir(incompleto, DICIONARIOS.pt, 'treino.verificar')).toBe(
      DICIONARIOS.pt['treino.verificar'],
    );
  });

  it('devolve a própria chave quando ela não existe em lugar nenhum', () => {
    expect(traduzir({}, {}, 'chave.inventada')).toBe('chave.inventada');
  });

  it('reconhece os três idiomas e rejeita o resto', () => {
    expect(IDIOMAS.every(ehIdioma)).toBe(true);
    expect(ehIdioma('es')).toBe(false);
    expect(ehIdioma(null)).toBe(false);
  });

  it('cada idioma se nomeia na própria língua', () => {
    expect(NOME_DO_IDIOMA.fr).toBe('Français');
    expect(NOME_DO_IDIOMA.en).toBe('English');
  });
});
