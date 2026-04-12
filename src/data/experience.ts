export interface Experience {
  date: string;
  title: string;
  company: string;
  description?: string;
  advisor?: string;
  manager?: string;
  companyUrl?: string;
}

export const experienceData: Experience[] = [
  {
    date: "May '23 - July '23",
    title: "Research Intern",
    company: "Control & Mechatronics Group, University of Paderborn",
    description:
      " Built an MPC-based controller to optimize the traffic flows using C++, and external APIs like SUMO, NLOpts",
    advisor: " Prof. Ansgar Trächtler",
    companyUrl: "https://www.hni.uni-paderborn.de/en/rtm",
  },
  {
    date: "Dec '22 - Jan '23",
    title: "R&D Intern",
    company: "Daimler India Commercial Vehicles",
    description:
      "Built an automated system for the Coast Down Test and simulations for an entire CI engine on Simulink, Matlab",
    // manager: "Elise Brown",
    companyUrl: "https://asia.daimlertruck.com/en/about-us/business-unit/dicv/",
  },
];
