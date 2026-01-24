import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { withInterceptors } from '@angular/common/http';
import { csrfInterceptor } from './interceptors/csrf.interceptor';

import { routes } from './app.routes';
import { environment } from '../environments/environment.development';
import { DeckService } from './services/deck.service';
import { CardService } from './services/card.service';
import { MockDeckService } from './services/mock-deck.service';
import { MockCardService } from './services/mock-card.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([csrfInterceptor])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    ...(environment.useMock
      ? [
          { provide: DeckService, useClass: MockDeckService },
          { provide: CardService, useClass: MockCardService }
        ]
      : [])
  ]
};
