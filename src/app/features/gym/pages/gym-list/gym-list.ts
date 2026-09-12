import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Gym } from '../../models/gym.model';
import { GymService } from '../../services/gym.service';

@Component({
  selector: 'app-gym-list',
  imports: [],
  templateUrl: './gym-list.html',
  styleUrl: './gym-list.css',
})
export class GymList implements OnInit {

  gyms: Gym[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly gymService: GymService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadGyms();
  }

  loadGyms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.gymService.getAllGyms().subscribe({
      next: (gyms: Gym[]) => {
        this.gyms = gyms;
        this.isLoading = false;
      },

      error: () => {
        this.errorMessage =
          'Unable to load gym information. Please try again.';

        this.isLoading = false;
      }
    });
  }

  addGym(): void {
    this.router.navigate(['/gym/create']);
  }

  viewGym(gymId: number): void {
    this.router.navigate(['/gym', gymId]);
  }

  editGym(gymId: number): void {
    this.router.navigate(['/gym/edit', gymId]);
  }
}