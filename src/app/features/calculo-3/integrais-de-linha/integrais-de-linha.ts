import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Linear2, avaliarLinear2, linear2ParaTex, trabalhoNoSegmentoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorIntegraisDeLinha } from '@features/calculo-3/integrais-de-linha/integrais-de-linha.gerador';
import { TEORIA_LINHA } from '@features/calculo-3/integrais-de-linha/integrais-de-linha.teoria';

@Component({
  selector: 'app-integrais-de-linha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './integrais-de-linha.html',
  styleUrl: './integrais-de-linha.scss',
})
export class IntegraisDeLinha {
  protected readonly gerador = geradorIntegraisDeLinha;
  protected readonly conceitos = TEORIA_LINHA.map((teoria) => teoria.id);

  protected readonly campoXx = signal(1);
  protected readonly campoXy = signal(0);
  protected readonly campoYx = signal(0);
  protected readonly campoYy = signal(1);
  protected readonly ax = signal(-3);
  protected readonly ay = signal(-2);
  protected readonly bx = signal(3);
  protected readonly by = signal(2);

  protected readonly campoX = computed<Linear2>(() => ({
    kx: this.campoXx(),
    ky: this.campoXy(),
    k0: 0,
  }));

  protected readonly campoY = computed<Linear2>(() => ({
    kx: this.campoYx(),
    ky: this.campoYy(),
    k0: 0,
  }));

  protected readonly de = computed(() => ({ x: this.ax(), y: this.ay() }));
  protected readonly ate = computed(() => ({ x: this.bx(), y: this.by() }));

  protected readonly campoTex = computed(
    () =>
      `\\vec{F} = \\left(${linear2ParaTex(this.campoX())},\\; ${linear2ParaTex(this.campoY())}\\right)`,
  );

  protected readonly trabalho = computed(
    () => trabalhoNoSegmentoComPassos(this.campoX(), this.campoY(), this.de(), this.ate()).resultado,
  );

  protected readonly trabalhoDaVolta = computed(
    () => trabalhoNoSegmentoComPassos(this.campoX(), this.campoY(), this.ate(), this.de()).resultado,
  );

  /** O teste das parciais cruzadas: detecta campo conservativo. */
  protected readonly conservativo = computed(
    () => Math.abs(this.campoXy() - this.campoYx()) < 1e-9,
  );

  /** Uma amostra do campo, desenhada como setas numa grade. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const setas: SegmentoPlot[] = [];
    const escala = 0.3;

    for (let x = -4; x <= 4; x += 2) {
      for (let y = -4; y <= 4; y += 2) {
        const fx = avaliarLinear2(this.campoX(), x, y);
        const fy = avaliarLinear2(this.campoY(), x, y);
        const tamanho = Math.hypot(fx, fy);
        if (tamanho < 1e-9) {
          continue;
        }

        setas.push({
          x1: x,
          y1: y,
          x2: x + fx * escala,
          y2: y + fy * escala,
          cor: 'texto-suave',
          seta: true,
        });
      }
    }

    setas.push({
      x1: this.de().x,
      y1: this.de().y,
      x2: this.ate().x,
      y2: this.ate().y,
      cor: 'acento',
      seta: true,
      rotulo: 'caminho',
    });

    return setas;
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.de().x, y: this.de().y, cor: 'serie-1', rotulo: 'A' },
    { x: this.ate().x, y: this.ate().y, cor: 'serie-3', rotulo: 'B' },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Campo vetorial amostrado numa grade, com o caminho de A a B em destaque: o trabalho é a ' +
      'soma da componente do campo ao longo dele.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_LINHA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
