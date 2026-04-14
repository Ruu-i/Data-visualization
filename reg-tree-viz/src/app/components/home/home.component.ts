import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TextInputComponent } from '../text-input/text-input.component';
import { TreeVisualizationComponent } from '../tree-visualization/tree-visualization.component';
import { TreeNode } from '../../models/tree-node.model';
import { ClaudeApiService } from '../../services/claude-api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TextInputComponent, TreeVisualizationComponent, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @ViewChild(TextInputComponent) textInput!: TextInputComponent;

  treeData!: TreeNode;
  errorMessage = '';
  hasResult = false;

  constructor(private claudeApi: ClaudeApiService, private cdr: ChangeDetectorRef) {}

  onTextSubmitted(text: string): void {
    this.errorMessage = '';

    this.claudeApi.analyzeText(text).subscribe({
      next: (treeData: TreeNode) => {
        this.treeData = { ...treeData };
        this.hasResult = true;
        this.textInput.setLoading(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Claude API error:', err);
        this.errorMessage = err.status === 401
          ? 'Invalid API key. Set CLAUDE_API_KEY environment variable and restart the server.'
          : err.status === 429
          ? 'Rate limit exceeded. Wait a moment and try again.'
          : `Error: ${err.message || 'Failed to analyze text. Check the console for details.'}`;
        this.textInput.setLoading(false);
        this.cdr.detectChanges();
      }
    });
  }

  exportJson(): void {
    const json = JSON.stringify(this.treeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.treeData.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
