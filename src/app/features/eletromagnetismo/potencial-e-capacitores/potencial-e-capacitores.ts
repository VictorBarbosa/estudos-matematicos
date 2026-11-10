import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { capacitorPlanoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/eletromagnetismo/potencial-e-capacitores/potencial-e-capacitores.i18n.json';
import { geradorPotencialCapacitores } from '@features/eletromagnetismo/potencial-e-capacitores/potencial-e-capacitores.gerador';
import { TEORIA_POTENCIAL_CAPACITORES } from '@features/eletromagnetismo/potencial-e-capacitores/potencial-e-capacitores.teoria';

@Component({
  selector: 'app-potencial-e-capacitores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './potencial-e-capacitores.html',
  styleUrl: './potencial-e-capacitores.scss',
})
export class PotencialECapacitores {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorPotencialCapacitores;
  protected readonly conceitos = TEORIA_POTENCIAL_CAPACITORES.map((teoria) => teoria.id);

  protected readonly area = signal(200);
  protected readonly distancia = signal(1);
  protected readonly tensao = signal(100);

  protected readonly resolucao = computed(() =>
    capacitorPlanoComPassos(Math.max(1, this.area()), Math.max(0.1, this.distancia())),
  );

  /** Capacitância em pF. */
  protected readonly capacitancia = computed(() => this.resolucao().resultado);
  /** Carga em nC: pF × V = pC; ÷ 1000. */
  protected readonly carga = computed(() => (this.capacitancia() * this.tensao()) / 1000);
  /** Energia em nJ: ½ · pF · V² = pJ; ÷ 1000. */
  protected readonly energia = computed(
    () => (0.5 * this.capacitancia() * this.tensao() ** 2) / 1000,
  );

  /** U em função da tensão: a parábola ½CV². */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const c = this.capacitancia();
    return [
      { fn: (v) => (0.5 * c * v * v) / 1000, cor: 'serie-1', rotulo: this.texto('curvaEnergia') },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.tensao(),
      y: this.energia(),
      rotulo: `${this.formatar(this.energia())} nJ`,
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: 250,
    yMin: 0,
    yMax: Math.max((0.5 * this.capacitancia() * 250 * 250) / 1000, 1),
  }));

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      v: String(this.tensao()),
      u: this.formatar(this.energia()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_POTENCIAL_CAPACITORES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
