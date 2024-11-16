import { FC } from "react";
import Loading from "./loading";

const LoadingPage: FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="large" />
    </div>
  );
};

export default LoadingPage;
