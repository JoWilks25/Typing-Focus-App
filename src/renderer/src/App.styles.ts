import styled from "styled-components";

export const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
`

export const Navigation = styled.nav`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: ${props => props.theme.colors.background.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};
  padding: 0.75rem 1.5rem;
  /* GPU acceleration to prevent flickering */
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
`

export const NavContent = styled.div`
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  display: flex;
  justify-content: space-between; /* Changed from center to space-between */
  align-items: center; /* Add vertical centering */
  gap: 1rem;
`
export const AppTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  /* GPU acceleration */
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
`;

export const AppLogo = styled.img`
  height: 3rem; /* Larger logo size */
  width: auto;
  display: block;
`;

export const AppTitle = styled.h1`
  font-family: ${props => props.theme.fonts.cursive};
  font-size: ${props => props.theme.fontSizes['4xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  text-align: left;
  color: ${props => props.theme.colors.text.title};
  margin: 0;
`;

export const MvpBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.gradient.badge.start},
    ${props => props.theme.colors.gradient.badge.end}
  );
  color: ${props => props.theme.colors.button.text};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  border-radius: 9999px; /* pill shape */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 1px 3px ${props => props.theme.colors.shadow.md};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const NavButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

export const NavButton = styled.button<{
  $isActive?: boolean;
  $isDisabled?: boolean;
}>`
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: all 0.2s ease;
  border: none;
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};

  /* Active state */
  ${props => props.$isActive && `
    background-color: ${props.theme.colors.button.primary.bg};
    color: ${props.theme.colors.button.text};
  `}

  /* Inactive state */
  ${props => !props.$isActive && !props.$isDisabled && `
    background-color: ${props.theme.colors.button.inactive.bg};
    color: ${props.theme.colors.button.textInactive};

    &:hover {
      background-color: ${props.theme.colors.button.inactive.bgHover};
    }
  `}

  /* Disabled state */
  ${props => props.$isDisabled && `
    background-color: ${props.theme.colors.button.disabled.bg};
    color: ${props.theme.colors.button.textDisabled};
    opacity: 0.5;

    &:hover {
      background-color: ${props.theme.colors.button.disabled.bg};
    }
  `}

  /* Focus state */
  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }
`;

export const ThemeDropdown = styled.select`
  padding: 0.5rem 1.5rem;
  padding-right: 2.5rem;
  border-radius: 0.5rem;
  font-weight: ${props => props.theme.fontWeights.medium};
  font-size: ${props => props.theme.fontSizes.sm};
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.button.inactive.bg};
  color: ${props => props.theme.colors.button.textInactive};
  appearance: none;
  position: relative;
  
  /* Custom dropdown arrow using CSS */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 0.75rem;

  &:hover {
    background-color: ${props => props.theme.colors.button.inactive.bgHover};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.accent.blue};
    outline-offset: 2px;
  }

  option {
    background-color: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.text.primary};
  }
`;

export const MainContent = styled.main`
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  padding: 1rem;
`;

export const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.theme.colors.background.secondary};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  padding: 0.5rem;
`;