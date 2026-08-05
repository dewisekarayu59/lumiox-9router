import type { AIProvider, AIModel } from '@/lib/types'
import { BaseAIProvider, type ProviderInfo, PROVIDER_INFO } from './base'
import { GeminiProvider } from './gemini'
import { GroqProvider } from './groq'
import { OpenRouterProvider } from './openrouter'

class ProviderRegistry {
  private providers: Map<AIProvider, BaseAIProvider> = new Map()

  register(provider: BaseAIProvider): void {
    this.providers.set(provider.id, provider)
  }

  get(id: AIProvider): BaseAIProvider | undefined {
    return this.providers.get(id)
  }

  getAll(): BaseAIProvider[] {
    return Array.from(this.providers.values())
  }

  getModels(providerId: AIProvider): AIModel[] {
    return this.providers.get(providerId)?.models || []
  }

  getModel(providerId: AIProvider, modelId: string): AIModel | undefined {
    return this.providers.get(providerId)?.getModel(modelId)
  }

  getFirstModel(providerId: AIProvider): AIModel | undefined {
    return this.providers.get(providerId)?.getFirstModel()
  }

  getProviderInfo(): ProviderInfo[] {
    return this.getAll().map(p => PROVIDER_INFO[p.id])
  }
}

export const providerRegistry = new ProviderRegistry()

providerRegistry.register(new GeminiProvider(''))
providerRegistry.register(new GroqProvider(''))
providerRegistry.register(new OpenRouterProvider(''))

export function getProvider(id: AIProvider): BaseAIProvider | undefined {
  return providerRegistry.get(id)
}

export function getModelsForProvider(id: AIProvider): AIModel[] {
  return providerRegistry.getModels(id)
}

export function getModelInfo(providerId: AIProvider, modelId: string): AIModel | undefined {
  return providerRegistry.getModel(providerId, modelId)
}

export { PROVIDER_INFO }
