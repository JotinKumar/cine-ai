import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Projects
  async createProject(userId: string, name: string) {
    return this.client.post('/api/projects', { userId, name })
  }

  async getProject(id: string) {
    return this.client.get(`/api/projects/${id}`)
  }

  async getUserProjects(userId: string) {
    return this.client.get(`/api/projects/user/${userId}`)
  }

  async updateProject(id: string, data: any) {
    return this.client.put(`/api/projects/${id}`, data)
  }

  async deleteProject(id: string) {
    return this.client.delete(`/api/projects/${id}`)
  }

  // Stage 1: Story Generation
  async generateStory(projectId: string, blueprint: any, apiKey: string) {
    return this.client.post('/api/stage1/story-generation', {
      projectId,
      ...blueprint,
      apiKey
    })
  }

  async getStory(projectId: string) {
    return this.client.get(`/api/stage1/story/${projectId}`)
  }

  // Stage 2: Story Editing
  async editStory(projectId: string, editData: any, apiKey: string) {
    return this.client.post('/api/stage2/story-editing', {
      projectId,
      ...editData,
      apiKey
    })
  }

  // Stage 3: Scene Generation
  async generateScenes(projectId: string, apiKey: string) {
    return this.client.post('/api/stage3/scene-generation', {
      projectId,
      apiKey
    })
  }

  // Stage 4: Image Generation
  async generateImages(projectId: string, apiKey: string) {
    return this.client.post('/api/stage4/image-prompt-assembly', {
      projectId,
      apiKey
    })
  }

  // Stage 5: Video Rendering
  async renderVideo(projectId: string, apiKey: string) {
    return this.client.post('/api/stage5/render-video', {
      projectId,
      apiKey
    })
  }
}

export const apiClient = new ApiClient()
