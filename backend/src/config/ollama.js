const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function generateWithOllama({ model, prompt, system = '' }) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with ${response.status}`);
    }

    const payload = await response.json();
    return payload.response || '';
  } catch (error) {
    return null;
  }
}

module.exports = { generateWithOllama };
