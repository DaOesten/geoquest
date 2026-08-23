/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FirstVisitDialog } from './first-visit-dialog'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('FirstVisitDialog', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('shows dialog when no localStorage flag exists', async () => {
    render(<FirstVisitDialog />)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible()
    })
    expect(screen.getByText('Willkommen bei Geo Quest')).toBeVisible()
  })

  it('does not show dialog when localStorage flag exists', () => {
    localStorageMock.setItem('gq_first_visit_done', 'true')
    render(<FirstVisitDialog />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sets localStorage flag and closes dialog on "Verstanden" click', async () => {
    render(<FirstVisitDialog />)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verstanden' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('gq_first_visit_done', 'true')
  })

  it('shows dialog when localStorage throws (incognito mode)', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('SecurityError') })
    render(<FirstVisitDialog />)
    expect(screen.getByRole('dialog')).toBeVisible()
  })
})
