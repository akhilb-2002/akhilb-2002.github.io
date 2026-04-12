import Clear from "./commands/Clear";
import Echo from "./commands/Echo";
import Help from "./commands/Help";
import About from "./commands/About";
import History from "./commands/History";
import Themes from "./commands/Themes";
import { OutputContainer, UsageDiv } from "./styles/Output.styled";
import { termContext } from "./Terminal";
import { useContext } from "react";
import MusicPlayer from "./commands/music";

type Props = {
  index: number;
  cmd: string;
};

const Output: React.FC<Props> = ({ index, cmd }) => {
  const { arg } = useContext(termContext);

  const specialCmds = ["projects", "socials", "themes", "echo"];

  // return 'Usage: <cmd>' if command arg is not valid
  // eg: about tt
  if (!specialCmds.includes(cmd) && arg.length > 0)
    return <UsageDiv data-testid="usage-output">Usage: {cmd}</UsageDiv>;

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : null}>
      {
        {
          about: <About />,
          clear: <Clear />,
          echo: <Echo />,
          help: <Help />,
          history: <History />,
          themes: <Themes />,
          music: <MusicPlayer />,
        }[cmd]
      }
    </OutputContainer>
  );
};

export default Output;
