import { generateTabs } from "../../utils/funcs";
import {
  Cmd,
  HighlightSpan,
  HeroContainer,
  PreName,
  PreNameMobile,
  PreWrapper,
  Seperator,
} from "../styles/About.styled";
import { CmdList, CmdDesc } from "../styles/Help.styled";
import { commands } from "../Terminal";

const About: React.FC = () => {
  return (
    <HeroContainer data-testid="about">
      <div className="info-section">
        <PreName>
          {`        
     ___    __   __    _ __
   /   |  / /__/ /_  (_) /
  / /| | / //_/ __ \/ / / 
 / ___ |/ ,< / / / / / /  
/_/  |_/_/|_/_/ /_/_/_/        
  
          `}
        </PreName>
        <PreWrapper>
          <PreNameMobile>
            {`
    ___    __   __    _ __
   /   |  / /__/ /_  (_) /
  / /| | / //_/ __ \/ / / 
 / ___ |/ ,< / / / / / /  
/_/  |_/_/|_/_/ /_/_/_/   
 
          `}
          </PreNameMobile>
        </PreWrapper>
        <Seperator>----</Seperator>
        <div>
          <p>
            Hi, my name is <HighlightSpan>Akhil</HighlightSpan>!
          </p>
          <p>
            I love messing around with terminals, this is my attempt at building
            something that is fun and easy to use.
          </p>
        </div>
      </div>
      <div data-testid="help">
        {commands.map(({ cmd, desc, tab }) => (
          <CmdList key={cmd}>
            <Cmd>{cmd}</Cmd>
            {generateTabs(tab)}
            <CmdDesc>- {desc}</CmdDesc>
          </CmdList>
        ))}
      </div>
    </HeroContainer>
  );
};

export default About;
