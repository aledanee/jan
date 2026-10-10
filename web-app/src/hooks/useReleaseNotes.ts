/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/useReleaseStore.ts
import { create } from 'zustand'

type Release = {
  tag_name: string
  prerelease: boolean
  draft: boolean
  [key: string]: any
}

type ReleaseState = {
  release: Release | null
  loading: boolean
  error: string | null
  fetchLatestRelease: (includeBeta: boolean) => Promise<void>
}

export const useReleaseNotes = create<ReleaseState>((set) => ({
  release: null,
  loading: false,
  error: null,

  fetchLatestRelease: async () => {
    // Offline build: release notes come from the GitHub API, so they are not
    // fetched. The update dialog renders without them rather than reaching out.
    set({ release: null, loading: false, error: null })
  },
}))
