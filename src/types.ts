/**
 * List of standard hub location points in Kano for interactive routing simulations.
 */
export interface KanoHub {
  id: string;
  name: string;
  type: string;
  x: number; // custom canvas/svg grid coordinates
  y: number;
}

export interface RouteOption {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  unoptimizedMinutes: number;
  optimizedMinutes: number;
  stopsCount: number;
  cargoType: string;
}

export interface FleetVehicle {
  id: string;
  name: string;
  type: 'tricycle' | 'van' | 'truck';
  capacityKg: number;
  costPerKm: number;
  emissionsFactor: number;
}
