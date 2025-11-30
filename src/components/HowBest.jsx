import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import how1 from '../assets/images/how1.svg'
import how2 from '../assets/images/how2.svg'
import how3 from '../assets/images/how3.svg'
import how4 from '../assets/images/how4.svg'
import how5 from '../assets/images/how5.svg'

const HowBest = () => {
    const howbestList = [
      {
        id: 1,
        img: how1,
        title: "Start a claim",
        desc: "Submit a new claim for your device quickly and easily. We'll guide you through the process to get your issue resolved",
        href: "#",
      },
      {
        id: 2,
        img: how2,
        title: "Fix something",
        desc: "Don't let a broken device slow you down. Schedule an expert repair with our technicians to get your gadget working like new",
        href: "/book-repair",
      },
      {
        id: 3,
        img: how3,
        title: "Protect device",
        desc: "Give yourself peace of mind with our protection plans. Our flexible options cover everything from accidental damage to unexpected failures",
        href: "/insurance",
      },
      {
        id: 4,
        img: how4,
        title: "Consult us",
        desc: "Need professional advice? Talk to our experts for assistance with device setups, product recommendations, etc.",
        href: "#",
      },
      {
        id: 5,
        img: how5,
        title: "Contact us",
        desc: "Reach out to our customer support team for any questions you have about our services or your account",
        href: "#",
      },
    ];
  return (
    <div>
      <div className="how-best-wrap">
        <div className="how-head">
          <h1>
            How best <span>can we help you?</span>
          </h1>
          <p>Select a service below to start</p>
        </div>
        <div className="best-grid">
          {howbestList.map((how) => (
            <div key={how.id} className='best-box'>
              <Image src={how.img} alt={how.img} />
              <div className="grid-txt">
                <h2>{how.title}</h2>
              <p>{how.desc}</p>
              <Link href={how.href}>
                <span>Proceed</span> <ArrowRight size={20} />
              </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HowBest