import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Ponto,
  distanciaComPassos,
  pontoMedio,
  retaPorDoisPontosComPassos,
  saoParalelas,
  saoPerpendiculares,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import {
  CurvaPlot,
  PontoPlot,
  SegmentoPlot,
} from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.i18n.json';
import { geradorPontoReta } from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.gerador';
import { TEORIA_PONTO_RETA } from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.teoria';

@Component({
  selector: 'app-ponto-e-reta',
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
  templateUrl: './ponto-e-reta.html',
  styleUrl: './ponto-e-reta.scss',
})
export class PontoEReta {
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorPontoReta;
  protected readonly conceitos = TEORIA_PONTO_RETA.map((teoria) => teoria.id);

  protected readonly ax = signal(-2);
  protected readonly ay = signal(-1);
  protected readonly bx = signal(4);
  protected readonly by = signal(3);

  /** Inclinação de uma segunda reta, para comparar posições relativas. */
  protected readonly mComparacao = signal(2);

  protected readonly a = computed<Ponto>(() => ({ x: this.ax(), y: this.ay() }));
  protected readonly b = computed<Ponto>(() => ({ x: this.bx(), y: this.by() }));

  protected readonly coincidentes = computed(
    () => this.a().x === this.b().x && this.a().y === this.b().y,
  );

  protected readonly distancia = computed(() => distanciaComPassos(this.a(), this.b()));
  protected readonly medio = computed(() => pontoMedio(this.a(), this.b()));

  protected readonly reta = computed(() =>
    this.coincidentes() ? null : retaPorDoisPontosComPassos(this.a(), this.b()),
  );

  protected readonly equacaoTex = computed(() => {
    const reta = this.reta();
    if (reta === null) {
      return '\\text{pontos coincidentes}';
    }

    const { coeficienteAngular: m, coeficienteLinear: n, vertical, xFixo } = reta.resultado;
    if (vertical) {
      return `x = ${xFixo}`;
    }

    return `y = ${formatar(m!)}x ${n >= 0 ? '+' : '-'} ${formatar(Math.abs(n))}`;
  });

  protected readonly relacao = computed(() => {
    const reta = this.reta();
    if (reta === null || reta.resultado.vertical) {
      return this.texto('retaVertical');
    }

    const m = reta.resultado.coeficienteAngular!;
    const outra = this.mComparacao();

    if (saoParalelas(m, outra)) {
      return this.texto('paralelas', { outra });
    }
    if (saoPerpendiculares(m, outra)) {
      return this.texto('perpendiculares');
    }
    return this.texto('concorrentes', { m: formatar(m), outra });
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const reta = this.reta();
    const curvas: CurvaPlot[] = [];

    if (reta !== null && !reta.resultado.vertical) {
      const m = reta.resultado.coeficienteAngular!;
      const n = reta.resultado.coeficienteLinear;
      curvas.push({ fn: (x) => m * x + n, cor: 'serie-1', rotulo: this.texto('curvaRetaAB') });
    }

    const outra = this.mComparacao();
    curvas.push({
      fn: (x) => outra * x,
      cor: 'serie-3',
      tracejada: true,
      rotulo: this.texto('curvaComparacao', { m: outra }),
    });

    return curvas;
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.a().x, y: this.a().y, rotulo: 'A', cor: 'acento' },
    { x: this.b().x, y: this.b().y, rotulo: 'B', cor: 'acento' },
    { x: this.medio().x, y: this.medio().y, rotulo: 'M', cor: 'serie-2' },
  ]);

  /** O triângulo retângulo que justifica a fórmula da distância. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const a = this.a();
    const b = this.b();

    return [
      { x1: a.x, y1: a.y, x2: b.x, y2: a.y, cor: 'serie-2', tracejado: true, rotulo: 'Δx' },
      { x1: b.x, y1: a.y, x2: b.x, y2: b.y, cor: 'serie-2', tracejado: true, rotulo: 'Δy' },
      { x1: a.x, y1: a.y, x2: b.x, y2: b.y, cor: 'acento' },
    ];
  });

  protected readonly dominio = computed(() => {
    const xs = [this.a().x, this.b().x];
    const ys = [this.a().y, this.b().y];
    const folga = 4;

    return {
      xMin: Math.min(...xs) - folga,
      xMax: Math.max(...xs) + folga,
      yMin: Math.min(...ys) - folga,
      yMax: Math.max(...ys) + folga,
    };
  });

  protected readonly descricaoGrafico = computed(() => this.texto('descricaoGrafico'));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PONTO_RETA);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
