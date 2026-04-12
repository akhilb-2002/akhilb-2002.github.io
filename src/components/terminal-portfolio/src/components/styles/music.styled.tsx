import styled from "styled-components";


export const PlayerBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.body};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 0 15px ${({ theme }) => theme.colors.primary};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  font-family: "Courier New", monospace;
  color: ${({ theme }) => theme.colors.primary};
`;

export const SongInfo = styled.div`
  .title {
    font-weight: bold;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 0.25rem;
  }
  .artist {
    font-size: 0.9rem;
  }
  .meta {
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

export const Controls = styled.div`
  button {
    background: none;
    border: 2px solid ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    font-family: "Courier New", monospace;
    padding: 0.3rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      box-shadow: 0 0 12px ${({ theme }) => theme.colors.primary};
    }
  }
`;
