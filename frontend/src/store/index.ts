'use client'

import { create } from 'zustand'

interface ProjectState {
  projectId: string | null
  currentStage: number
  setProjectId: (id: string) => void
  setCurrentStage: (stage: number) => void
  reset: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectId: null,
  currentStage: 1,
  setProjectId: (id) => set({ projectId: id }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  reset: () => set({ projectId: null, currentStage: 1 })
}))

interface BlueprintState {
  blueprint: {
    coreIdea: string
    genre: string
    toneMood: string
    wordCount: number
    languageStyle: string
    narration: string
    sceneCount: number
    characters: string[]
    customPrompt: string
    selectedModel: string
  } | null
  setBlueprintField: (field: string, value: any) => void
  setBlueprintData: (data: any) => void
  reset: () => void
}

export const useBlueprintStore = create<BlueprintState>((set) => ({
  blueprint: null,
  setBlueprintField: (field, value) =>
    set((state) => ({
      blueprint: state.blueprint ? { ...state.blueprint, [field]: value } : null
    })),
  setBlueprintData: (data) => set({ blueprint: data }),
  reset: () => set({ blueprint: null })
}))
