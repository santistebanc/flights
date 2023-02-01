import { ClassNames, DayPicker, Matcher } from "react-day-picker";
import styles from "react-day-picker/dist/style.module.css";
import "./DateRangePicker.css";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useStore } from "effector-react";
import { $defaultDateRange, setDefaultDateRange } from "./tour_defaults";
dayjs.extend(localizedFormat);

const pastMonth = new Date();

export function DateRangePicker() {
  const classNames: ClassNames = {
    ...styles,
    month: styles.month + " bg-neutral-700 first:mr-2 last:ml-2",
    head: styles.head + " bg-neutral-600",
  };
  const range = useStore($defaultDateRange);

  const disabledDays: Matcher = (day) => dayjs(day).isBefore(dayjs(Date.now()));

  return (
    <DayPicker
      className="m-0"
      mode="range"
      classNames={classNames}
      modifiersClassNames={{
        selected: "bg-sky-800",
        today: "bg-neutral-500",
      }}
      numberOfMonths={2}
      defaultMonth={range.from}
      selected={range}
      onSelect={setDefaultDateRange}
      disabled={disabledDays}
      showOutsideDays
      max={60}
      weekStartsOn={1}
      fixedWeeks
    />
  );
}
