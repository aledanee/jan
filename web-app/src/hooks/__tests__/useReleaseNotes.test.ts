import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReleaseNotes } from '../useReleaseNotes'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useReleaseNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state to defaults
    useReleaseNotes.setState({
      release: null,
      loading: false,
      error: null,
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useReleaseNotes())

    expect(result.current.release).toBe(null)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.fetchLatestRelease).toBe('function')
  })

  describe('fetchLatestRelease', () => {
    // Offline build: release notes come from the GitHub API, so the hook never
    // fetches. These tests pin that no request is made and the dialog still
    // renders with no notes.
    it('should not call fetch', async () => {
      const { result } = renderHook(() => useReleaseNotes())

      await act(async () => {
        await result.current.fetchLatestRelease(false)
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should leave the release empty', async () => {
      const { result } = renderHook(() => useReleaseNotes())

      await act(async () => {
        await result.current.fetchLatestRelease(false)
      })

      expect(result.current.release).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should ignore the includeBeta flag', async () => {
      const { result } = renderHook(() => useReleaseNotes())

      await act(async () => {
        await result.current.fetchLatestRelease(true)
      })

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result.current.release).toBe(null)
    })

    it('should clear a previous error on a new call', async () => {
      useReleaseNotes.setState({ error: 'First error' })

      const { result } = renderHook(() => useReleaseNotes())

      await act(async () => {
        await result.current.fetchLatestRelease(false)
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('state management', () => {
    it('should maintain state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useReleaseNotes())
      const { result: result2 } = renderHook(() => useReleaseNotes())

      expect(result1.current.release).toBe(result2.current.release)
      expect(result1.current.loading).toBe(result2.current.loading)
      expect(result1.current.error).toBe(result2.current.error)
    })
  })

  describe('multiple requests', () => {
    it('should handle sequential requests without fetching', async () => {
      const { result } = renderHook(() => useReleaseNotes())

      await act(async () => {
        await result.current.fetchLatestRelease(false)
      })

      await act(async () => {
        await result.current.fetchLatestRelease(true)
      })

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })
})
