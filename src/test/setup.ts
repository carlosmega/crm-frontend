import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia (usado por componentes responsive)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (usado por componentes virtualizados)
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = []

  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
} as any
