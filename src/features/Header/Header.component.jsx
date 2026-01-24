import styled from 'styled-components';

import defaultLogo from '../../assets/logo.png';

const StyledLogo = styled.img`
  margin: auto 1rem;
  width: 3rem;
`;

const StyledHeader = styled.header`
  display: flex;
  justify-content: center;
`;

function Header({ logo = defaultLogo, displayedText = 'My Todos' }) {
  return (
    <StyledHeader>
      <StyledLogo src={logo} alt={`${displayedText} Logo`} />
      <h1>{displayedText}</h1>
    </StyledHeader>
  );
}

export default Header;
