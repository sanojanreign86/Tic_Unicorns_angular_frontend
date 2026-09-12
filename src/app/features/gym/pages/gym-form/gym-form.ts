import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Gym,
  CreateGymRequest,
  UpdateGymRequest
} from '../../models/gym.model';

import { GymService } from '../../services/gym.service';

@Component({
  selector: 'app-gym-form',
  imports: [ReactiveFormsModule],
  templateUrl: './gym-form.html',
  styleUrl: './gym-form.css',
})
export class GymForm implements OnInit {

  isEditMode = false;
  isLoading = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  gymId: number | null = null;

  gymForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly gymService: GymService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.gymForm = this.formBuilder.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      location: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      capacity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(500)
        ]
      ]
    });
  }

  ngOnInit(): void {
    const gymIdParam =
      this.route.snapshot.paramMap.get('gymId');

    if (gymIdParam) {
      const gymId = Number(gymIdParam);

      if (!Number.isNaN(gymId) && gymId > 0) {
        this.gymId = gymId;
        this.isEditMode = true;

        this.loadGym();
      }
    }
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
          this.gymForm.patchValue({
            name: gym.name,
            location: gym.location,
            capacity: gym.capacity,
            description: gym.description
          });

          this.isLoading = false;
        },

        error: () => {
          this.errorMessage =
            'Unable to load gym information. Please try again.';

          this.isLoading = false;
        }
      });
  }

  saveGym(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.gymForm.invalid) {
      this.gymForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.gymForm.getRawValue();

    if (this.isEditMode && this.gymId !== null) {

      const request: UpdateGymRequest = {
        name: formValue.name,
        location: formValue.location,
        capacity: formValue.capacity,
        description: formValue.description
      };

      this.gymService
        .updateGym(this.gymId, request)
        .subscribe({
          next: () => {
            this.isSubmitting = false;

            this.successMessage =
              'Gym updated successfully.';
          },

          error: () => {
            this.isSubmitting = false;

            this.errorMessage =
              'Unable to update gym. Please try again.';
          }
        });

    } else {

      const request: CreateGymRequest = {
        name: formValue.name,
        location: formValue.location,
        capacity: formValue.capacity,
        description: formValue.description
      };

      this.gymService
        .createGym(request)
        .subscribe({
          next: () => {
            this.isSubmitting = false;

            this.successMessage =
              'Gym created successfully.';

            this.gymForm.reset({
              name: '',
              location: '',
              capacity: 1,
              description: ''
            });
          },

          error: () => {
            this.isSubmitting = false;

            this.errorMessage =
              'Unable to create gym. Please try again.';
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/gym']);
  }
}