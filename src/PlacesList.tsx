import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";
import { Suggestion, suggestPlaces } from "./autosuggest";
import { debounce_leading } from "./utils";
import { useStore } from "effector-react";
import {
  $tourCities,
  addTourCity,
  removeTourCity,
  moveDownTourCity,
  moveUpTourCity,
} from "./tour_cities";

export default function PlacesList({}) {
  const [itemName, setItemName] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState(false);
  const [keepFocus, setKeepFocus] = useState(false);
  const [mouseDownOption, setMouseDownOption] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const tourCities = useStore($tourCities);

  const fetchAutoSuggest = debounce_leading(
    (searchTerm: string) =>
      suggestPlaces({
        searchTerm,
        locale: "en-US",
        market: "MX",
        includedEntityTypes: ["PLACE_TYPE_AIRPORT", "PLACE_TYPE_CITY"],
      }).then((sug) => {
        if (focused && itemName.length > 0) {
          setSuggestions(sug);
        }
      }),
    200
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length > 1) {
      fetchAutoSuggest(text);
    } else {
      setSuggestions([]);
    }
    setItemName(text);
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (keepFocus) {
      e.target.focus();
    } else if (!mouseDownOption) {
      setFocused(false);
    }
    setMouseDownOption(false);
    setKeepFocus(false);
  };

  const handleMouseDownOtion = () => {
    setMouseDownOption(true);
  };

  const handleClickOption = (sug: Suggestion) => () => {
    setKeepFocus(true);
    setItemName("");
    addTourCity(sug);
  };

  const handleAdd = () => {
    setKeepFocus(true);
    const suggestion = suggestions.find((s) => s.name === itemName);
    if (itemName.length && suggestion) {
      setItemName("");
      addTourCity(suggestion);
    }
  };
  const handleMoveUp = (item: Suggestion) => () => moveUpTourCity(item);
  const handleMoveDown = (item: Suggestion) => () => moveDownTourCity(item);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
    }
  };

  const handleRemove = (item: Suggestion) => () => removeTourCity(item);

  return (
    <div className="mt-4">
      <div className="flex">
        <div className="flex flex-col">
          <div className="flex">
            <button
              onClick={handleAdd}
              className="px-1 bg-red-900 p-1 hover:bg-red-800"
            >
              Add
            </button>
            <input
              type="text"
              value={itemName}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="pl-1 focus:outline-none focus:shadow-[0_0_0_2px_inset] focus:shadow-red-900"
              onKeyDown={handleKeyDown}
              ref={input}
            />
          </div>
          {suggestions.length > 0 && focused && itemName.length > 0 && (
            <div className="relative">
              <ul className="absolute bg-gray-red z-10 max-h-40 overflow-y-auto w-full">
                {suggestions.map((sug, i) => (
                  <li
                    className="px-2 py-1 cursor-pointer hover:bg-black "
                    key={i}
                    onMouseDown={handleMouseDownOtion}
                    onClick={handleClickOption(sug)}
                  >
                    {sug.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <ol className="bg-slate-800">
        {tourCities.map((item, i) => (
          <li className="flex" key={item.entityId}>
            <button
              onClick={handleRemove(item)}
              className="bg-yellow-900 px-1 hover:bg-yellow-800"
            >
              🗙
            </button>
            <span className="my-1 mx-2 flex-1 items-center">{item.name}</span>
            <button
              onClick={handleMoveUp(item)}
              className="bg-blue-900 px-1 hover:bg-blue-800"
            >
              ▲
            </button>
            <button
              onClick={handleMoveDown(item)}
              className="bg-blue-900 px-1 hover:bg-blue-800"
            >
              ▼
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
