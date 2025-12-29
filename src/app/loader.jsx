import Image from "next/image";
import logo from "@/assets/images/logo.png";

export default function GlobalLoading() {
  return (
    <div className="preloader">
      <Image src={logo} alt="TecNurx" width={180} height={180} priority />

      <div className="spinner-container">
        <div className="spinner"></div>
        <div className="spinner inner"></div>
      </div>

      <p>Loading...</p>
    </div>
  );
}
