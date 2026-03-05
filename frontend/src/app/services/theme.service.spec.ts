import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ThemeService, Theme } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let document: Document;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    document = TestBed.inject(DOCUMENT);
    TestBed.flushEffects();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-system');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to system theme', () => {
    expect(service.theme()).toBe('system');
  });

  it('should apply theme class to body after setting theme', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(document.body.classList.contains('theme-dark')).toBe(true);
    expect(document.body.classList.contains('theme-light')).toBe(false);
  });

  it('should persist theme to localStorage', () => {
    service.setTheme('light');
    expect(localStorage.getItem('app-theme')).toBe('light');
  });

  it('should load persisted theme on init', () => {
    localStorage.setItem('app-theme', 'dark');
    // Re-create the service with persisted value
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(ThemeService);
    expect(newService.theme()).toBe('dark');
  });

  it('should switch between themes', () => {
    (['system', 'light', 'dark'] as Theme[]).forEach((theme) => {
      service.setTheme(theme);
      TestBed.flushEffects();
      expect(service.theme()).toBe(theme);
      expect(document.body.classList.contains(`theme-${theme}`)).toBe(true);
    });
  });
});
