export type TimeObject = {
  hour: number;
  minute: number;
  second: number;
};

export type DateObject = {
  year: number;
  month: number;
  day: number;
};

export type DateTimeObject = DateObject & TimeObject;

export function debounce<T extends Function>(cb: T, wait = 300) {
  let h = 0;
  let callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<any>callable);
}

export function debounce_leading<T extends Function>(cb: T, wait = 300) {
  let h: number | undefined;
  let callable = (...args: any) => {
    if (!h) {
      cb(...args);
    }
    clearTimeout(h);
    h = setTimeout(() => {
      h = undefined;
    }, wait);
  };
  return <T>(<any>callable);
}

export function cleanObject(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

export function toTimeObject(date: Date): TimeObject {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

export function toDateObject(date: Date): DateObject {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function toDateTimeObject(date: Date): DateTimeObject {
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

export function fromDateTimeObject(obj: DateTimeObject): Date {
  return new Date(
    obj.year,
    obj.month - 1,
    obj.day,
    obj.hour,
    obj.minute,
    obj.second
  );
}
