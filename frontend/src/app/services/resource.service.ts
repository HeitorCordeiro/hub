import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EducationalResource {
  id?: number;
  title: string;
  description?: string;
  type: 'Video' | 'PDF' | 'Link';
  url: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AiGenerateResponse {
  description: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  getResources(
    page = 1,
    perPage = 15,
    q = '',
    field: 'title' | 'tag' | 'type' | 'all' = 'all'
  ): Observable<PaginatedResponse<EducationalResource>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
  
    if (q.trim()) params = params.set('q', q.trim());
    if (field) params = params.set('field', field);
  
    return this.http.get<PaginatedResponse<EducationalResource>>(`${this.apiUrl}/resources`, { params });
  }

  getResource(id: number): Observable<EducationalResource> {
    return this.http.get<EducationalResource>(`${this.apiUrl}/resources/${id}`);
  }

  createResource(resource: EducationalResource): Observable<EducationalResource> {
    return this.http.post<EducationalResource>(`${this.apiUrl}/resources`, resource);
  }

  updateResource(id: number, resource: EducationalResource): Observable<EducationalResource> {
    return this.http.put<EducationalResource>(`${this.apiUrl}/resources/${id}`, resource);
  }

  deleteResource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/resources/${id}`);
  }

  generateDescription(title: string, type: string): Observable<AiGenerateResponse> {
    return this.http.post<AiGenerateResponse>(`${this.apiUrl}/ai/generate-description`, { title, type });
  }
}
