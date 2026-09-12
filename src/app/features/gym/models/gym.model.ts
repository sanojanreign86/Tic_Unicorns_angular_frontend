export interface Gym {
  gymId: number;
  name: string;
  location: string;
  capacity: number;
  description: string;
  isActive: boolean;
}

export interface CreateGymRequest {
  name: string;
  location: string;
  capacity: number;
  description: string;
}

export interface UpdateGymRequest {
  name: string;
  location: string;
  capacity: number;
  description: string;
}