import { create } from 'zustand'
import type { CatalogoItem } from '@/types/catalogo'

interface CatalogosStore {
  catalogos: CatalogoItem[]
  loading: boolean
  setCatalogos: (c: CatalogoItem[]) => void
  setLoading: (v: boolean) => void
}

export const useCatalogosStore = create<CatalogosStore>((set) => ({
  catalogos: [],
  loading: false,
  setCatalogos: (catalogos) => set({ catalogos }),
  setLoading: (loading) => set({ loading }),
}))
