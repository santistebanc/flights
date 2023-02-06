import Dexie, { Table } from "dexie";

export interface Place {
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

export interface ApiRequests {
  id?: number;
  date: Date;
  endpoint: string;
  type: "create" | "poll";
  query: string;
  status: number;
}

export interface Log {
  id?: number;
  date: Date;
  type: "api_request" | "db_dump" | "ui_event";
  message: string;
  meta?: Record<string, any>;
}

export class MySubClassedDexie extends Dexie {
  places!: Table<Place>;
  carriers!: Table<Carrier>;
  segments!: Table<Segment>;
  legs!: Table<Leg>;
  api_requests!: Table<ApiRequests>;
  log!: Table<Log>;

  constructor() {
    super("TourPlannerDB");
    this.version(1).stores({
      places: "&entityId, name, iata",
      carriers: "&id, name, iata",
      segments:
        "&id, marketingFlightNumber, originPlaceId, destinationPlaceId, departureDateTime, arrivalDateTime",
      legs: "&id, price, originPlaceId, destinationPlaceId, departureDateTime, arrivalDateTime",
      api_requests: "++id, date, [endpoint+type+query+status]",
      log: "++id, date, type",
    });
  }
}

export const db = new MySubClassedDexie();
