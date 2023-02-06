import axios from "axios";
import { CORS_PROXY_URL } from "./constants";
import { Place, db } from "./db";
import { omit } from "./utils";

interface AutoSuggestQuery {
  market: string;
  locale: string;
  searchTerm: string;
  includedEntityTypes: ("PLACE_TYPE_CITY" | "PLACE_TYPE_AIRPORT")[];
}

export interface Suggestion extends Place {
  highlighting: [number, number][];
}

export async function suggestPlaces(query: AutoSuggestQuery) {
  const options = {
    method: "POST",
    url:
      CORS_PROXY_URL +
      "https://partners.api.skyscanner.net/apiservices/v3/autosuggest/flights",
    data: JSON.stringify({ query }),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "x-api-key": "prtl6749387986743898559646983194",
    },
  };
  const data: any = await axios
    .request(options)
    .then((res) => {
      if (res.status === 429) throw res.statusText;
      return res.data;
    })
    .catch((err) => console.log(err));

  const suggestions: Suggestion[] = data.places.map((place: any) => ({
    entityId: place.entityId,
    iata: place.iataCode,
    parentId: place.parentId,
    name: place.name,
    type: place.type,
    highlighting: place.highlighting,
  }));

  const newPlaces = suggestions.map((place) => omit(place, "highlighting"));

  await db.places.bulkPut(newPlaces);

  return suggestions;
}
