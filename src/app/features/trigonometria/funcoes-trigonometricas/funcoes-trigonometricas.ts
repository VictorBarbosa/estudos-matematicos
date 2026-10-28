import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { analisarOndaComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, SegmentoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorOndas } from './funcoes-trigonometricas.gerador';
import { TEORIA_ONDAS } from './funcoes-trigonometricas.teoria';

@Component({
  selector: 'app-funcoes-trigonometricas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './funcoes-trigonometricas.html',
  styleUrl: './funcoes-trigonometricas.scss',
})
export class FuncoesTrigonometricas {
  protected readonly gerador = geradorOndas;
  protected readonly conceitos = TEORIA_ONDAS.map((teoria) => teoria.id);

  protected readonly amplitude = signal(2);
  protected readonly frequencia = signal(1);
  /** A fase é controlada em décimos de π, para dar valores redondos. */
  protected readonly faseEmDecimos = signal(0);
  protected readonly deslocamento = signal(0);

  protected readonly fase = computed(() => (this.faseEmDecimos() * Math.PI) / 10);

  protected readonly analise = computed(() =>
    analisarOndaComPassos(
      this.amplitude(),
      this.frequencia() === 0 ? 1 : this.frequencia(),
      this.fase(),
      this.deslocamento(),
    ),
  );

  protected readonly onda = computed(() => this.analise().resultado);

  protected readonly maximo = computed(
    () => this.deslocamento() + Math.abs(this.amplitude()),
  );
  protected readonly minimo = computed(
    () => this.deslocamento() - Math.abs(this.amplitude()),
  );

  protected readonly funcaoTex = computed(() => {
    const a = this.amplitude();
    const b = this.frequencia() === 0 ? 1 : this.frequencia();
    const fase = this.faseEmDecimos();
    const d = this.deslocamento();

    const coefA = a === 1 ? '' : a === -1 ? '-' : String(a);
    const coefB = b === 1 ? '' : String(b);
    const termoFase =
      fase === 0 ? '' : ` ${fase > 0 ? '+' : '-'} \\frac{${Math.abs(fase)}\\pi}{10}`;
    const termoD = d === 0 ? '' : ` ${d > 0 ? '+' : '-'} ${Math.abs(d)}`;

    return `y = ${coefA}\\sin(${coefB}x${termoFase})${termoD}`;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.amplitude();
    const b = this.frequencia() === 0 ? 1 : this.frequencia();
    const c = this.fase();
    const d = this.deslocamento();

    return [
      { fn: (x) => a * Math.sin(b * x + c) + d, cor: 'serie-1', rotulo: 'onda ajustada' },
      { fn: (x) => Math.sin(x), cor: 'texto-suave', tracejada: true, rotulo: 'sen x (referência)' },
    ];
  });

  /** Linhas que marcam o eixo da oscilação e os limites da imagem. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    { x1: -10, y1: this.maximo(), x2: 10, y2: this.maximo(), cor: 'serie-2', tracejado: true },
    { x1: -10, y1: this.deslocamento(), x2: 10, y2: this.deslocamento(), cor: 'acento' },
    { x1: -10, y1: this.minimo(), x2: 10, y2: this.minimo(), cor: 'serie-2', tracejado: true },
  ]);

  protected readonly dominio = computed(() => {
    const limite = Math.abs(this.amplitude()) + Math.abs(this.deslocamento()) + 1.5;
    return { xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -limite, yMax: limite };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Onda de amplitude ${Math.abs(this.amplitude())} e período ` +
      `${this.formatar(this.onda().periodo)}, oscilando em torno de y igual a ` +
      `${this.deslocamento()}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_ONDAS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
