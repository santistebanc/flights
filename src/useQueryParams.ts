import { useEffect, useMemo, useState } from "react";
import { db, Place } from "./db";

export default function useQueryParams() {
  const [origin, setOrigin] = useState<Place>();
  const [destination, setDestination] = useState<Place>();
  useEffect(() => {
    const observer = new MutationObserver(function (mutations) {
      const search = new URLSearchParams(window.location.search);
      const origin = search.get("origin");
      const destination = search.get("destination");

      db.places.get({ iata: origin }).then((place) => setOrigin(place));
      db.places
        .get({ iata: destination })
        .then((place) => setDestination(place));
    });
    const config = { subtree: true, childList: true };

    // start listening to changes
    observer.observe(document, config);

    // stop listening to changes
    return () => observer.disconnect();
  });

  return { origin, destination };
}
