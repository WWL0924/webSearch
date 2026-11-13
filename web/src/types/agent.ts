import type { AgentStreamEvent } from '../../../shared/types/agent'

export type eventsType = {
  step: 0 | 1 | 2 | 3 | 4,
  type: NonNullable<AgentStreamEvent['type']>,
  toolCall: string[],
  content: string,
  code?: string,
  retryable?: boolean,
  report?: {
    mdUrl: string,
    mapUrl: string | null,
  }
}
