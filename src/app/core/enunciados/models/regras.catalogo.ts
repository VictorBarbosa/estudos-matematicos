import { paraRegex, type Regra } from '@core/enunciados/models/regras-de-passos';

export { paraRegex };
import { REGRAS_FISICA } from '@core/enunciados/models/regras-fisica';
import { REGRAS_ALGEBRA } from '@core/enunciados/models/regras-algebra';
import { REGRAS_FUNCOES } from '@core/enunciados/models/regras-funcoes';
import { REGRAS_FUNCOES_2 } from '@core/enunciados/models/regras-funcoes-2';
import { REGRAS_TRIGONOMETRIA } from '@core/enunciados/models/regras-trigonometria';
import { REGRAS_CALCULO } from '@core/enunciados/models/regras-calculo';
import { REGRAS_INTEGRAIS } from '@core/enunciados/models/regras-integrais';
import { REGRAS_GEOMETRIA_ANALITICA } from '@core/enunciados/models/regras-geometria-analitica';
import { REGRAS_GEOMETRIA_PLANA } from '@core/enunciados/models/regras-geometria-plana';
import { REGRAS_VETORES } from '@core/enunciados/models/regras-vetores';
import { REGRAS_ESTATISTICA } from '@core/enunciados/models/regras-estatistica';
import { REGRAS_AVANCADO } from '@core/enunciados/models/regras-avancado';
import { REGRAS_AVANCADO_2 } from '@core/enunciados/models/regras-avancado-2';
import { REGRAS_AVANCADO_3 } from '@core/enunciados/models/regras-avancado-3';
import { REGRAS_QUIMICA } from '@core/enunciados/models/regras-quimica';

/**
 * O catálogo das regras, um mapa por tópico.
 *
 * Existe porque as regras nasceram em arquivos separados por área, e a busca
 * era uma fila de `??` — onze delas. Uma tabela só resolve o tópico numa
 * consulta, e ainda serve ao guarda de tradução, que precisa percorrer TODAS as
 * regras para conferir que cada passo mostrado tem tradução.
 *
 * A ordem dentro de cada tópico importa: a primeira regra que reconhece a
 * forma responde.
 */
const ARQUIVOS: readonly Readonly<Record<string, readonly Regra[]>>[] = [
  REGRAS_ALGEBRA,
  REGRAS_AVANCADO,
  REGRAS_AVANCADO_2,
  REGRAS_AVANCADO_3,
  REGRAS_CALCULO,
  REGRAS_ESTATISTICA,
  REGRAS_FISICA,
  REGRAS_FUNCOES,
  REGRAS_FUNCOES_2,
  REGRAS_GEOMETRIA_ANALITICA,
  REGRAS_GEOMETRIA_PLANA,
  REGRAS_INTEGRAIS,
  REGRAS_QUIMICA,
  REGRAS_TRIGONOMETRIA,
  REGRAS_VETORES,
];

/** Todas as regras, por tópico, já concatenadas na ordem de precedência. */
export const REGRAS_POR_TOPICO: Readonly<Record<string, readonly Regra[]>> = (() => {
  const mapa: Record<string, Regra[]> = {};

  for (const arquivo of ARQUIVOS) {
    for (const [topico, regras] of Object.entries(arquivo)) {
      mapa[topico] = [...(mapa[topico] ?? []), ...regras];
    }
  }

  return mapa;
})();

/** Todas as regras com o tópico de origem — o que o guarda percorre. */
export const TODAS_AS_REGRAS: readonly { readonly topico: string; readonly regra: Regra }[] =
  Object.entries(REGRAS_POR_TOPICO).flatMap(([topico, regras]) =>
    regras.map((regra) => ({ topico, regra })),
  );
