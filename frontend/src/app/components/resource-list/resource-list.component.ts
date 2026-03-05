import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService, EducationalResource } from '../../services/resource.service';
import { AuthService } from '../../services/auth.service';

type SearchField = 'title' | 'tag' | 'type';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="resources-container">
      <div class="content">
        <div class="header">
          <h2>Recursos Educacionais</h2>
          @if (authService.isLoggedIn()) {
            <button class="btn btn-success" (click)="navigateToCreate()">+ Novo Recurso</button>
          }
        </div>

        <div class="search-controls">
          <div class="field-dropdown" (keydown.escape)="closeFieldMenu()">
            <button
              type="button"
              class="btn btn-icon btn-field"
              (click)="toggleFieldMenu()"
              [attr.aria-expanded]="fieldMenuOpen()"
              aria-haspopup="menu"
              [attr.aria-label]="'Campo de busca: ' + searchFieldLabel() + '. Clique para escolher.'"
              [title]="'Campo: ' + searchFieldLabel() + ' (clique para escolher)'"
            >
              @switch (searchField()) {
                @case ('title') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                }
                @case ('tag') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                }
                @case ('type') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                }
              }

              <svg class="caret" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            @if (fieldMenuOpen()) {
              <div class="field-menu" role="menu">
                <button type="button" role="menuitem" class="field-item" (click)="selectSearchField('title')">
                  <span class="field-item-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6"/>
                    </svg>
                  </span>
                  Título
                  @if (searchField() === 'title') { <span class="check">✓</span> }
                </button>

                <button type="button" role="menuitem" class="field-item" (click)="selectSearchField('tag')">
                  <span class="field-item-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </span>
                  Tag
                  @if (searchField() === 'tag') { <span class="check">✓</span> }
                </button>

                <button type="button" role="menuitem" class="field-item" (click)="selectSearchField('type')">
                  <span class="field-item-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                  </span>
                  Tipo
                  @if (searchField() === 'type') { <span class="check">✓</span> }
                </button>
              </div>
            }
          </div>

          <span class="field-badge">{{ searchFieldLabel() }}</span>

          <input
            type="search"
            class="search-input"
            placeholder="Buscar..."
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            aria-label="Buscar recursos"
          />
        </div>

        @if (loading() && totalItems() > 0) {
          <div class="search-loading">Buscando...</div>
        }

        @if (loading() && totalItems() === 0) {
          <div class="loading">Carregando...</div>
        } @else if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        } @else if (visibleResources().length === 0) {
          <div class="empty-state">
            @if (searchQuery()) {
              Nenhum recurso encontrado para "{{ searchQuery() }}".
            } @else {
              Nenhum recurso encontrado. Crie o primeiro!
            }
          </div>
        } @else {
          <div class="table-wrap">
            <table class="resources-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>URL</th>
                  <th>Tags</th>
                  <th class="col-actions">Ações</th>
                </tr>
              </thead>

              <tbody>
                @for (r of visibleResources(); track r.id) {
                  <tr
                    class="clickable-row"
                    (click)="navigateToDetail(r.id!)"
                    role="button"
                    tabindex="0"
                    (keydown.enter)="navigateToDetail(r.id!)"
                    (keydown.space)="navigateToDetail(r.id!)"
                    aria-label="Ver detalhes de {{ r.title }}"
                  >
                    <td class="col-title">{{ r.title }}</td>
                    <td><span class="badge badge-type">{{ r.type }}</span></td>
                    <td>
                      <a
                        [href]="r.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="resource-link"
                        (click)="$event.stopPropagation()"
                        (keydown)="$event.stopPropagation()"
                      >
                        {{ r.url.length > 40 ? (r.url | slice:0:40) + '...' : r.url }}
                      </a>
                    </td>

                    <td>
                      @for (tag of (r.tags || []); track tag) {
                        <span class="badge badge-tag">{{ tag }}</span>
                      }
                    </td>

                    <td class="col-actions" (click)="$event.stopPropagation()">
                      @if (authService.isLoggedIn()) {
                        <div class="actions">
                          <button
                            class="btn btn-icon btn-edit"
                            (click)="navigateToEdit(r.id!)"
                            aria-label="Editar {{ r.title }}"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>

                          <button
                            class="btn btn-icon btn-delete"
                            (click)="confirmDelete(r)"
                            aria-label="Excluir {{ r.title }}"
                            title="Excluir"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6"/>
                              <path d="M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages > 1) {
            <div class="pagination">
              <button class="btn btn-page" [disabled]="currentPage() <= 1" (click)="changePage(currentPage() - 1)">Anterior</button>
              <span>Página {{ currentPage() }} de {{ totalPages }}</span>
              <button class="btn btn-page" [disabled]="currentPage() >= totalPages" (click)="changePage(currentPage() + 1)">Próxima</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .resources-container { min-height: calc(100vh - 60px); background-color: #f5f5f5; }
    .content { max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .header h2 { margin: 0; color: #333; }

    .search-controls { display: flex; gap: .6rem; align-items: center; margin-bottom: .5rem; }
    .search-loading { margin-top: .35rem; font-size: .85rem; color: #667eea; }

    .field-dropdown { position: relative; display: inline-flex; }

    .btn-field { background: #667eea; color: white; gap: .35rem; }
    .caret { margin-left: .15rem; opacity: .95; }

    .field-menu {
      position: absolute;
      top: calc(100% + .4rem);
      left: 0;
      min-width: 180px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,.12);
      padding: .35rem;
      z-index: 20;
    }

    .field-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: .55rem;
      justify-content: space-between;
      padding: .5rem .6rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      color: #333;
      font-size: .9rem;
    }

    .field-item:hover { background: #f7f7ff; }
    .field-item-icon { display: inline-flex; align-items: center; justify-content: center; color: #667eea; }
    .check { color: #667eea; font-weight: 700; }

    .field-badge {
      font-size: .85rem;
      color: #555;
      background: #fff;
      border: 1px solid #ddd;
      padding: .25rem .55rem;
      border-radius: 999px;
      white-space: nowrap;
    }

    .search-input {
      flex: 1 1 auto;
      width: auto;
      box-sizing: border-box;
      padding: .45rem .9rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: .95rem;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }
    .search-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.15); }

    .loading, .empty-state { text-align: center; padding: 2rem; color: #666; }
    .table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .resources-table { width: 100%; min-width: 700px; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); overflow: hidden; }

    .resources-table thead { background: #667eea; color: white; }
    .resources-table th, .resources-table td { padding: 1rem 1.25rem; text-align: left; }

    .resources-table tbody tr { border-bottom: 1px solid #eee; transition: background .15s; }
    .resources-table tbody tr:last-child { border-bottom: none; }
    .resources-table tbody tr:hover { background-color: #f8f9ff; }
    .clickable-row { cursor: pointer; }
    .col-title { font-weight: 500; }

    .col-actions { position: sticky; right: 0; background: white; box-shadow: -2px 0 6px rgba(0,0,0,.06); min-width: 90px; }
    .resources-table thead .col-actions { background: #667eea; box-shadow: -2px 0 6px rgba(0,0,0,.15); }
    .resources-table tbody tr:hover .col-actions { background: #f8f9ff; }

    .resource-link { color: #667eea; text-decoration: none; font-weight: 500; display: inline-block; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .resource-link:hover { text-decoration: underline; }

    .badge { display: inline-block; padding: .2rem .6rem; border-radius: 12px; font-size: .78rem; font-weight: 500; margin: .1rem .2rem .1rem 0; }
    .badge-type { background-color: #e8edff; color: #667eea; }
    .badge-tag { background-color: #f0f0f0; color: #555; }

    .actions { display: flex; gap: .4rem; }
    .btn { padding: .4rem .9rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 500; font-size: .875rem; transition: opacity .2s; }
    .btn:hover:not(:disabled) { opacity: .9; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-success { background-color: #28a745; color: white; padding: .5rem 1rem; }
    .btn-icon { display: inline-flex; align-items: center; justify-content: center; padding: .35rem .45rem; border-radius: 5px; }
    .btn-edit { background-color: #667eea; color: white; }
    .btn-delete { background-color: #dc3545; color: white; }
    .btn-page { background-color: #667eea; color: white; }

    .alert { padding: 1rem; margin-bottom: 1rem; border-radius: 5px; }
    .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; color: #555; }
  `]
})
export class ResourceListComponent implements OnInit {
  private resourceService = inject(ResourceService);
  private router = inject(Router);
  authService = inject(AuthService);

  resources = signal<EducationalResource[]>([]);
  loading = signal(false);
  error = signal('');

  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(8);

  searchQuery = signal('');
  searchField = signal<SearchField>('title');

  searchResults = signal<EducationalResource[] | null>(null);

  private isSearching = computed(() => this.searchQuery().trim().length > 0);

  visibleResources = computed(() => {
    if (this.isSearching()) {
      // Paginação local para resultados de busca
      const list = this.searchResults() ?? [];
      const start = (this.currentPage() - 1) * this.pageSize();
      const end = start + this.pageSize();
      return list.slice(start, end);
    }
    
    // Sem busca: backend já retorna a página correta
    return this.resources();
  });

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize());
  }

  fieldMenuOpen = signal(false);

  ngOnInit(): void {
    this.loadResources();
  }

  searchFieldLabel(): string {
    switch (this.searchField()) {
      case 'title': return 'Título';
      case 'tag': return 'Tag';
      case 'type': return 'Tipo';
    }
  }

  toggleFieldMenu(): void {
    this.fieldMenuOpen.set(!this.fieldMenuOpen());
  }

  closeFieldMenu(): void {
    this.fieldMenuOpen.set(false);
  }

  selectSearchField(value: SearchField): void {
    this.searchField.set(value);
    this.currentPage.set(1);
    this.fieldMenuOpen.set(false);
    this.loadResources();
  }

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);

    if (this.searchTimer) clearTimeout(this.searchTimer);

    this.searchTimer = setTimeout(() => {
      this.loadResources();
    }, 300);
  }

  loadResources(): void {
    this.loading.set(true);
    this.error.set('');
    this.resources.set([]);

    const q = this.searchQuery().trim();

    if (q) {
      this.resourceService.getResources(1, 1000, q, this.searchField()).subscribe({
        next: (response) => {
          const all = response.data ?? [];
          this.searchResults.set(all);
          this.totalItems.set(all.length);
          this.resources.set([]);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erro ao carregar recursos.');
          this.loading.set(false);
        }
      });
      return;
    }

    this.searchResults.set(null);
    this.resourceService.getResources(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.resources.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar recursos.');
        this.loading.set(false);
      }
    });
  }

  changePage(page: number): void {
    const total = this.totalPages;

    if (page < 1 || (total > 0 && page > total)) return;

    this.currentPage.set(page);

    if (!this.isSearching()) {
      this.loadResources();
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/resources/new']);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/resources', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/resources', id, 'edit']);
  }

  confirmDelete(resource: EducationalResource): void {
    if (confirm(`Deseja excluir "${resource.title}"?`)) {
      this.resourceService.deleteResource(resource.id!).subscribe({
        next: () => this.loadResources(),
        error: () => alert('Erro ao excluir recurso.')
      });
    }
  }
}