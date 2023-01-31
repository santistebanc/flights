import axios from "axios";
import { CORS_PROXY_URL } from "./constants";

interface AutoSuggestQuery {
  market: string;
  locale: string;
  searchTerm: string;
  includedEntityTypes: ("PLACE_TYPE_CITY" | "PLACE_TYPE_AIRPORT")[];
}

//TODO: save Places from suggestions to db

export interface Suggestion {
  entityId: string;
  iata: string;
  parentId: string;
  name: string;
  type: string;
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

  const places: Suggestion[] = data.places.map((place: any) => ({
    entityId: place.entityId,
    iata: place.iataCod,
    parentId: place.parentId,
    name: place.name,
    type: place.type,
    highlighting: place.highlighting,
  }));

  return places;
}
