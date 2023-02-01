import { DateRangePicker } from "./DateRangePicker";
import FetchTour from "./FetchTour";
import FlightsTable from "./Flights";
import PlacesList from "./PlacesList";

function App() {
  return (
    <div className="grid gap-2 p-5">
      <h1 className="mx-2 mt-3 mb-8 text-3xl font-bold">🛪 Tour Planner</h1>
      <div className="grid grid-flow-row-dense gap-2">
        <DateRangePicker />
        <PlacesList />
      </div>
      <FetchTour />
      <FlightsTable />
    </div>
  );
}

export default App;
