import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TreeNode } from '../models/tree-node.model';
import { environment } from '../../environments/environment';

/**
 * HOW THIS SERVICE WORKS:
 *
 * 1. We send the raw regulatory text to Claude's Messages API
 * 2. The PROMPT — it tells Claude exactly what structure to return
 * 3. Claude analyzes the text, identifies hierarchy levels (titles, articles, clauses)
 * 4. Claude returns JSON matching our TreeNode interface
 * 5. We parse and validate the response
 */
@Injectable({
  providedIn: 'root'
})
export class ClaudeApiService {

  private readonly apiUrl = 'http://localhost:3000/api/claude';

  /**
   * THE SYSTEM PROMPT:
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
- Keep the FULL text of each clause — do NOT truncate or abbreviate
- Preserve original numbering and language

Return ONLY this JSON structure, nothing else:
{"name":"Document Title","children":[{"name":"Section/Article","children":[{"name":"(1) Full clause text here"}]}]}

TEXT:
${text}`;
  }

  constructor(private http: HttpClient) {}

  /**
   * Main method: Send text to Claude API and get back a TreeNode.
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
        const rawText = response.content[0].text;
        return this.parseResponse(rawText);
      })
    );
  }

  private parseResponse(rawText: string): TreeNode {
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
