import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
// Se hai le azioni di auth:
import * as AuthActions from '../../core/auth/store/auth.actions';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-[100svh] flex flex-col items-center px-4 py-10">
      <div class="w-full max-w-xl bg-foreground rounded-2xl p-6 main-shadow">
        <header class="flex items-center gap-3 mb-4">
          <mat-icon class="material-symbols-rounded text-error">warning</mat-icon>
          <h1 class="text-2xl font-extrabold">Elimina account</h1>
        </header>

        <p class="text-sm opacity-80 mb-4">
          L’eliminazione dell’account è <strong>definitiva</strong> e non potrà essere annullata.
          Per motivi di sicurezza devi confermare quanto segue.
          Consulta la <a class="underline text-accent" [routerLink]="['/privacy-policy']">Privacy Policy</a>.
        </p>

        <ul class="list-disc pl-6 text-sm mb-4 space-y-1">
          <li>Il tuo profilo e i dati associati verranno rimossi.</li>
          <li>Per riutilizzare l’app dovrai creare un nuovo account.</li>
        </ul>

        <div class="space-y-3">
          <label class="checkbox block">
            <input type="checkbox" [(ngModel)]="confirmChecked" />
            <span class="checkmark"></span>
            <span class="ml-2">Ho compreso le conseguenze e desidero procedere.</span>
          </label>

          <div>
            <label class="block text-sm mb-1">Digita <strong>ELIMINA</strong> per confermare</label>
            <input
              class="w-full p-3 rounded border-input"
              [(ngModel)]="confirmText"
              [disabled]="loading"
              placeholder="ELIMINA"
              autocomplete="off" />
          </div>

          <div *ngIf="error" class="error rounded p-3 text-sm">
            {{ error }}
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              class="rounded-full icon-accent text-white font-bold px-6 py-2 flex items-center gap-2 disabled:opacity-50"
              [disabled]="!canSubmit() || loading"
              (click)="deleteAccount()">
              <mat-icon *ngIf="loading" class="material-symbols-rounded-filled animate-spin">progress_activity</mat-icon>
              Elimina definitivamente
            </button>

            <a class="underline text-accent hover:text-cyan-950" [routerLink]="['/settings']">Annulla</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block }
  `]
})
export default class DeleteAccountComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private store = inject(Store);

  confirmChecked = false;
  confirmText = '';
  loading = false;
  error: string | null = null;

  canSubmit(): boolean {
    return this.confirmChecked && this.confirmText.trim().toUpperCase() === 'ELIMINA';
  }

  deleteAccount() {
    if (!this.canSubmit() || this.loading) return;
    this.loading = true;
    this.error = null;

    this.http.delete<{ message: string }>(`${environment.BASE_URL}/auth/delete-account`).subscribe({
      next: () => {
        // opzionale: se hai un’azione di logout NgRx, dispatchala
        try { this.store.dispatch(AuthActions.logout?.()); } catch { /* noop */ }

        // pulizia locale se necessario (token, stato, ecc.)
        try { localStorage.clear(); sessionStorage.clear(); } catch {}

        this.router.navigate(['/auth/login'], { queryParams: { accountDeleted: 1 } });
      },
      error: (err) => {
        this.error = err?.error?.error || 'Impossibile completare l’operazione. Riprova più tardi.';
        this.loading = false;
      }
    });
  }
}
