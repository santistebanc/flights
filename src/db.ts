import Dexie, { Table } from "dexie";

export interface Place {
  id: string;
  entityId: string;
  parentId: string;
  name: string;
  type: string;
  iata: string;
}

export interface Carrier {
  id: string;
  name: string;
  imageUrl: string;
  iata: string;
}

export interface Segment {
  id: string;
  originPlaceId: string;
  destinationPlaceId: string;
  departureDateTime: Date;
  arrivalDateTime: Date;
  durationInMinutes: number;
  marketingFlightNumber: number;
  marketingCarrierId: string;
}

export interface Leg {
  id: string;
  originPlaceId: string;
  destinationPlaceId: string;
  departureDateTime: Date;
  arrivalDateTime: Date;
  durationInMinutes: number;
  stopCount: number;
  marketingCarrierIds: string[];
  segmentIds: string[];
  price: number;
  deepLink: string;
}

export class MySubClassedDexie extends Dexie {
  places!: Table<Place>;
  carriers!: Table<Carrier>;
  segments!: Table<Segment>;
  legs!: Table<Leg>;

  constructor() {
    super("TourPlannerDB");
    this.version(1).stores({
      places: "&id, name, iata",
      carriers: "&id, name, iata",
      segments:
        "&id, marketingFlightNumber, originPlaceId, destinationPlaceId, departureDateTime, arrivalDateTime",
      legs: "&id, price, originPlaceId, destinationPlaceId, departureDateTime, arrivalDateTime",
    });
  }
}

export const db = new MySubClassedDexie();
