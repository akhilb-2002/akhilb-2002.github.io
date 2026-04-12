export interface Portfolio {
  title: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
  reportUrl?: string;
  codeUrl?: string;
  projectUrl?: string; // Optional URL for the project, if you want to link to a specific project page
}

export const portfolioData: Portfolio[] = [
  {
    title: "Optimized Path Following in Truck Platoons Using Non-Linear Model Predictive Control with Geo-spatial Data",
    description: `
      The project was an attempt to build an MPC controller for a platoon of trucks to follow a predefined path read from KML file data.
      The optimization was handled by the Casadi toolbox.
      Work done as part of the Undergraduate Research course with 
      <a href="https://ed.iitm.ac.in/~shankarram/">Prof. Shankar Ram CS</a> and 
      <a href="https://experts.exeter.ac.uk/39003-devika-koonthalakadu-baby">Prof. K B Devika</a>.
    `,
    technologies: ["Python", "Casadi"],
    codeUrl: "https://github.com/akhilb-2002/Path-following-using-MPC-for-platoons-based-on-GPS-data/tree/main",
    imageUrl: "/pictures/portfolio_assets/NMPC.png",
    reportUrl: "https://github.com/akhilb-2002/Path-following-using-MPC-for-platoons-based-on-GPS-data/blob/main/UGRC_Akhil_Final.pdf",
  },
  {
    title: "Sampling based algorithms for Surgical Tasks with RCM constraint",
    description: `
      The Remote Center of Motion (RCM) constraint is a common requirement in surgical robotics.
      This project focuses on sampling-based algorithms, namely, RRT, RRT*, and BiRRT, to generate motion plans that respect this constraint.
      Work done as part of the Motion Planning course.
    `,
    technologies: ["Python", "PyBullet"],
    codeUrl: "https://github.com/akhilb-2002/rrtstar-kuka-iiwa7/tree/master",
    imageUrl: "/pictures/portfolio_assets/RCM_gif.gif",
    reportUrl: "https://github.com/akhilb-2002/rrtstar-kuka-iiwa7/blob/master/Final_Project_Report.pdf",
  },
  {
    title: "Numerical Methods to study flows in circular pipes",
    description: `
      Solvers concerning the flow in concentric pipes using the finite volume method (FVM).
      Work done as part of the Computational Heat and Fluid Flow course.
    `,
    technologies: ["C++", "OpenFoam"],
    codeUrl: "https://github.com/akhilb-2002/Computational-Heat-and-Fluid-Flow/tree/main",
    imageUrl: "/pictures/portfolio_assets/PipeFlow.png",
    reportUrl: "https://github.com/akhilb-2002/Computational-Heat-and-Fluid-Flow/blob/main/Project/NUMERICAL%20METHODS%20TO%20STUDY%20FLOWS%20IN%20CONCENTRIC%20CIRCULAR%20PIPES.pdf",
  },
];
