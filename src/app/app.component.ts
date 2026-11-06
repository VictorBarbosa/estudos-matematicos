import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { ModoCalculadora } from '@core/calculadora/models/calculadora.model';
import { ModoService } from './calculadora/modo.service';

/** Os quatro modos, na ordem em que o menu os mostra. */
interface ItemDoMenu {
  readonly modo: ModoCalculadora;
  readonly titulo: string;
  readonly descricao: string;
}

const ITENS: readonly ItemDoMenu[] = [
  { modo: 'basica', titulo: 'Básica', descricao: 'As quatro operações, com porcentagem' },
  { modo: 'cientifica', titulo: 'Científica', descricao: 'Seno, logaritmo, potência e raiz' },
  { modo: 'mmc-mdc', titulo: 'MMC e MDC', descricao: 'Com a divisão simultânea, passo a passo' },
  { modo: 'soma-produto', titulo: 'Fatorar', descricao: 'Dois números por produto e soma' },
];

/**
 * A moldura do aplicativo: menu lateral e a página da calculadora.
 *
 * No site os modos são abas dentro da janela. No telefone as abas comeriam a
 * faixa de baixo, que é justamente onde o polegar alcança o teclado — por
 * isso eles vieram para um menu lateral, aberto pelo botão de três riscos.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonApp,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonMenuToggle,
    IonRouterOutlet,
  ],
})
export class AppComponent {
  protected readonly modos = inject(ModoService);
  protected readonly itens = ITENS;
}
