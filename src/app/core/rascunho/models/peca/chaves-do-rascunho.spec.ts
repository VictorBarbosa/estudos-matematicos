import pt from '@core/i18n/dicionarios/pt.json';
import fr from '@core/i18n/dicionarios/fr.json';
import en from '@core/i18n/dicionarios/en.json';
import { Arvore } from '@core/rascunho/models/peca/peca';
import { Recusa } from '@core/rascunho/models/montagem/montagem';

/**
 * As chaves que o rascunho monta em tempo de execução.
 *
 * `gerar:chaves` só vê chave literal, de propósito, então nenhuma destas entra
 * em `chaves-usadas.ts` nem no guarda global do i18n. E elas são quase todas
 * `aria-label`: uma que falte **não aparece na tela** — `t()` devolveria a
 * própria chave e só o leitor de tela diria «rascunho.tecla.somar». Este teste é
 * a rede que falta, e lê as fontes de verdade em vez de uma lista à parte.
 */
const DICIONARIOS = { pt, fr, en } as unknown as Record<string, Record<string, unknown>>;

/** Os nomes de tecla, como `RascunhoBandeja` os declara. */
const TECLAS: readonly string[] = [
  ...Array.from({ length: 10 }, (_, i) => `algarismo${i}`),
  'virgula',
  'sinal',
  'incognita',
  'somar',
  'subtrair',
  'multiplicar',
  'dividir',
  'fracao',
  'coeficiente',
  'igualdade',
  'subir',
  'proximo',
  'virar',
  'apagar',
];

/** Um papel por tipo de nó, mais a peça que esta fase não conhece. */
const PAPEIS: readonly Arvore['tipo'][] = [
  'buraco',
  'numero',
  'incognita',
  'operacao',
  'fracao',
  'igualdade',
];

/** As recusas que a tela mostra. `sem-efeito` é engolida de propósito. */
const RECUSAS: readonly Exclude<Recusa, 'sem-efeito'>[] = [
  'profundidade',
  'igualdade-repetida',
  'igualdade-envolvida',
];

function buscar(dicionario: Record<string, unknown>, caminho: string): unknown {
  return caminho.split('.').reduce<unknown>((atual, parte) => {
    if (typeof atual !== 'object' || atual === null) {
      return undefined;
    }

    return (atual as Record<string, unknown>)[parte];
  }, dicionario);
}

describe('as chaves compostas do rascunho', () => {
  const chaves = [
    ...TECLAS.map((nome) => `rascunho.tecla.${nome}`),
    ...PAPEIS.map((tipo) => `rascunho.papel.${tipo}`),
    'rascunho.papel.desconhecida',
    ...RECUSAS.map((recusa) => `rascunho.recusa.${recusa}`),
  ];

  for (const idioma of Object.keys(DICIONARIOS)) {
    it(`estão todas em ${idioma}`, () => {
      const faltando = chaves.filter(
        (chave) => typeof buscar(DICIONARIOS[idioma]!, chave) !== 'string',
      );

      expect(faltando).toEqual([]);
    });
  }

  it('cobre uma tecla por peça da bandeja', () => {
    // A bandeja tem 24 teclas; se alguém acrescentar uma, este número muda e o
    // teste obriga a lembrar das três línguas.
    expect(TECLAS.length).toBe(24);
  });
});
