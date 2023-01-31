import { DateRangePicker } from "./DateRangePicker";
import FetchTour from "./FetchTour";
import FlightsTable from "./Flights";
import PlacesList from "./PlacesList";

function App() {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mt-3 mb-8 mx-2">🛪 Tour Planner</h1>
      <div className="my-4">
        <DateRangePicker />
        <PlacesList />
        <FetchTour />
      </div>
      <FlightsTable />
    </div>
  );
}

export default App;
