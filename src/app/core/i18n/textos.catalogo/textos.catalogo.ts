// Gerado por scripts/gerar-catalogo-textos.mjs — não editar à mão.
//
// Rode `npm run gerar:textos` depois de criar ou remover um `*.i18n.json`.
// Só `textos.spec.ts` importa este arquivo; ele não vai para o pacote.
import { TabelaDeTextos } from '@core/i18n/textos-locais';

import t_equacao_primeiro_grau from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.i18n.json';
import t_equacao_segundo_grau from '@features/algebra/equacao-segundo-grau/equacao-segundo-grau.i18n.json';
import t_expressoes_algebricas from '@features/algebra/expressoes-algebricas/expressoes-algebricas.i18n.json';
import t_fatoracao from '@features/algebra/fatoracao/fatoracao.i18n.json';
import t_inequacoes from '@features/algebra/inequacoes/inequacoes.i18n.json';
import t_polinomios from '@features/algebra/polinomios/polinomios.i18n.json';
import t_produtos_notaveis from '@features/algebra/produtos-notaveis/produtos-notaveis.i18n.json';
import t_sistemas_lineares from '@features/algebra/sistemas-lineares/sistemas-lineares.i18n.json';
import t_fracoes from '@features/matematica-basica/fracoes/fracoes.i18n.json';
import t_mmc_mdc from '@features/matematica-basica/mmc-mdc/mmc-mdc.i18n.json';
import t_notacao_matematica from '@features/matematica-basica/notacao-matematica/notacao-matematica.i18n.json';
import t_numeros_decimais from '@features/matematica-basica/numeros-decimais/numeros-decimais.i18n.json';
import t_operacoes_fundamentais from '@features/matematica-basica/operacoes-fundamentais/operacoes-fundamentais.i18n.json';
import t_potenciacao_radiciacao from '@features/matematica-basica/potenciacao-radiciacao/potenciacao-radiciacao.i18n.json';
import t_razao_proporcao from '@features/matematica-basica/razao-proporcao/razao-proporcao.i18n.json';

/** Cada tópico e o dicionário que viaja com ele. */
export const TODOS_OS_TEXTOS: ReadonlyMap<string, TabelaDeTextos> = new Map([
  ['equacao-primeiro-grau', t_equacao_primeiro_grau as TabelaDeTextos],
  ['equacao-segundo-grau', t_equacao_segundo_grau as TabelaDeTextos],
  ['expressoes-algebricas', t_expressoes_algebricas as TabelaDeTextos],
  ['fatoracao', t_fatoracao as TabelaDeTextos],
  ['inequacoes', t_inequacoes as TabelaDeTextos],
  ['polinomios', t_polinomios as TabelaDeTextos],
  ['produtos-notaveis', t_produtos_notaveis as TabelaDeTextos],
  ['sistemas-lineares', t_sistemas_lineares as TabelaDeTextos],
  ['fracoes', t_fracoes as TabelaDeTextos],
  ['mmc-mdc', t_mmc_mdc as TabelaDeTextos],
  ['notacao-matematica', t_notacao_matematica as TabelaDeTextos],
  ['numeros-decimais', t_numeros_decimais as TabelaDeTextos],
  ['operacoes-fundamentais', t_operacoes_fundamentais as TabelaDeTextos],
  ['potenciacao-radiciacao', t_potenciacao_radiciacao as TabelaDeTextos],
  ['razao-proporcao', t_razao_proporcao as TabelaDeTextos],
]);
