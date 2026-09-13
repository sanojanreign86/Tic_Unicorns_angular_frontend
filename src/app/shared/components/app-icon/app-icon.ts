import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './app-icon.html',
  styleUrl: './app-icon.css'
})
export class AppIconComponent {
  @Input({ required: true }) name = 'circle';
  @Input() size = 18;
  @Input() strokeWidth = 1.9;
}
