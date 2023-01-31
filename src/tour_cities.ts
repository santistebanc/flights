import { createEvent, createStore } from "effector";
import { Suggestion } from "./autosuggest";

export const addTourCity = createEvent<Suggestion>();
export const removeTourCity = createEvent<Suggestion>();
export const moveUpTourCity = createEvent<Suggestion>();
export const moveDownTourCity = createEvent<Suggestion>();

export const $tourCities = createStore<Suggestion[]>([])
  .on(addTourCity, (list, item) => [...list, item])
  .on(removeTourCity, (list, item) => list.filter((it) => it !== item))
  .on(moveUpTourCity, (list, item) =>
    list.reduce<Suggestion[]>(
      (a, it, i, arr) =>
        i > 0 && it === item
          ? [...a.slice(0, i - 1), it, arr[i - 1]]
          : [...a, it],
      []
    )
  )
  .on(moveDownTourCity, (list, item) =>
    list.reduce<Suggestion[]>(
      (a, it, i, arr) =>
        arr[i - 1] === item
          ? [...a.slice(0, i - 1), it, arr[i - 1]]
          : [...a, it],
      []
    )
  );

export const $homeCity = $tourCities.map((list) => [list.at(0)]); //TODO: fix this store

export const $visitCities = $tourCities.map((list) => list.slice(1));
