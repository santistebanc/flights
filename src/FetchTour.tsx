import { useStore } from "effector-react";
import { getFlights } from "./fetch";
import { $homeCity, $visitCities } from "./tour_cities";
import { $defaultDateRange } from "./tour_defaults";

function toObjectDate(date: Date) {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export default function FetchTour() {
  const homeCityArray = useStore($homeCity);
  const visitCities = useStore($visitCities);
  const dateRange = useStore($defaultDateRange);

  const topCity = visitCities.at(0);
  const homeCity = homeCityArray.at(0);

  const handleClickFetch = () => {
    if (!homeCity || !topCity || !dateRange.from) return;
    getFlights({
      adults: 1,
      currency: "MXN",
      locale: "en-US",
      market: "MX",
      cabinClass: "CABIN_CLASS_ECONOMY",
      queryLegs: [
        {
          date: toObjectDate(dateRange.from),
          originPlaceId: { entityId: homeCity.entityId },
          destinationPlaceId: { entityId: topCity.entityId },
        },
      ],
    });
  };

  return (
    <div>
      <button
        onClick={handleClickFetch}
        className="px-1 bg-cyan-900 font-bold p-1"
      >
        Fetch
      </button>
    </div>
  );
}
