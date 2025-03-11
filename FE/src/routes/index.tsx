import LayoutDefault from "../layout/Index";
import ErrorPage from "../pages/Error";
import GradePage from "../pages/Grade";

export const routers = [
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        index: true,
        path: "/",
        element: <GradePage />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
];
