import { CompactTable } from "@table-library/react-table-library/compact";
import { db } from "./db";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";
import localizedFormat from "dayjs/plugin/localizedFormat";
import currency from "currency.js";
import { useLiveQuery } from "dexie-react-hooks";
dayjs.extend(objectSupport);
dayjs.extend(localizedFormat);

interface Flight {
  id: string;
  originName: string;
  destinationName: string;
  departureDateTime: Date;
  arrivalDateTime: Date;
  price: number;
  deepLink: string;
}

const COLUMNS = [
  { label: "From", renderCell: ({ originName }: Flight) => originName },
  { label: "To", renderCell: ({ destinationName }: Flight) => destinationName },
  {
    label: "Departure",
    renderCell: ({ departureDateTime }: Flight) =>
      dayjs(departureDateTime).format("D MMM  H:mm"),
  },
  {
    label: "Arrival",
    renderCell: ({ arrivalDateTime }: Flight) =>
      dayjs(arrivalDateTime).format("D MMM  H:mm"),
  },
  {
    label: "Price",
    renderCell: ({ price }: Flight) =>
      currency(price, { precision: 0 }).format(),
  },
  { label: "Link", renderCell: ({ deepLink }: Flight) => deepLink },
];

export default function FlightsTable() {
  const results = useLiveQuery(
    async () =>
      await Promise.all(
        (
          await db.legs.orderBy("price").toArray()
        ).map(
          async ({
            id,
            departureDateTime,
            arrivalDateTime,
            originPlaceId,
            destinationPlaceId,
            price,
            deepLink,
          }) => ({
            id,
            departureDateTime,
            arrivalDateTime,
            originName: (await db.places.get(originPlaceId))?.name,
            destinationName: (await db.places.get(destinationPlaceId))?.name,
            price,
            deepLink,
          })
        )
      )
  );

  const nodes = results ?? [];

  return <CompactTable columns={COLUMNS} data={{ nodes }} />;
}
