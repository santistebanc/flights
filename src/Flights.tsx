import {
  Column,
  CompactTable,
} from "@table-library/react-table-library/compact";
import { db } from "./db";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";
import localizedFormat from "dayjs/plugin/localizedFormat";
import currency from "currency.js";
import { useLiveQuery } from "dexie-react-hooks";
import { TableNode } from "@table-library/react-table-library";
import { ReactNode } from "react";
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

interface FlightsTableNode extends TableNode {
  renderCell: (flight: Flight) => ReactNode;
}

interface FlightsColumn extends FlightsTableNode {}

const COLUMNS: FlightsColumn[] = [
  {
    id: "from",
    label: "From",
    renderCell: ({ originName }) => originName,
  },
  {
    id: "to",
    label: "To",
    renderCell: ({ destinationName }) => destinationName,
  },
  {
    id: "departure",
    label: "Departure",
    renderCell: ({ departureDateTime }) =>
      dayjs(departureDateTime).format("D MMM  H:mm"),
  },
  {
    id: "arrival",
    label: "Arrival",
    renderCell: ({ arrivalDateTime }) =>
      dayjs(arrivalDateTime).format("D MMM  H:mm"),
  },
  {
    id: "price",
    label: "Price",
    renderCell: ({ price }) => currency(price, { precision: 0 }).format(),
  },
  {
    id: "link",
    label: "Link",
    renderCell: ({ deepLink }) => (
      <a href={deepLink} target="_blank">
        🔗
      </a>
    ),
  },
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

  return (
    <CompactTable columns={COLUMNS as unknown as Column[]} data={{ nodes }} />
  );
}
