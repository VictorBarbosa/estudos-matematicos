import { inject } from '@angular/core';
import { Idioma, preencher } from '@core/i18n/models/i18n.model';
import { I18nService } from '@core/i18n/services/i18n.service';

/** Uma frase nas três línguas, como ela aparece no JSON do tópico. */
export type Traducoes = Readonly<Record<Idioma, string>>;

/** O arquivo `<topico>.i18n.json` inteiro: chave curta → as três línguas. */
export type TabelaDeTextos = Readonly<Record<string, Traducoes>>;

/** O que o template chama: `texto('primeiraFracao')`. */
export type Texto = (chave: string, valores?: Readonly<Record<string, string | number>>) => string;

/**
 * As frases de uma tela só, guardadas ao lado dela.
 *
 * O dicionário global carrega a moldura do site — menu, botões, painéis — e
 * está em memória desde o primeiro instante. O texto de cada tópico é outra
 * história: são cento e dois painéis de exploração, e empacotar todos juntos
 * faria quem abre Frações baixar também o texto de equações diferenciais.
 *
 * Por isso cada tópico traz o seu próprio arquivo, com as três línguas lado a
 * lado — é o que um tradutor quer ver — e ele viaja no mesmo pedaço preguiçoso
 * em que a página já viaja. Nada a registrar, nada a limpar: o texto nasce e
 * morre com a tela.
 */
export function textoLocal(tabela: TabelaDeTextos): Texto {
  const i18n = inject(I18nService);

  return (chave, valores) => {
    const linha = tabela[chave];
    if (linha === undefined) {
      return chave;
    }

    // Falta de tradução cai no português, nunca numa tela em branco.
    return preencher(linha[i18n.idioma()] || linha.pt, valores);
  };
}
