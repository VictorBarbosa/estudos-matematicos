import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { Vista3d } from '@shared/components/vista-3d/vista-3d';
import { Ponto3d, Traco3d } from '@shared/components/vista-3d/vista-3d.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/vetores-matrizes/retas-e-planos/retas-e-planos.i18n.json';
import { geradorRetasPlanos } from '@features/vetores-matrizes/retas-e-planos/retas-e-planos.gerador';
import { TEORIA_RETAS_PLANOS } from '@features/vetores-matrizes/retas-e-planos/retas-e-planos.teoria';

type V = [number, number, number];
const soma = (u: V, v: V): V => [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
const vezes = (k: number, u: V): V => [k * u[0], k * u[1], k * u[2]];
const escalar = (u: V, v: V): number => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const vetorial = (u: V, v: V): V => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];
const unitario = (u: V): V => vezes(1 / Math.sqrt(escalar(u, u)), u);

@Component({
  selector: 'app-retas-e-planos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout, Vista3d],
  templateUrl: './retas-e-planos.html',
  styleUrl: './retas-e-planos.scss',
})
export class RetasEPlanos {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorRetasPlanos;
  protected readonly conceitos = TEORIA_RETAS_PLANOS.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(2);
  protected readonly c = signal(2);
  protected readonly d = signal(4);
  protected readonly px = signal(3);
  protected readonly py = signal(3);
  protected readonly pz = signal(3);

  /** A normal nunca nula: com (0, 0, 0) trocamos por (0, 0, 1). */
  private readonly normal = computed<V>(() => {
    const n: V = [this.a(), this.b(), this.c()];
    return escalar(n, n) === 0 ? [0, 0, 1] : n;
  });

  private readonly ponto = computed<V>(() => [this.px(), this.py(), this.pz()]);

  protected readonly distancia = computed(() => {
    const n = this.normal();
    return Math.abs(escalar(n, this.ponto()) - this.d()) / Math.sqrt(escalar(n, n));
  });

  protected readonly planoTex = computed(() => {
    const [a, b, c] = this.normal();
    const t = (k: number, l: string, primeiro: boolean) =>
      k === 0
        ? ''
        : `${primeiro ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 ? '' : Math.abs(k)}${l}`;
    const x = t(a, 'x', true);
    const y = t(b, 'y', x === '');
    const z = t(c, 'z', x === '' && y === '');
    return `${x}${y}${z} = ${this.d()}`;
  });

  protected readonly distanciaTex = computed(() => {
    const [a, b, c] = this.normal();
    const [x, y, z] = this.ponto();
    const num = Math.abs(a * x + b * y + c * z - this.d());
    const den = Math.sqrt(a * a + b * b + c * c);
    const f = (v: number) => Number(v.toFixed(3)).toLocaleString('pt-BR').replace(',', '{,}');
    return `D = \\frac{|${a} \\cdot ${x} + ${b} \\cdot ${y} + ${c} \\cdot ${z} - ${this.d()}|}{\\sqrt{${a * a + b * b + c * c}}} = \\frac{${num}}{${f(den)}} = ${f(this.distancia())}`;
  });

  /** O pedaço do plano em torno do pé da perpendicular da origem, a normal, P e o pé de P. */
  protected readonly tracos = computed<readonly Traco3d[]>(() => {
    const n = this.normal();
    const nn = escalar(n, n);
    const base = vezes(this.d() / nn, n); // ponto do plano mais perto da origem
    // Dois vetores no plano: perpendiculares à normal e entre si.
    const apoio: V = Math.abs(n[0]) < 0.9 * Math.sqrt(nn) ? [1, 0, 0] : [0, 1, 0];
    const e1 = unitario(vetorial(n, apoio));
    const e2 = unitario(vetorial(n, e1));
    const s = 4;
    const canto = (i: number, j: number): Ponto3d =>
      soma(base, soma(vezes(i * s, e1), vezes(j * s, e2)));
    const p = this.ponto();
    const pe = soma(p, vezes(-(escalar(n, p) - this.d()) / nn, n));
    return [
      {
        pontos: [canto(-1, -1), canto(1, -1), canto(1, 1), canto(-1, 1)],
        cor: 'apoio',
        preenchido: true,
      },
      {
        pontos: [base, soma(base, vezes(2, unitario(n)))],
        cor: 'serie-1',
        seta: true,
        rotulo: 'n',
      },
      { pontos: [pe, p], cor: 'serie-3', tracejado: true, rotulo: 'P', rotuloNoMeio: false },
    ];
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_RETAS_PLANOS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
