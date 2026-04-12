export interface Education {
  year: string;
  institution: string;
  degree: string;
  advisor?: string;
  thesis?: string;
  thesisUrl?: string;
  institutionUrl?: string;
}

export const educationData: Education[] = [
  // If you don't want to show education, just make the array empty.
  // {
  //   year: "2021—Present",
  //   institution: "Stanford University",
  //   degree: "Ph.D. in Computer Science",
  //   advisor: "Prof. Sarah Johnson",
  // },
  {
    year: "Nov '20— July '24",
    institution: "Indian Institute of Technology, Madras",
    institutionUrl: "https://www.iitm.ac.in/",
    degree: "B.Tech in Mechanical Engineering",
    thesis: "Motion Planning using Modified Potential Fields & Non-Linear Model Predictive Control for Robotic Arms",
    advisor: "Prof. Prabhu Rajagopal"
    // Optional links to thesis
    // thesisUrl: "https://dspace.mit.edu/handle/1721.1/149111"
  },
];
