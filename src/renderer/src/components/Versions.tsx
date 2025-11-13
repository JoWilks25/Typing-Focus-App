import packageJson from '../../../../package.json';
import styled from "styled-components";

export const VersionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text.tertiary};
  font-family: ${props => props.theme.fonts.mono};
`;

export const VersionItem = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
`;

export const VersionSeparator = styled.span`
  color: ${props => props.theme.colors.text.tertiary};
`;


function Versions(): React.JSX.Element {
  return (
    <VersionsContainer>
      <VersionItem>App v{packageJson.version}</VersionItem>
    </VersionsContainer>
  );
}

export default Versions;