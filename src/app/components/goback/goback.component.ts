import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  templateUrl: './goback.component.html',
  styleUrls: ['./goback.component.scss'],
  standalone: true,
})
export class gobackComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}

