import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_BASE_URL } from './core/services/api.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    {
      provide: API_BASE_URL,
      useValue: 'https://localhost:7127/api'
    }
  ]
};