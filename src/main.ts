import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app-config/app.config';
import { App } from './app/app-main/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
