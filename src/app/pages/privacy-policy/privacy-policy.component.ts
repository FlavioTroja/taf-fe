import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-[100svh] flex flex-col bg-main">
      <main class="m-auto w-full max-w-screen-lg px-4 py-8 md:py-12">
        <!-- Header -->
        <header class="mb-6">
          <h1 id="top" class="text-2xl md:text-3xl font-extrabold letter-spacing">
            Privacy Policy – App Trani Autism Friendly +
          </h1>
          <div class="mt-2 flex flex-wrap items-center gap-3 text-sm opacity-80">
            <span>Overzoom Srl</span>
            <span class="hidden md:inline">•</span>
            <time [attr.datetime]="updatedAt.toISOString()">
              Aggiornata il {{ updatedAt | date:'d MMMM y':'':'it' }}
            </time>

            <button (click)="print()"
                    class="ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 default-shadow bg-foreground hover:bg-hover"
                    aria-label="Stampa questa informativa">
              <mat-icon class="material-symbols-rounded">print</mat-icon>
              <span class="text-sm font-semibold">Stampa</span>
            </button>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
          <!-- Indice -->
          <aside class="md:sticky md:top-6 md:self-start bg-foreground rounded-2xl p-4 main-shadow">
            <div class="text-sm font-semibold mb-2">Indice</div>
            <nav class="text-sm space-y-1">
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="titolare">1. Titolare del Trattamento</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="tipi-dati">2. Tipologia di dati trattati</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="finalita">3. Finalità e base giuridica</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="modalita">4. Modalità del trattamento e sicurezza</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="comunicazione">5. Ambito di comunicazione e diffusione</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="luogo">6. Luogo di trattamento e trasferimento dati</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="conservazione">7. Periodo di conservazione</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="diritti">8. Diritti degli interessati</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="notifiche">9. Notifiche e comunicazioni</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="cookie">10. Cookie e tracciamento</a>
              <a class="block hover:underline" [routerLink]="['/privacy-policy']" fragment="modifiche">11. Modifiche all’informativa</a>
            </nav>
          </aside>

          <!-- Contenuto -->
          <article class="bg-foreground rounded-2xl p-6 md:p-8 main-shadow text-[0.98rem] leading-7">
            <p class="opacity-80 text-sm mb-6">
              (ai sensi del Regolamento UE 2016/679 “GDPR” e della normativa nazionale)
            </p>

            <section id="titolare" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">1. Titolare del Trattamento</h2>
              <p>
                Il Titolare del trattamento dei dati personali è <strong>Overzoom Srl</strong>, con sede legale in
                Via Settembrini n. 23, 76123 Andria (BT), Italia,
                email: <a class="text-accent underline" href="mailto:info@overzoom.it">info@overzoom.it</a>.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="tipi-dati" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">2. Tipologia di dati trattati</h2>
              <p>
                Attraverso l’applicazione “Trani Autism Friendly” saranno raccolti e trattati i seguenti dati personali:
              </p>
              <ul class="list-disc pl-6 mt-2 space-y-1">
                <li>Nome</li>
                <li>Cognome</li>
                <li>Indirizzo email</li>
                <li>Password</li>
              </ul>
              <p class="mt-2">
                Il conferimento di tali dati è necessario per la registrazione e l’utilizzo delle funzionalità
                dell’applicazione.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="finalita" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">3. Finalità e base giuridica del trattamento</h2>
              <p>I dati personali forniti dagli utenti saranno trattati per:</p>
              <ul class="list-disc pl-6 mt-2 space-y-1">
                <li>consentire la creazione e la gestione dell’account utente;</li>
                <li>permettere la fruizione delle funzionalità dell’app, quali iscrizione a eventi ed iniziative;</li>
                <li>invio, previo espresso consenso, di notifiche relative a iniziative, notizie, aggiornamenti ed eventi pubblici o privati.</li>
              </ul>
              <p class="mt-2">
                La base giuridica del trattamento è l’esecuzione di un contratto di cui l’interessato è parte
                (art. 6, par. 1, lett. b, GDPR) e il consenso espresso per comunicazioni opzionali
                (art. 6, par. 1, lett. a, GDPR).
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="modalita" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">4. Modalità del trattamento e misure di sicurezza</h2>
              <p>
                Il trattamento avviene mediante strumenti informatici e telematici secondo logiche e modalità
                strettamente correlate alle finalità indicate, garantendo la sicurezza e la riservatezza dei dati.
              </p>
              <p class="mt-2">
                I dati sono trasferiti e conservati in modalità cifrata tramite protocolli standard di sicurezza;
                l’accesso è riservato esclusivamente a personale autorizzato di Overzoom Srl.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="comunicazione" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">5. Ambito di comunicazione e diffusione</h2>
              <p>
                I dati personali non saranno comunicati a terzi né diffusi. L’accesso ai dati è consentito solo al
                personale autorizzato dal Titolare del trattamento.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="luogo" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">6. Luogo di trattamento e trasferimento dati</h2>
              <p>
                I dati personali sono trattati e conservati presso server ubicati nell’Unione Europea.
                Non è previsto alcun trasferimento di dati verso Paesi extra-UE.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="conservazione" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">7. Periodo di conservazione dei dati</h2>
              <p>
                I dati personali sono conservati per tutta la durata dell’account utente. In seguito alla richiesta
                di cancellazione dell’account tramite app, i dati saranno eliminati tempestivamente e definitivamente.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="diritti" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">8. Diritti degli interessati</h2>
              <p>L’utente può, in qualsiasi momento:</p>
              <ul class="list-disc pl-6 mt-2 space-y-1">
                <li>accedere ai propri dati personali;</li>
                <li>richiedere la rettifica o l’aggiornamento (modificabili direttamente tramite app);</li>
                <li>ottenere la cancellazione dell’account tramite app;</li>
                <li>
                  esercitare altri diritti previsti dagli artt. 15-22 del GDPR (limitazione, portabilità, opposizione),
                  scrivendo a <a class="text-accent underline" href="mailto:info@overzoom.it">info@overzoom.it</a>;
                </li>
                <li>proporre reclamo all’Autorità Garante per la Protezione dei Dati Personali.</li>
              </ul>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="notifiche" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">9. Notifiche e comunicazioni</h2>
              <p>
                Le notifiche sono inviate solo previo esplicito consenso dell’utente e possono essere gestite
                o disattivate direttamente tramite l’app.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="cookie" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">10. Cookie e strumenti di tracciamento</h2>
              <p>
                L’applicazione non utilizza cookie, strumenti di tracciamento o sistemi di analytics.
              </p>
            </section>

            <hr class="my-6 border-gray-200">

            <section id="modifiche" class="scroll-mt-24">
              <h2 class="text-xl font-bold mb-2">11. Modifiche all’informativa</h2>
              <p>
                La presente Informativa potrà essere aggiornata. In caso di modifiche sostanziali, queste saranno
                comunicate tempestivamente agli utenti tramite app o i canali dedicati.
              </p>
              <p class="mt-2 opacity-80">
                La presente informativa è stata pubblicata in data 7 agosto 2025.
              </p>
            </section>

            <div class="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              <a class="underline text-accent hover:text-cyan-950" routerLink="/">Torna alla home</a>
              <a class="underline text-accent hover:text-cyan-950" [routerLink]="['/privacy-policy']" fragment="top">Torna su ↑</a>
            </div>
          </article>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    /* scroll suave per le ancore */
    :host, :host * { scroll-behavior: smooth; }
  `]
})
export default class PrivacyPolicyComponent {
  updatedAt = new Date(2025, 7, 7); // 7 agosto 2025 (mese 0-based)
  print() { window.print(); }
}
