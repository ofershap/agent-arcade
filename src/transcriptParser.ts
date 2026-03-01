export type AgentActivityType = 'idle' | 'typing' | 'reading' | 'running' | 'editing' | 'searching' | 'celebrating';

export interface ParsedStatus {
  activity: AgentActivityType;
  statusText: string | null;
}

export function inferActivityFromText(text: string): ParsedStatus | null {
  const t = text.toLowerCase();

  if (/\b(read|reading|check|look at|inspect|examin)\b/.test(t) && /\b(file|code|content|config|package|module)\b/.test(t)) {
    return { activity: 'reading', statusText: extractTarget(text, 'Reading') };
  }
  if (/\b(search|grep|find|glob|looking for|scan)\b/.test(t)) {
    return { activity: 'searching', statusText: extractTarget(text, 'Searching') };
  }
  if (/\b(run |running|execute|\$ |shell|terminal|npm |git |install|build|test)\b/.test(t)) {
    return { activity: 'running', statusText: extractTarget(text, 'Running') };
  }
  if (/\b(edit|updat|replac|modif|fix|chang|rewrit|add .* to|creat)\b/.test(t) && /\b(file|code|function|component|line|class)\b/.test(t)) {
    return { activity: 'editing', statusText: extractTarget(text, 'Editing') };
  }
  if (/\b(web|fetch|url|browse|http)\b/.test(t)) {
    return { activity: 'reading', statusText: 'Fetching web content...' };
  }
  if (/\b(let me|i'll|going to|need to|now)\b/.test(t)) {
    return { activity: 'typing', statusText: 'Working...' };
  }

  return null;
}

function extractTarget(text: string, prefix: string): string {
  const fileMatch = text.match(/[`"]([^`"]+\.\w{1,5})[`"]/);
  if (fileMatch) return `${prefix} ${fileMatch[1]}...`;

  const backtickMatch = text.match(/`([^`]+)`/);
  if (backtickMatch && backtickMatch[1]!.length < 40) return `${prefix} ${backtickMatch[1]}...`;

  return `${prefix}...`;
}

export function parseTranscriptLine(line: string): ParsedStatus | null {
  try {
    const record = JSON.parse(line);

    const type = record.type || record.role;
    if (!type) return null;

    if (type === 'assistant') {
      const text = typeof record.message === 'string'
        ? record.message
        : record.content?.[0]?.text || record.text || '';

      if (!text || text.length > 500) return null;
      return inferActivityFromText(text);
    }

    return null;
  } catch {
    return null;
  }
}
