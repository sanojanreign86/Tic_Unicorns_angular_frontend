import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Gym } from '../../models/gym.model';
import { GymService } from '../../services/gym.service';

@Component({
  selector: 'app-gym-details',
  imports: [],
  templateUrl: './gym-details.html',
  styleUrl: './gym-details.css',
})
export class GymDetails implements OnInit {

  gym: Gym | null = null;

  gymId: number | null = null;

  isLoading = false;
  isDeleting = false;

  errorMessage = '';

  constructor(
    private readonly gymService: GymService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const gymIdParam =
      this.route.snapshot.paramMap.get('gymId');

    if (!gymIdParam) {
      this.errorMessage = 'Gym ID was not provided.';
      return;
    }

    const gymId = Number(gymIdParam);

    if (Number.isNaN(gymId) || gymId <= 0) {
      this.errorMessage = 'Invalid gym ID.';
      return;
    }

    this.gymId = gymId;

    this.loadGym();
  }

  loadGym(): void {
    if (this.gymId === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.gymService
      .getGymById(this.gymId)
      .subscribe({
        next: (gym: Gym) => {
          this.gym = gym;
          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load gym information. Please try again.';

          this.isLoading = false;
        }
      });
  }

  editGym(): void {
    if (this.gymId === null) {
      return;
    }

    this.router.navigate([
      '/gym/edit',
      this.gymId
    ]);
  }

  deleteGym(): void {
    if (this.gymId === null) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this gym?'
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.gymService
      .deleteGym(this.gymId)
      .subscribe({
        next: () => {
          this.isDeleting = false;

          this.router.navigate(['/gym']);
        },

        error: () => {
          this.isDeleting = false;

          this.errorMessage =
            'Unable to delete gym. Please try again.';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/gym']);
  }
}