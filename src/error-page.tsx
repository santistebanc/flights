import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error: any = useRouteError();
  console.error(error);

  return (
    <div id="error-page" className="flex h-full items-center justify-center">
      <h1 className="text-center text-6xl">
        <i>{error.statusText || error.message}</i>
      </h1>
    </div>
  );
}
