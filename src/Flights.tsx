import {
  Column,
  CompactTable,
} from "@table-library/react-table-library/compact";
import { db, Place } from "./db";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";
import localizedFormat from "dayjs/plugin/localizedFormat";
import currency from "currency.js";
import { useLiveQuery } from "dexie-react-hooks";
import { TableNode } from "@table-library/react-table-library";
import { ReactNode } from "react";
import { usePagination } from "@table-library/react-table-library/pagination";
dayjs.extend(objectSupport);
dayjs.extend(localizedFormat);

const PAGE_LIMIT = 100;

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

interface Props {
  origin?: Place;
  destination?: Place;
}

export default function FlightsTable({ origin, destination }: Props) {
  const where = origin && { originPlaceId: origin.entityId };

  console.log(where);

  const results = useLiveQuery(
    async () =>
      !where
        ? Promise.resolve([])
        : await Promise.all(
            (
              await db.legs.where(where).limit(PAGE_LIMIT).sortBy("price")
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
                destinationName: (
                  await db.places.get(destinationPlaceId)
                )?.name,
                price,
                deepLink,
              })
            )
          ),
    [origin, destination]
  );

  const nodes = results ?? [];
  const data = { nodes };

  const pagination = usePagination(data, {
    state: {
      page: 0,
      size: PAGE_LIMIT,
    },
  });

  return (
    <CompactTable
      columns={COLUMNS as unknown as Column[]}
      data={data}
      pagination={pagination}
    />
  );
}
