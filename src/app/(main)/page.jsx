import HeroSection from "@/components/HeroSection";
import "@/app/home.css";
import HomeInsurancePartner from "@/components/HomeInsurancePartner";
import OurServices from "@/components/OurServices";
import FAQ from "@/components/FAQ";
import HowBest from "@/components/HowBest";
import Repairs from "@/components/Repairs";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/footer/Footer";

export default function Home() {
  
  const numberStat = [
    {
      id: 1,
      number: "2000+",
      title: "Successful Repairs",
    },
    {
      id: 2,
      number: "24 Hrs",
      title: "Repair Time",
    },
    {
      id: 3,
      number: "10x",
      title: "Response Rate",
    },
    {
      id: 4,
      number: "20+",
      title: "Tech Partner Companies",
    },
  ];
  return (
    <div>
      <HeroSection />

      <div className="numbers">
        <div className="numbers-top">
          <span>Taking numbers...</span>
        </div>
        <h3></h3>
        <div className="numbers-wrap">
          {numberStat.map((stat) => (
            <div key={stat.id}>
              <h2>{stat.number}</h2>
              <p>{stat.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our services */}
      <OurServices />

      {/* Schedule pickup, insurance, become a partner */}
      <HomeInsurancePartner />

      {/* Repairs */}
      <Repairs />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* How Best */}
      <HowBest />

      <Footer newsPaperWrap={true} />
    </div>
  );
}
