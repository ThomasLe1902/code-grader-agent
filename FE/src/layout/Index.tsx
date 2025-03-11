import { Outlet } from "react-router-dom";
import Header from "./Header";

const LayoutDefault = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <Outlet />
    </div>
  );
};

export default LayoutDefault;
