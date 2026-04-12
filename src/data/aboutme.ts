export interface AboutMe {
  name: string;
  title: string;
  institution: string;
  description: string;
  email: string;
  imageUrl?: string;
  blogUrl?: string;
  cvUrl?: string;
  personalUrl?: string;
  googleScholarUrl?: string;
  twitterUsername?: string;
  githubUsername?: string;
  linkedinUsername?: string;
  funDescription?: string; // Gets placed in the left sidebar
  secretDescription?: string; // Gets placed in the bottom
  altName?: string;
  institutionUrl?: string;
}

export const aboutMe: AboutMe = {
  name: "Akhil B",
  title: "Robotics Engineer",
  institution: "Honda R&D, Japan 🇯🇵 ",
  // Note that links work in the description
  description:`
  Hello! I'm a Robotics engineer at 
  <a href='https://global.honda/jp/RandD/'>Honda R&D</a> where I work on problems 
  ranging in the fields of multi-agent optimization to vision models for low power hardware. 
  In my free time, I try to learn and research more on Robotics, particularly at the intersection of 
  optimization and high dimensional motion planning.

  <br>
  <br>
  When I'm not working, I enjoy <a href='https://www.tennisbear.net/user/880529/info'>playing tennis</a> and exploring new places. Checkout my
  <a href='/travel/index.html'>Travel site</a> to see where I've been.

`,
  email: "akhil2002b@gmail.com",
  imageUrl:"/pictures/home_pic.jpeg",
  googleScholarUrl: "https://scholar.google.com/citations?user=Ytra-EoAAAAJ&hl=en",
  githubUsername: "akhilb-2002",
  linkedinUsername: "akhil-b-650a2622a",
  twitterUsername: "akhil2002b",
  blogUrl:  "https://akhils-blogs.ghost.io" ,//"/Blogs/index.html", // Link to the static blog index
  cvUrl: "https://",
  personalUrl: "/travel/index.html", //Link to places visited site
  institutionUrl: "https://global.honda/jp/RandD/",
  // altName: "",
  // secretDescription: "I like dogs.",
};
