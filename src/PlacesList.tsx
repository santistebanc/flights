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
import { Place } from "./db";

export default function PlacesList({}) {
  const [inputText, setInputText] = useState("");
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
        if (focused && inputText.length > 0) {
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
    setInputText(text);
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
    setInputText("");
    addTourCity(sug);
  };

  const handleAdd = () => {
    setKeepFocus(true);
    const suggestion = suggestions.find((s) => s.name === inputText);
    if (inputText.length && suggestion) {
      setInputText("");
      addTourCity(suggestion);
    }
  };
  const handleMoveUp = (item: Place) => () => moveUpTourCity(item);
  const handleMoveDown = (item: Place) => () => moveDownTourCity(item);
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

  const handleRemove = (item: Place) => () => removeTourCity(item);

  return (
    <div>
      <div className="flex">
        <div className="flex flex-col">
          <div className="flex">
            <button
              onClick={handleAdd}
              className="bg-red-900 p-1 px-1 font-extrabold hover:bg-red-800"
            >
              ⌕
            </button>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="pl-1 focus:shadow-[0_0_0_2px_inset] focus:shadow-red-900 focus:outline-none"
              onKeyDown={handleKeyDown}
              ref={input}
            />
          </div>
          {suggestions.length > 0 && focused && inputText.length > 0 && (
            <div className="relative">
              <ul className="absolute z-10 max-h-40 w-full overflow-y-auto bg-gray-red">
                {suggestions.map((sug, i) => (
                  <li
                    className="cursor-pointer px-2 py-1 hover:bg-black "
                    key={i}
                    onMouseDown={handleMouseDownOtion}
                    onClick={handleClickOption(sug)}
                  >
                    {sug.name}
                    {sug.type === "PLACE_TYPE_AIRPORT" &&
                      sug.iata &&
                      ` \t (${sug.iata})`}
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
