import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TreeNode } from '../models/tree-node.model';
import { environment } from '../../environments/environment';

/**
 * HOW THIS SERVICE WORKS:
 *
 * 1. We send the raw regulatory text to Claude's Messages API
 * 2. The PROMPT is the secret sauce — it tells Claude exactly what structure to return
 * 3. Claude analyzes the text, identifies hierarchy levels (titles, articles, clauses)
 * 4. Claude returns JSON matching our TreeNode interface
 * 5. We parse and validate the response
 *
 * ABOUT THE CLAUDE API:
 * - Endpoint: https://api.anthropic.com/v1/messages
 * - Auth: x-api-key header with your API key
 * - Model: claude-sonnet-4-20250514 (good balance of speed & quality)
 * - We set max_tokens to control response length
 * - We use the "system" message to give Claude its role
 * - We use the "user" message to send the actual text + instructions
 *
 * IMPORTANT: In production, you'd NEVER call the API from the browser.
 * The API key would be exposed. Instead, you'd have a backend proxy.
 * For this portfolio project, we use Angular's proxy config to route
 * requests through the dev server, keeping the key server-side.
 */
@Injectable({
  providedIn: 'root'
})
export class ClaudeApiService {

  // Points to our Express proxy server running on port 3000
  // The proxy adds the API key and forwards to api.anthropic.com
  private readonly apiUrl = 'http://localhost:3000/api/claude';

  /**
   * THE SYSTEM PROMPT:
   * This tells Claude WHO it is and HOW to behave.
   * Think of it as the "personality" or "role" instruction.
   */
  private readonly systemPrompt = `You are a regulatory document parser. Return ONLY valid JSON, no markdown fences, no explanation.`;

  private buildUserPrompt(text: string): string {
    return `Analyze this regulatory/legal text and extract its hierarchical structure.
The text can be in any language — detect the structure regardless of language.

Rules:
- Identify natural hierarchy levels (Parts > Chapters > Sections > Articles > Clauses > Sub-clauses)
- Top level = document or chapter grouping
- Middle levels = articles, sections, or equivalent
- Leaf levels = numbered clauses/paragraphs (1), (2), (a), (b) etc.
- Keep leaf text concise (max 80 chars, add "...")
- Preserve original numbering and language

Return ONLY this JSON structure, nothing else:
{"name":"Document Title","children":[{"name":"Section/Article","children":[{"name":"(1) Clause text..."}]}]}

TEXT:
${text}`;
  }

  constructor(private http: HttpClient) {}

  /**
   * Main method: Send text to Claude API and get back a TreeNode.
   *
   * HOW THE CLAUDE MESSAGES API WORKS:
   * - You send a POST with a JSON body containing:
   *   - model: which Claude model to use
   *   - max_tokens: maximum response length (in tokens, ~4 chars each)
   *   - system: the system prompt (Claude's role)
   *   - messages: array of {role, content} objects (the conversation)
   *
   * - Claude responds with:
   *   - content: array of content blocks (usually one text block)
   *   - We extract content[0].text which is Claude's response
   */
  analyzeText(text: string): Observable<TreeNode> {
    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: this.systemPrompt,
      messages: [
        {
          role: 'user',
          content: this.buildUserPrompt(text)
        }
      ]
    };

    return this.http.post<any>(this.apiUrl, body).pipe(
      map(response => {
        // Claude's response structure:
        // { content: [{ type: "text", text: "..." }], ... }
        const rawText = response.content[0].text;
        return this.parseResponse(rawText);
      })
    );
  }

  /**
   * PARSING THE RESPONSE:
   * Claude should return pure JSON, but sometimes it wraps it in
   * markdown code fences (```json ... ```). We strip those just in case.
   * Then we validate the structure matches our TreeNode interface.
   */
  private parseResponse(rawText: string): TreeNode {
    // Strip markdown code fences if Claude added them
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    const parsed = JSON.parse(cleaned);

    // Validate the basic structure
    if (!parsed.name) {
      throw new Error('Invalid response: missing "name" property');
    }

    return parsed as TreeNode;
  }
}
