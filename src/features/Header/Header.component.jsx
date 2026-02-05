import styled from 'styled-components';

import defaultLogo from '../../assets/logo.png';

// Styled logo image with auto horizontal margins for centering and right padding
const StyledLogo = styled.img`
  margin: auto 1rem;
  width: 3rem;
`;

// Styled header container with flexbox layout
const StyledHeader = styled.header`
  display: flex;
  justify-content: center;
`;

// Header component that displays a logo and title text
// - logo = Path to the logo image (defaults to defaultLogo)
// - displayedText = Text to display as the title
//  (defaults to 'My Todos') and sets logo alt to this + logo

function Header({ logo = defaultLogo, displayedText = 'My Todos' }) {
  return (
    <StyledHeader>
      <StyledLogo src={logo} alt={`${displayedText} Logo`} />
      <h1>{displayedText}</h1>
    </StyledHeader>
  );
}

export default Header;