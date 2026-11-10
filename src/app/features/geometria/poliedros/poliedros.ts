import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Poliedro, poliedroPiramide, poliedroPlatonico, poliedroPrisma } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { Vista3d } from '@shared/components/vista-3d/vista-3d';
import { Traco3d } from '@shared/components/vista-3d/vista-3d.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/geometria/poliedros/poliedros.i18n.json';
import { geradorPoliedros } from '@features/geometria/poliedros/poliedros.gerador';
import { TEORIA_POLIEDROS } from '@features/geometria/poliedros/poliedros.teoria';

type Escolha =
  'tetraedro' | 'cubo' | 'octaedro' | 'dodecaedro' | 'icosaedro' | 'prisma' | 'piramide';

const ESCOLHAS: readonly Escolha[] = [
  'tetraedro',
  'cubo',
  'octaedro',
  'dodecaedro',
  'icosaedro',
  'prisma',
  'piramide',
];

@Component({
  selector: 'app-poliedros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout, Vista3d],
  templateUrl: './poliedros.html',
  styleUrl: './poliedros.scss',
})
export class Poliedros {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorPoliedros;
  protected readonly conceitos = TEORIA_POLIEDROS.map((teoria) => teoria.id);
  protected readonly escolhas = ESCOLHAS;

  protected readonly escolha = signal<Escolha>('cubo');
  protected readonly lados = signal(5);

  protected readonly usaLados = computed(
    () => this.escolha() === 'prisma' || this.escolha() === 'piramide',
  );

  protected readonly poliedro = computed<Poliedro>(() => {
    const e = this.escolha();
    const n = Math.max(3, this.lados());
    if (e === 'prisma') return poliedroPrisma(n);
    if (e === 'piramide') return poliedroPiramide(n);
    return poliedroPlatonico(e);
  });

  protected readonly v = computed(() => this.poliedro().vertices.length);
  protected readonly a = computed(() => this.poliedro().arestas.length);
  protected readonly f = computed(() => this.poliedro().faces);

  protected readonly eulerTex = computed(
    () => `V - A + F = ${this.v()} - ${this.a()} + ${this.f()} = ${this.v() - this.a() + this.f()}`,
  );

  protected readonly tracos = computed<readonly Traco3d[]>(() => {
    const { vertices, arestas } = this.poliedro();
    return arestas.map(([i, j]) => ({
      pontos: [vertices[i]!, vertices[j]!],
      cor: 'aresta' as const,
    }));
  });

  protected readonly descricao = computed(() =>
    this.texto('descricaoVista', {
      nome: this.texto(this.escolha()),
      v: String(this.v()),
      a: String(this.a()),
      f: String(this.f()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_POLIEDROS);
  }

  protected selecionar(escolha: Escolha): void {
    this.escolha.set(escolha);
  }
}
