import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Vetor3,
  anguloEntreVetores3ComPassos,
  modulo3,
  produtoEscalar3,
  produtoVetorial,
  produtoVetorial3ComPassos,
  vetor3ParaTex,
  vetor3ParaTexUnitarios,
} from '@core/math';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { Vista3d } from '@shared/components/vista-3d/vista-3d';
import { Traco3d } from '@shared/components/vista-3d/vista-3d.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/vetores-matrizes/vetores-no-espaco/vetores-no-espaco.i18n.json';
import { geradorVetores3 } from '@features/vetores-matrizes/vetores-no-espaco/vetores-no-espaco.gerador';
import { TEORIA_VETORES_ESPACO } from '@features/vetores-matrizes/vetores-no-espaco/vetores-no-espaco.teoria';

/**
 * Vetores no espaço.
 *
 * A aba Explorar mostra os dois produtos lado a lado com os mesmos vetores: é
 * a comparação que ensina a diferença — o escalar devolve um número, o
 * vetorial devolve um vetor perpendicular aos dois, e trocar a ordem só muda o
 * sinal de um deles.
 */
@Component({
  selector: 'app-vetores-no-espaco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    PassoAPasso,
    TopicoLayout,
    Vista3d,
  ],
  templateUrl: './vetores-no-espaco.html',
  styleUrl: './vetores-no-espaco.scss',
})
export class VetoresNoEspaco {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorVetores3;
  protected readonly conceitos = TEORIA_VETORES_ESPACO.map((teoria) => teoria.id);

  protected readonly ax = signal(2);
  protected readonly ay = signal(1);
  protected readonly az = signal(-1);
  protected readonly bx = signal(1);
  protected readonly by = signal(3);
  protected readonly bz = signal(2);

  protected readonly a = computed<Vetor3>(() => ({ x: this.ax(), y: this.ay(), z: this.az() }));
  protected readonly b = computed<Vetor3>(() => ({ x: this.bx(), y: this.by(), z: this.bz() }));

  protected readonly aTex = computed(() => vetor3ParaTex(this.a()));
  protected readonly bTex = computed(() => vetor3ParaTex(this.b()));
  protected readonly aUnitarios = computed(() => vetor3ParaTexUnitarios(this.a()));

  protected readonly moduloA = computed(() => arredondar(modulo3(this.a())));
  protected readonly moduloB = computed(() => arredondar(modulo3(this.b())));
  protected readonly escalar = computed(() => produtoEscalar3(this.a(), this.b()));
  protected readonly angulo = computed(() =>
    arredondar(anguloEntreVetores3ComPassos(this.a(), this.b()).resultado),
  );

  protected readonly vetorial = computed(() => produtoVetorial(this.a(), this.b()));
  protected readonly vetorialTex = computed(() => vetor3ParaTex(this.vetorial()));
  protected readonly trocadoTex = computed(() =>
    vetor3ParaTex(produtoVetorial(this.b(), this.a())),
  );
  /**
   * a, b e a × b desenhados a partir da origem, com o paralelogramo de a e b.
   *
   * O produto vetorial costuma ser bem maior que a e b (seu módulo é a ÁREA do
   * paralelogramo); para caber no mesmo desenho, ele é redesenhado com o
   * comprimento do maior dos dois — a direção, que é o que a regra da mão
   * direita diz, fica intacta.
   */
  protected readonly tracos3d = computed<readonly Traco3d[]>(() => {
    const a = this.a();
    const b = this.b();
    const v = this.vetorial();
    const tamanho = Math.max(modulo3(a), modulo3(b), 1);
    const mv = modulo3(v);
    const k = mv > 1e-9 ? tamanho / mv : 0;
    const p = (u: Vetor3): readonly [number, number, number] => [u.x, u.y, u.z];
    const tracos: Traco3d[] = [
      {
        pontos: [[0, 0, 0], p(a), [a.x + b.x, a.y + b.y, a.z + b.z], p(b)],
        cor: 'apoio',
        preenchido: true,
      },
      { pontos: [[0, 0, 0], p(a)], cor: 'serie-1', seta: true, rotulo: 'a' },
      { pontos: [[0, 0, 0], p(b)], cor: 'serie-2', seta: true, rotulo: 'b' },
    ];
    if (k > 0) {
      tracos.push({
        pontos: [
          [0, 0, 0],
          [v.x * k, v.y * k, v.z * k],
        ],
        cor: 'serie-3',
        seta: true,
        rotulo: 'a × b',
      });
    }
    return tracos;
  });

  protected readonly alcance3d = computed(
    () => Math.max(modulo3(this.a()), modulo3(this.b()), 3) * 0.9,
  );

  protected readonly passos = computed(() => produtoVetorial3ComPassos(this.a(), this.b()).passos);

  /** Conferência que vale a pena ver mudando: o resultado é perpendicular aos dois. */
  protected readonly conferencia = computed(
    () =>
      `\\vec{a} \\cdot (\\vec{a} \\times \\vec{b}) = ${produtoEscalar3(this.a(), this.vetorial())}`,
  );

  protected readonly perpendiculares = computed(() => this.escalar() === 0);
}

function arredondar(valor: number): number {
  return Number(valor.toFixed(2));
}
