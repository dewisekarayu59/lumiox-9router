export type AIProvider = 'gemini' | 'groq' | 'openrouter'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  maxTokens: number
  contextWindow: number
  inputPrice: number
  outputPrice: number
  supportsStreaming: boolean
  supportsImages: boolean
}

export interface ProviderConfig {
  id: AIProvider
  name: string
  apiKey: string
  baseUrl?: string
  models: AIModel[]
  enabled: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  provider?: AIProvider
  model?: string
  createdAt: string
  updatedAt?: string
  tokenUsage?: TokenUsage
  isBookmarked?: boolean
  isFavorite?: boolean
  reasoning?: string
  attachments?: Attachment[]
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  preview?: string
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  provider: AIProvider
  model: string
  createdAt: string
  updatedAt: string
  isPinned?: boolean
  isArchived?: boolean
  isFavorite?: boolean
  folderId?: string
  totalTokens?: number
  totalCost?: number
}

export interface ChatFolder {
  id: string
  name: string
  color: string
  createdAt: string
  chatIds: string[]
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  defaultProvider: AIProvider
  defaultModel: string
  temperature: number
  topP: number
  maxTokens: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt: string
  enableStreaming: boolean
  enableMemory: boolean
  notifications: boolean
}

export interface DashboardStats {
  totalChats: number
  totalTokens: number
  totalRequests: number
  estimatedCost: number
  topProvider: AIProvider
  topModel: string
  usageByDate: { date: string; tokens: number; requests: number }[]
  usageByProvider: { provider: AIProvider; count: number }[]
  usageByModel: { model: string; count: number }[]
}

export interface StreamEvent {
  type: 'text' | 'thinking' | 'done' | 'error'
  content?: string
  usage?: TokenUsage
  finishReason?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  stats: {
    totalChats: number
    totalTokens: number
    joinDate: string
  }
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message?: string
  duration?: number
}
