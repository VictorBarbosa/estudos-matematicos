import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CORPOS_RIGIDOS, momentoDeInercia } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorDinamicaRotacional } from '@features/fisica/dinamica-rotacional/dinamica-rotacional.gerador';
import { TEORIA_DINAMICA_ROTACIONAL } from '@features/fisica/dinamica-rotacional/dinamica-rotacional.teoria';

/** Os corpos que rolam numa rampa, para a corrida da tela de exploração. */
const QUE_ROLAM = CORPOS_RIGIDOS.filter((corpo) => corpo.nome !== 'partícula');

@Component({
  selector: 'app-dinamica-rotacional',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './dinamica-rotacional.html',
  styleUrl: './dinamica-rotacional.scss',
})
export class DinamicaRotacional {
  protected readonly gerador = geradorDinamicaRotacional;
  protected readonly conceitos = TEORIA_DINAMICA_ROTACIONAL.map((teoria) => teoria.id);
  protected readonly corpos = CORPOS_RIGIDOS;

  protected readonly escolha = signal(2);
  protected readonly massa = signal(4);
  protected readonly decimosDoRaio = signal(5);
  protected readonly torque = signal(6);
  protected readonly decimosDaAltura = signal(20);

  protected readonly corpo = computed(() => CORPOS_RIGIDOS[this.escolha()]!);
  protected readonly raio = computed(() => this.decimosDoRaio() / 10);
  protected readonly altura = computed(() => this.decimosDaAltura() / 10);

  protected readonly inercia = computed(() =>
    momentoDeInercia(this.corpo(), this.massa(), this.raio()),
  );

  protected readonly aceleracaoAngular = computed(() => this.torque() / this.inercia());

  protected readonly inerciaTex = computed(
    () => `I = ${this.corpo().fatorTex}mr^{2} = ${this.formatarTex(this.inercia())}`,
  );

  /** A corrida da rampa: a velocidade final só depende do formato. */
  protected readonly corrida = computed(() =>
    QUE_ROLAM.map((corpo) => ({
      nome: corpo.nome,
      velocidade: Math.sqrt((2 * 9.81 * this.altura()) / (1 + corpo.fator)),
      fracaoRotacional: (corpo.fator / (1 + corpo.fator)) * 100,
    })).sort((a, b) => b.velocidade - a.velocidade),
  );

  protected readonly deslizando = computed(() => Math.sqrt(2 * 9.81 * this.altura()));

  /** Como o momento de inércia cresce com o raio, para cada formato. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const massa = this.massa();
    const cores = ['serie-1', 'serie-2', 'serie-3', 'serie-4', 'serie-5', 'serie-6'] as const;

    return QUE_ROLAM.slice(0, 4).map((corpo, indice) => ({
      fn: (r: number) => corpo.fator * massa * r * r,
      cor: cores[indice],
      rotulo: corpo.nome,
    }));
  });

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 3 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Momento de inércia em função do raio, para ${this.massa()} quilogramas: todas crescem ` +
      'com o quadrado do raio, e o que as separa é só o fator de forma.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DINAMICA_ROTACIONAL);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  private formatarTex(valor: number): string {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
}
