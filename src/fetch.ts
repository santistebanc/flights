import { db } from "./db";
import axios from "axios";
import { CORS_PROXY_URL } from "./constants";
import { DateObject, fromDateTimeObject } from "./utils";

export type QueryPlace = { iata: string } | { entityId: string };

export type QueryLeg = {
  date: DateObject;
  originPlaceId: QueryPlace;
  destinationPlaceId: QueryPlace;
};

export type FlightsQuery = {
  adults: number;
  market: string;
  locale: string;
  currency: string;
  cabinClass: string;
  queryLegs: QueryLeg[];
};

function dumpFlightData(data: any) {
  const { carriers, places, legs, segments, itineraries } =
    data.content.results;

  const parsedCarriers = Object.entries(carriers).map(([id, data]) => {
    const { name, iata, imageUrl }: any = data;
    return { id, name, iata, imageUrl };
  });
  const parsedPlaces = Object.entries(places).map(([id, data]) => {
    const { entityId, iata, name, parentId, type }: any = data;
    return { id, entityId, iata, name, parentId, type };
  });

  const prices: any = {};
  const links: any = {};
  Object.entries(itineraries).forEach(([id, data]) => {
    const { legIds, pricingOptions }: any = data;
    prices[legIds[0]] = Number(pricingOptions[0].price.amount) / 1000;
    links[legIds[0]] = pricingOptions[0].items[0].deepLink;
  });
  const parsedLegs = Object.entries(legs).map(([id, data]) => {
    const {
      originPlaceId,
      destinationPlaceId,
      departureDateTime,
      arrivalDateTime,
      durationInMinutes,
      stopCount,
      marketingCarrierIds,
      segmentIds,
    }: any = data;

    return {
      id,
      originPlaceId,
      destinationPlaceId,
      departureDateTime: fromDateTimeObject(departureDateTime),
      arrivalDateTime: fromDateTimeObject(arrivalDateTime),
      durationInMinutes,
      stopCount,
      marketingCarrierIds,
      segmentIds,
      price: prices[id],
      deepLink: links[id],
    };
  });
  const parsedSegments = Object.entries(segments).map(([id, data]) => {
    const {
      originPlaceId,
      destinationPlaceId,
      departureDateTime,
      arrivalDateTime,
      durationInMinutes,
      marketingFlightNumber,
      marketingCarrierId,
    }: any = data;

    return {
      id,
      originPlaceId,
      destinationPlaceId,
      departureDateTime: fromDateTimeObject(departureDateTime),
      arrivalDateTime: fromDateTimeObject(arrivalDateTime),
      durationInMinutes,
      marketingFlightNumber,
      marketingCarrierId,
    };
  });

  db.places.bulkPut(parsedPlaces);
  db.carriers.bulkPut(parsedCarriers);
  db.segments.bulkPut(parsedSegments);
  db.legs.bulkPut(parsedLegs);
}

export async function getFlights(query: FlightsQuery) {
  const options = (sessionToken?: string) => ({
    method: "POST",
    url:
      CORS_PROXY_URL +
      ("https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/" +
        (sessionToken ? "poll/" + sessionToken : "create")),
    data: JSON.stringify({ query }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-api-key": "prtl6749387986743898559646983194",
    },
  });
  const initData: any = await axios
    .request(options())
    .then((res) => {
      if (res.status === 429) throw res.statusText;
      return res.data;
    })
    .catch((err) => console.log(err));

  dumpFlightData(initData);

  const poll = async () => {
    const data: any = await axios
      .request(options(initData.sessionToken))
      .then((res) => res.data)
      .catch((err) => console.log(err));

    dumpFlightData(data);

    return data.status;
  };

  let times = 0;
  let status;
  do {
    times++;
    status = await poll();
  } while (times < 5 && status === "RESULT_STATUS_INCOMPLETE");
}
