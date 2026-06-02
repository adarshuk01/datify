import { create } from 'zustand'

export const useHomeStore = create((set, get) => ({
  profiles:     [],
  currentIndex: 0,
  page:         1,
  hasMore:      true,
  liked:        new Set(),
  superLiked:   new Set(),

  setProfiles:     (fn) => set((s) => ({ profiles: typeof fn === 'function' ? fn(s.profiles) : fn })),
  setCurrentIndex: (fn) => set((s) => ({ currentIndex: typeof fn === 'function' ? fn(s.currentIndex) : fn })),
  setPage:         (p)  => set({ page: p }),
  setHasMore:      (v)  => set({ hasMore: v }),
  addLiked:        (id) => set((s) => ({ liked: new Set(s.liked).add(id) })),
  addSuperLiked:   (id) => set((s) => ({ superLiked: new Set(s.superLiked).add(id) })),

  reset: () => set({
    profiles: [], currentIndex: 0, page: 1, hasMore: true,
    liked: new Set(), superLiked: new Set(),
  }),
}))