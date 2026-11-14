import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ELEMENTOS,
  SEGUE_A_REGRA,
  camadas,
  configuracaoEmTexto,
  configuracaoParaTex,
  eletronsDaUltimaCamada,
  periodo,
} from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/estrutura-eletronica/estrutura-eletronica.i18n.json';
import { geradorEletrons } from '@features/quimica/estrutura-eletronica/estrutura-eletronica.gerador';
import { TEORIA_ELETRONS } from '@features/quimica/estrutura-eletronica/estrutura-eletronica.teoria';

/**
 * Estrutura eletrônica — a aba Explorar.
 *
 * O controle é o número atômico, e percorrê-lo de um em um é o tópico inteiro:
 * dá para ver a camada encher, a seguinte começar e — entre o potássio e o
 * escândio — o 4s se preencher antes do 3d, que é a surpresa da ordem de
 * energia.
 *
 * Quando o elemento é uma das exceções da regra diagonal, isso aparece dito.
 * Mostrar a previsão da regra como se fosse a medida seria ensinar errado num
 * lugar em que a química já sabe a resposta.
 */
@Component({
  selector: 'app-estrutura-eletronica',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './estrutura-eletronica.html',
  styleUrl: './estrutura-eletronica.scss',
})
export class EstruturaEletronica {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorEletrons;
  protected readonly conceitos = TEORIA_ELETRONS.map((teoria) => teoria.id);

  protected readonly z = signal(17);

  protected readonly elemento = computed(() =>
    ELEMENTOS.find((atual) => atual.numeroAtomico === this.z()),
  );

  protected readonly simbolo = computed(() => this.elemento()?.simbolo ?? `Z = ${this.z()}`);

  protected readonly distribuicao = computed(() => configuracaoEmTexto(this.z()));
  protected readonly distribuicaoTex = computed(() => configuracaoParaTex(this.z()));

  protected readonly porCamada = computed(() =>
    camadas(this.z()).map((quantos, indice) => ({
      n: indice + 1,
      tem: quantos,
      cabe: 2 * (indice + 1) * (indice + 1),
    })),
  );

  protected readonly ultima = computed(() => eletronsDaUltimaCamada(this.z()));
  protected readonly camadasOcupadas = computed(() => periodo(this.z()));

  /** A regra diagonal acerta este elemento? Quando não, o aviso aparece. */
  protected readonly excecao = computed(() => !SEGUE_A_REGRA(this.z()));
}
