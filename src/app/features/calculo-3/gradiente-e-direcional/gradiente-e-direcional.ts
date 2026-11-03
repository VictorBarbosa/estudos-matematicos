import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Quadrica,
  avaliarQuadrica,
  classificarCritico,
  gradienteEm,
  quadricaParaTex,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorGradiente } from '@features/calculo-3/gradiente-e-direcional/gradiente-e-direcional.gerador';
import { TEORIA_GRADIENTE } from '@features/calculo-3/gradiente-e-direcional/gradiente-e-direcional.teoria';

@Component({
  selector: 'app-gradiente-e-direcional',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './gradiente-e-direcional.html',
  styleUrl: './gradiente-e-direcional.scss',
})
export class GradienteEDirecional {
  protected readonly gerador = geradorGradiente;
  protected readonly conceitos = TEORIA_GRADIENTE.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(2);
  protected readonly x = signal(2);
  protected readonly y = signal(1);
  /** A direção em que se quer a taxa, em graus. */
  protected readonly anguloDaDirecao = signal(45);

  protected readonly funcao = computed<Quadrica>(() => ({
    a: this.a(),
    b: this.b(),
    c: 0,
    d: 0,
    e: 0,
    f0: 0,
  }));

  protected readonly funcaoTex = computed(() => `f(x,y) = ${quadricaParaTex(this.funcao())}`);

  protected readonly gradiente = computed(() => gradienteEm(this.funcao(), this.x(), this.y()));

  protected readonly modulo = computed(() => Math.hypot(this.gradiente().x, this.gradiente().y));

  protected readonly direcao = computed(() => {
    const radianos = (this.anguloDaDirecao() * Math.PI) / 180;
    return { x: Math.cos(radianos), y: Math.sin(radianos) };
  });

  protected readonly direcional = computed(
    () => this.gradiente().x * this.direcao().x + this.gradiente().y * this.direcao().y,
  );

  protected readonly gradienteTex = computed(
    () =>
      `\\nabla f = \\left(${this.tex(this.gradiente().x)},\\; ${this.tex(this.gradiente().y)}\\right)`,
  );

  protected readonly natureza = computed(() => classificarCritico(this.funcao()));

  /** As curvas de nível, desenhadas como ramos explícitos. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [a, b] = [this.a(), this.b()];
    const nivel = avaliarQuadrica(this.funcao(), this.x(), this.y());

    const ramo = (sinal: number) => (x: number) => {
      const dentro = (nivel - a * x * x) / b;
      return dentro < 0 ? Number.NaN : sinal * Math.sqrt(dentro);
    };

    return [
      { fn: ramo(1), cor: 'texto-suave', rotulo: 'curva de nível' },
      { fn: ramo(-1), cor: 'texto-suave' },
    ];
  });

  /** O gradiente e a direção escolhida, desenhados a partir do ponto. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const g = this.gradiente();
    const escala = 2 / Math.max(this.modulo(), 0.001);

    return [
      {
        x1: this.x(),
        y1: this.y(),
        x2: this.x() + g.x * escala,
        y2: this.y() + g.y * escala,
        cor: 'acento',
        seta: true,
        rotulo: 'gradiente',
      },
      {
        x1: this.x(),
        y1: this.y(),
        x2: this.x() + this.direcao().x * 2,
        y2: this.y() + this.direcao().y * 2,
        cor: 'serie-3',
        seta: true,
        rotulo: 'direção escolhida',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.x(), y: this.y(), cor: 'acento' },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Curva de nível que passa pelo ponto, o gradiente saindo dele e a direção escolhida: o ' +
      'gradiente é sempre perpendicular à curva de nível.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_GRADIENTE);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(3))).replace('.', '{,}');
  }
}
