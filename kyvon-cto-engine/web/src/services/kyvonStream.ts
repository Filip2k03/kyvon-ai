export interface StreamMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onToken: (accumulatedText: string, newToken: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export class KyvonStreamService {
  private endpoint = 'https://ctoai.reiwasakura.tech/v1/chat/completions';
  private apiKey: string;
  private abortController: AbortController | null = null;

  constructor(apiKey: string, customEndpoint?: string) {
    this.apiKey = apiKey;
    if (customEndpoint) this.endpoint = customEndpoint;
  }

  public abortCurrentStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  public async streamCompletion(
    messages: StreamMessage[],
    callbacks: StreamCallbacks,
    model = 'ctoai-core',
    temperature = 0.2
  ): Promise<void> {
    this.abortCurrentStream();
    this.abortController = new AbortController();

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          stream: true,
          max_tokens: 4096
        }),
        signal: this.abortController.signal
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') {
            callbacks.onComplete(accumulatedText);
            return;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const token = json.choices?.[0]?.delta?.content || '';
              if (token) {
                accumulatedText += token;
                callbacks.onToken(accumulatedText, token);
              }
            } catch {
              // Ignore partial JSON chunks during transport
            }
          }
        }
      }

      callbacks.onComplete(accumulatedText);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      callbacks.onError(err);
    } finally {
      this.abortController = null;
    }
  }
}
