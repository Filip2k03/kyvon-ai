import { html, render } from 'lit-html';
import { marked } from 'marked';
import katex from 'katex';
import XRegExp from 'xregexp';
import debounce from 'lodash-es/debounce';
import { KyvonStreamService, StreamMessage } from './services/kyvonStream';

interface ChatItem {
  id: string;
  sender: 'ai' | 'user';
  timestamp: string;
  content: string;
  confidence?: number;
}

class CareChatApp {
  private streamService: KyvonStreamService;
  private conversation: StreamMessage[] = [
    {
      role: 'system',
      content: 'Identity: KYVON Care & Engineering Intelligence. Output mathematically rigorous, clean, structured medical/system diagnostics with LaTeX formatting.'
    }
  ];
  private uiMessages: ChatItem[] = [
    {
      id: 'msg-init',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '⚡ **KYVON Care Engine Connected**. Real-time SSE streaming ready on `ctoai.reiwasakura.tech`. Enter patient biometrics or architecture parameters.'
    }
  ];
  private isStreaming = false;

  constructor() {
    // Uses bearer key stored in localStorage or fallback
    const key = localStorage.getItem('KYVON_API_KEY') || '';
    this.streamService = new KyvonStreamService(key);
    this.render();
  }

  private formatContent(text: string): string {
    const mathPattern = XRegExp('\\$\\$([\\s\\S]+?)\\$\\$|\\$([^$]+)\\$', 'g');
    const processed = text.replace(mathPattern, (_, blockMath, inlineMath) => {
      const math = blockMath || inlineMath;
      try {
        return katex.renderToString(math, {
          displayMode: !!blockMath,
          throwOnError: false
        });
      } catch {
        return math;
      }
    });
    return marked.parse(processed) as string;
  }

  private scrollBottom = debounce(() => {
    const el = document.getElementById('chat-stream');
    if (el) el.scrollTop = el.scrollHeight;
  }, 20);

  private handleSend = async (userText: string) => {
    if (!userText.trim() || this.isStreaming) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.uiMessages.push({
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: time,
      content: userText
    });
    this.conversation.push({ role: 'user', content: userText });

    const aiMsgId = `ai-${Date.now()}`;
    const aiItem: ChatItem = {
      id: aiMsgId,
      sender: 'ai',
      timestamp: time,
      content: ''
    };
    this.uiMessages.push(aiItem);
    this.isStreaming = true;
    this.render();

    await this.streamService.streamCompletion(this.conversation, {
      onToken: (full) => {
        aiItem.content = full;
        this.render();
        this.scrollBottom();
      },
      onComplete: (finalText) => {
        aiItem.content = finalText;
        this.conversation.push({ role: 'assistant', content: finalText });
        this.isStreaming = false;
        this.render();
      },
      onError: (err) => {
        aiItem.content = `⚠️ **Stream Interrupt**: ${err.message}`;
        this.isStreaming = false;
        this.render();
      }
    });
  };

  public render() {
    const app = document.getElementById('app');
    if (!app) return;

    render(
      html`
        <div class="h-screen w-screen flex flex-col bg-cool-50 text-cool-900 font-sans antialiased overflow-hidden">
          <header class="h-14 px-6 bg-white/80 backdrop-blur border-b border-cool-200/70 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="h-2.5 w-2.5 rounded-full ${this.isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}"></span>
              <span class="text-xs font-semibold text-cool-900 tracking-wide font-mono">ctoai.reiwasakura.tech // SSE ACTIVE</span>
            </div>
            <button 
              @click="${() => {
                const k = prompt('Update Bearer Token:', localStorage.getItem('KYVON_API_KEY') || '');
                if (k) { localStorage.setItem('KYVON_API_KEY', k); location.reload(); }
              }}"
              class="text-[11px] px-2.5 py-1 rounded bg-cool-100 border border-cool-200 hover:bg-cool-200 transition font-mono">
              Configure Key
            </button>
          </header>

          <main id="chat-stream" class="flex-1 overflow-y-auto px-4 md:px-16 py-6 space-y-5">
            ${this.uiMessages.map(
              (m) => html`
                <div class="flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} max-w-3xl mx-auto">
                  <span class="text-[10px] text-cool-400 font-mono mb-1">${m.sender.toUpperCase()} • ${m.timestamp}</span>
                  <div class="p-4 rounded-2xl shadow-sm border ${m.sender === 'user' ? 'bg-cool-900 text-white border-transparent' : 'bg-white text-cool-900 border-cool-200/80'}">
                    <div class="prose prose-sm max-w-none ${m.sender === 'user' ? 'text-white' : 'text-cool-900'}" .innerHTML="${this.formatContent(m.content)}"></div>
                  </div>
                </div>
              `
            )}
          </main>

          <footer class="p-4 bg-white/70 backdrop-blur border-t border-cool-200/60">
            <div class="max-w-3xl mx-auto flex items-center gap-2">
              <input
                id="chat-in"
                type="text"
                placeholder="Ask KYVON..."
                ?disabled="${this.isStreaming}"
                class="flex-1 px-4 py-2.5 text-sm bg-cool-50 border border-cool-200 rounded-xl focus:outline-none focus:border-cool-400"
                @keydown="${(e: KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    const el = e.currentTarget as HTMLInputElement;
                    this.handleSend(el.value);
                    el.value = '';
                  }
                }}"
              />
              <button
                @click="${() => {
                  const el = document.getElementById('chat-in') as HTMLInputElement;
                  if (el) { this.handleSend(el.value); el.value = ''; }
                }}"
                class="px-4 py-2.5 bg-cool-900 text-white rounded-xl text-xs font-semibold hover:bg-cool-800 transition">
                Send
              </button>
            </div>
          </footer>
        </div>
      `,
      app
    );
  }
}

new CareChatApp();
