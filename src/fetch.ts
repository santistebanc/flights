import { db } from "./db";
import axios from "axios";
import { CORS_PROXY_URL } from "./constants";
import { DateObject, fromDateTimeObject } from "./utils";
import Bottleneck from "bottleneck";

const isRecent = (date?: Date) =>
  date && Date.now() - date?.getTime() < 3 * 24 * 3600 * 1000;

export const flightsCreateLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: (60 * 1000) / 50,
});

export const flightsPollLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: (60 * 1000) / 250,
});

export type FlightsFetchType = "create" | "poll";

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

function dumpFlightData(data?: any) {
  if (!data) return;
  const { carriers, places, legs, segments, itineraries } =
    data.content.results;

  const parsedCarriers = Object.entries(carriers).map(([id, data]) => {
    const { name, iata, imageUrl }: any = data;
    return { id, name, iata, imageUrl };
  });
  const parsedPlaces = Object.entries(places).map(([id, data]) => {
    const { entityId, iata, name, parentId, type }: any = data;
    return { entityId, iata, name, parentId, type };
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

const options = (query: FlightsQuery, sessionToken?: string) => ({
  method: "POST",
  mode: "no-cors",
  url:
    CORS_PROXY_URL +
    ("https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/" +
      (sessionToken ? "poll/" + sessionToken : "create")),
  data: JSON.stringify({ query }),
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/x-www-form-urlencoded",
    "x-api-key": "prtl6749387986743898559646983194",
  },
});

async function doFetch(
  query: FlightsQuery,
  type: FlightsFetchType,
  onFail: (res: any) => void,
  sessionToken?: string
) {
  console.log(
    "fetching",
    query.queryLegs[0].date,
    query.queryLegs[0].originPlaceId,
    query.queryLegs[0].destinationPlaceId
  );
  const date = new Date();
  return await axios
    .request(options(query, sessionToken))
    .then((res) => {
      db.api_requests.add({
        date,
        endpoint: "flights",
        type,
        query: JSON.stringify({ query }),
        status: res.status,
      });
      return res;
    })
    .catch((err) => {
      console.log(err);
      if (err.response.status === 429) onFail(err);
    });
}

async function fetchFlightsPoll(
  onFail: (res: any) => void,
  query: FlightsQuery,
  sessionToken: string
) {
  const lastFetch = (
    await db.api_requests.get({
      endpoint: "flights",
      type: "poll",
      query: JSON.stringify({ query }),
      status: 200,
    })
  )?.date;

  if (isRecent(lastFetch)) {
    console.log("request already made");
    return;
  }

  return flightsPollLimiter.schedule(async () => {
    const res = await doFetch(query, "poll", onFail, sessionToken);
    dumpFlightData(res?.data);
    return res;
  });
}

export async function getFlights(
  query: FlightsQuery,
  onFail: (res: any) => void
) {
  const lastFetch = (
    await db.api_requests.get({
      endpoint: "flights",
      type: "create",
      query: JSON.stringify({ query }),
      status: 200,
    })
  )?.date;

  if (isRecent(lastFetch)) {
    console.log("request already made");
    return;
  }

  await flightsCreateLimiter.schedule(async () => {
    const createRes = await doFetch(query, "create", onFail);

    if (!createRes) return;

    dumpFlightData(createRes.data);

    const retry = async (times = 0) => {
      console.log("retried", times);
      if (times > 5) return;
      const res = await fetchFlightsPoll(
        onFail,
        query,
        createRes.data.sessionToken
      );
      const dataStatus = res?.data.status;
      if (dataStatus === "RESULT_STATUS_INCOMPLETE") {
        setTimeout(async () => {
          retry(times + 1);
        }, 200);
      }
    };

    if (createRes.data.sessionToken) retry();
  });
}
