import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResourceService, EducationalResource } from '../../services/resource.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container">
      <div class="content">
        @if (loading()) {
          <div class="loading">Carregando...</div>
        } @else if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        } @else if (resource()) {
          <div class="detail-card">
            <div class="detail-header">
              <div class="header-top">
                <span class="badge badge-type">{{ resource()!.type }}</span>
                @if (authService.isLoggedIn()) {
                  <div class="header-actions">
                    <a [routerLink]="['/resources', resource()!.id, 'edit']"
                       class="btn btn-edit"
                       aria-label="Editar recurso">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Editar
                    </a>
                    <button class="btn btn-delete" (click)="confirmDelete()" aria-label="Excluir recurso">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Excluir
                    </button>
                  </div>
                }
              </div>
              <h2 class="resource-title">{{ resource()!.title }}</h2>
            </div>
            <div class="detail-body">
              @if (resource()!.description) {
                <div class="detail-section">
                  <h3 class="section-label">Descrição</h3>
                  <p class="description-text">{{ resource()!.description }}</p>
                </div>
              }
              <div class="detail-section">
                <h3 class="section-label">URL</h3>
                <a [href]="resource()!.url" target="_blank" rel="noopener noreferrer" class="resource-link">
                  {{ resource()!.url }}
                </a>
              </div>
              @if (resource()!.tags && resource()!.tags!.length > 0) {
                <div class="detail-section">
                  <h3 class="section-label">Tags</h3>
                  <div class="tags-wrap">
                    @for (tag of resource()!.tags!; track tag) {
                      <span class="badge badge-tag">{{ tag }}</span>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="detail-footer">
              <a routerLink="/resources" class="btn btn-back">← Voltar para lista</a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-container { min-height: calc(100vh - 60px); background-color: #f5f5f5; }
    .content { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
    .loading { text-align: center; padding: 2rem; color: #666; }
    .alert { padding: 1rem; margin-bottom: 1rem; border-radius: 5px; }
    .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .detail-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); overflow: hidden; }
    .detail-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem 2rem; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
    .header-actions { display: flex; gap: .5rem; }
    .resource-title { margin: 0; font-size: 1.5rem; font-weight: 600; }
    .detail-body { padding: 1.5rem 2rem; }
    .detail-section { margin-bottom: 1.5rem; }
    .detail-section:last-child { margin-bottom: 0; }
    .section-label { margin: 0 0 .5rem; font-size: .85rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #888; }
    .description-text { margin: 0; line-height: 1.6; color: #444; white-space: pre-wrap; }
    .resource-link { color: #667eea; word-break: break-all; }
    .resource-link:hover { text-decoration: underline; }
    .tags-wrap { display: flex; flex-wrap: wrap; gap: .25rem; }
    .badge { display: inline-block; padding: .25rem .65rem; border-radius: 12px; font-size: .78rem; font-weight: 500; }
    .badge-type { background-color: rgba(255,255,255,.25); color: white; }
    .badge-tag { background-color: #f0f0f0; color: #555; }
    .detail-footer { padding: 1rem 2rem; border-top: 1px solid #eee; }
    .btn { display: inline-flex; align-items: center; gap: .35rem; padding: .4rem .9rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 500; font-size: .875rem; transition: opacity .2s; text-decoration: none; }
    .btn:hover { opacity: .85; }
    .btn-back { background-color: #f0f0f0; color: #444; }
    .btn-edit { background-color: rgba(255,255,255,.2); color: white; }
    .btn-edit:hover { background-color: rgba(255,255,255,.35); opacity: 1; }
    .btn-delete { background-color: rgba(220,53,69,.7); color: white; }
    .btn-delete:hover { background-color: rgba(220,53,69,.9); opacity: 1; }
  `]
})
export class ResourceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private resourceService = inject(ResourceService);
  private router = inject(Router);
  authService = inject(AuthService);

  resource = signal<EducationalResource | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId != null ? Number(rawId) : NaN;
    if (isNaN(id) || id <= 0) {
      this.error.set('Recurso não encontrado.');
      return;
    }
    this.loading.set(true);
    this.resourceService.getResource(id).subscribe({
      next: (r) => {
        this.resource.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar recurso.');
        this.loading.set(false);
      }
    });
  }

  confirmDelete(): void {
    const r = this.resource();
    if (!r) return;
    if (confirm(`Deseja excluir "${r.title}"?`)) {
      this.resourceService.deleteResource(r.id!).subscribe({
        next: () => this.router.navigate(['/resources']),
        error: () => alert('Erro ao excluir recurso.')
      });
    }
  }
}
