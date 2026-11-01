import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from '../app-routes/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Sem zone.js: toda a reatividade passa por signals.
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Trocar de tópico deve levar ao topo da página, não manter a rolagem.
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    /*
     * O service worker guarda a versão em uso e só troca quando o aluno aceita.
     *
     * Vale por dois motivos, nesta ordem: o GitHub Pages apaga os arquivos com
     * hash a cada publicação, e sem cache uma aba aberta durante um deploy
     * quebra ao abrir o próximo tópico; e o site passa a funcionar sem rede.
     *
     * `registerWhenStable` espera a aplicação assentar para registrar, com 30 s
     * de teto — registrar antes disso disputaria banda com o primeiro desenho.
     * Em desenvolvimento fica desligado, senão o cache serviria código velho a
     * cada recarga.
     */
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
