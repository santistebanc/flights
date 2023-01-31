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
