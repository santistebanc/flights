import dayjs from "dayjs";
import { useStore } from "effector-react";
import { DateRange } from "react-day-picker";
import { Place } from "./db";
import { flightsCreateLimiter, flightsPollLimiter, getFlights } from "./fetch";
import { $homeCity, $visitCities } from "./tour_cities";
import { $defaultDateRange } from "./tour_defaults";
import { getCombinations, toDateObject } from "./utils";
import toast, { Toaster } from "react-hot-toast";

async function fetchFlights(date: Date, origin: Place, destination: Place) {
  console.log("FETCHING: ", date.toDateString(), origin.name, destination.name);

  return await getFlights(
    {
      adults: 1,
      currency: "MXN",
      locale: "en-US",
      market: "MX",
      cabinClass: "CABIN_CLASS_ECONOMY",
      queryLegs: [
        {
          date: toDateObject(date),
          originPlaceId: { entityId: origin.entityId },
          destinationPlaceId: { entityId: destination.entityId },
        },
      ],
    },
    () => {
      console.log("API LIMIT REACHED");
      toast("API LIMIT REACHED");
      flightsCreateLimiter.stop();
      flightsPollLimiter.stop();
    }
  );
}

function startTourFetch(
  home: Place,
  visitCities: Place[],
  dateRange: DateRange
) {
  if (!dateRange.from) return;

  for (
    let d = dateRange.from;
    d <= (dateRange.to ?? dateRange.from);
    d = dayjs(d).add({ day: 1 }).toDate()
  ) {
    getCombinations([home, ...visitCities]).forEach(([origin, destination]) => {
      fetchFlights(d, origin, destination);
    });
  }
}

export default function FetchTour() {
  const homeCityArray = useStore($homeCity);
  const visitCities = useStore($visitCities);
  const dateRange = useStore($defaultDateRange);

  const topCity = visitCities.at(0);
  const homeCity = homeCityArray.at(0);

  const handleClickFetch = () => {
    if (!homeCity || !topCity || !dateRange.from) return;
    startTourFetch(homeCity, visitCities, dateRange);
  };

  return (
    <div>
      <button
        onClick={handleClickFetch}
        className="bg-cyan-900 p-1 px-1 font-bold"
      >
        Fetch
      </button>
      <Toaster />
    </div>
  );
}
