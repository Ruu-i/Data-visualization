import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss'
})
export class TextInputComponent {
  @Output() submitText = new EventEmitter<string>();

  regulatoryText = '';
  isLoading = false;

  readonly placeholder = `Paste regulatory text here...

Example:
Article 1 [Human dignity – Human rights]
(1) Human dignity shall be inviolable. To respect and protect it shall be the duty of all state authority.
(2) The German people therefore acknowledge inviolable and inalienable human rights...

Article 2 [Personal freedoms]
(1) Every person shall have the right to free development of his personality...`;

  onSubmit(): void {
    const text = this.regulatoryText.trim();
    if (!text) return;
    this.isLoading = true;
    this.submitText.emit(text);
  }

  onClear(): void {
    this.regulatoryText = '';
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }
}
