import { text } from 'node:stream/consumers';

export class PromptBuilder {
  private system = '';
  private context: string[] = [];
  private question = '';

  withSystem(text: string): this {
    this.system = text;
    return this;
  }

  withContext(chunks: string[]): this {
    this.context = chunks;
    return this;
  }

  withQuestion(q: string): this {
    this.question = q;
    return this;
  }

  build(): string {
    if (!this.question) {
      throw new Error('Question must be provided.');
    }

    return `${this.system}
    
  Context:
  ${this.context.join('\n\n')}

  Question: ${this.question}`;
  }
}