import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-resource-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <div class="form-card">
        <h2>{{ isEdit() ? 'Editar Recurso' : 'Novo Recurso' }}</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Título *</label>
            <input type="text" id="title" formControlName="title" class="form-control"
              [class.is-invalid]="form.get('title')?.invalid && form.get('title')?.touched" />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <div class="invalid-feedback">Título é obrigatório</div>
            }
          </div>
          <div class="form-group">
            <label for="type">Tipo *</label>
            <select id="type" formControlName="type" class="form-control"
              [class.is-invalid]="form.get('type')?.invalid && form.get('type')?.touched">
              <option value="">Selecione...</option>
              <option value="Video">Video</option>
              <option value="PDF">PDF</option>
              <option value="Link">Link</option>
            </select>
            @if (form.get('type')?.invalid && form.get('type')?.touched) {
              <div class="invalid-feedback">Tipo é obrigatório</div>
            }
          </div>
          <div class="form-group">
            <label for="url">URL *</label>
            <input type="url" id="url" formControlName="url" class="form-control"
              [class.is-invalid]="form.get('url')?.invalid && form.get('url')?.touched" />
            @if (form.get('url')?.invalid && form.get('url')?.touched) {
              <div class="invalid-feedback">URL é obrigatória</div>
            }
          </div>
          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea id="description" formControlName="description" class="form-control" rows="4"></textarea>
            <button type="button" class="btn btn-ai" (click)="generateAiDescription()" [disabled]="aiLoading()">
              {{ aiLoading() ? 'Gerando...' : '✨ Gerar Descrição com IA' }}
            </button>
            @if (aiError()) {
              <div class="invalid-feedback">{{ aiError() }}</div>
            }
          </div>
          <div class="form-group">
            <label for="tag-input">Tags</label>
            <div class="tags-input">
              @for (tag of tags(); track tag) {
                <span class="tag">{{ tag }} <button type="button" (click)="removeTag(tag)">×</button></span>
              }
              <input type="text" id="tag-input" class="tag-input" placeholder="Adicionar tag e pressionar Enter"
                (keydown.enter)="addTag($event)" />
            </div>
          </div>
          @if (saveError()) {
            <div class="alert alert-danger">{{ saveError() }}</div>
          }
          <div class="form-actions">
            <button type="button" class="btn btn-cancel" (click)="navigateBack()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Salvando...' : (isEdit() ? 'Salvar' : 'Criar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container { min-height: calc(100vh - 60px); background-color: #f5f5f5; display: flex; justify-content: center; align-items: flex-start; padding: 2rem; }
    .form-card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.1); width: 100%; max-width: 680px; }
    .form-card h2 { margin-bottom: 1.5rem; color: #333; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: .4rem; color: #555; font-weight: 500; }
    .form-control { width: 100%; padding: .6rem .75rem; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; font-family: inherit; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .form-control.is-invalid { border-color: #dc3545; }
    .invalid-feedback { color: #dc3545; font-size: .875rem; margin-top: .25rem; display: block; }
    textarea.form-control { resize: vertical; }
    select.form-control { background: white; }
    .btn-ai { margin-top: .5rem; padding: .5rem 1rem; border: 1px solid #667eea; border-radius: 5px; background: white; color: #667eea; cursor: pointer; font-size: .875rem; }
    .btn-ai:hover:not(:disabled) { background: #667eea; color: white; }
    .btn-ai:disabled { opacity: .6; cursor: not-allowed; }
    .tags-input { display: flex; flex-wrap: wrap; gap: .4rem; padding: .4rem; border: 1px solid #ddd; border-radius: 5px; min-height: 2.5rem; align-items: center; }
    .tag { display: inline-flex; align-items: center; gap: .25rem; background: #e8edff; color: #667eea; padding: .2rem .5rem; border-radius: 12px; font-size: .85rem; }
    .tag button { background: none; border: none; cursor: pointer; color: #667eea; font-size: 1rem; line-height: 1; padding: 0; }
    .tag-input { border: none; outline: none; font-size: .9rem; min-width: 120px; flex: 1; }
    .alert { padding: .75rem; margin-bottom: 1rem; border-radius: 5px; }
    .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee; }
    .btn { padding: .6rem 1.25rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 500; font-size: .9rem; transition: opacity .2s; }
    .btn:hover:not(:disabled) { opacity: .85; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
    .btn-primary { background-color: #667eea; color: white; }
    .btn-cancel { background-color: #f0f0f0; color: #555; }
  `]
})
export class ResourceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resourceService = inject(ResourceService);

  form!: FormGroup;
  isEdit = signal(false);
  saving = signal(false);
  aiLoading = signal(false);
  aiError = signal('');
  saveError = signal('');
  tags = signal<string[]>([]);
  resourceId: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      url: ['', Validators.required],
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.resourceId = +id;
      this.loadResource(this.resourceId);
    }
  }

  loadResource(id: number): void {
    this.resourceService.getResource(id).subscribe({
      next: (resource) => {
        this.form.patchValue(resource);
        this.tags.set(resource.tags || []);
      },
      error: () => {
        this.saveError.set('Erro ao carregar recurso. Redirecionando...');
        setTimeout(() => this.navigateBack(), 1500);
      }
    });
  }

  addTag(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      if (!this.tags().includes(value)) {
        this.tags.update(t => [...t, value]);
      }
      input.value = '';
    }
  }

  removeTag(tag: string): void {
    this.tags.update(t => t.filter(x => x !== tag));
  }

  generateAiDescription(): void {
    const title = this.form.get('title')?.value;
    const type = this.form.get('type')?.value;
    if (!title || !type) {
      this.aiError.set('Preencha o título e o tipo antes de gerar a descrição');
      return;
    }
    this.aiError.set('');
    this.aiLoading.set(true);
    this.resourceService.generateDescription(title, type).subscribe({
      next: (response) => {
        this.form.patchValue({ description: response.description });
        this.tags.set(response.tags);
        this.aiLoading.set(false);
      },
      error: () => {
        this.aiError.set('Erro ao gerar descrição com IA. Tente novamente.');
        this.aiLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saveError.set('');
    const payload = { ...this.form.value, tags: this.tags() };
    const op = this.isEdit()
      ? this.resourceService.updateResource(this.resourceId!, payload)
      : this.resourceService.createResource(payload);
    op.subscribe({
      next: () => this.navigateBack(),
      error: () => {
        this.saveError.set('Erro ao salvar recurso. Tente novamente.');
        this.saving.set(false);
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/resources']);
  }
}
