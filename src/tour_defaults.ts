import { createEvent, createStore } from "effector";
import { DateRange } from "react-day-picker";
import { Suggestion } from "./autosuggest";

export const setDefaultDateRange = createEvent<DateRange>();

export const $defaultDateRange = createStore<DateRange>({
  from: new Date(2023, 8, 18),
  to: new Date(2023, 9, 8),
}).on(setDefaultDateRange, (_, newRange) => newRange);
