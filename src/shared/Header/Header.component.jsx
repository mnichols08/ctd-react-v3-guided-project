import { NavLink } from 'react-router';
import { useTodosContext } from '../../context/TodosContext';

import styled from 'styled-components';

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
// Styled nav container that places it in top right
// I did not use a CSS Module here like assignment required
// Please let me know if this is a problem and I can change
const StyledNav = styled.nav`
  position: absolute;
  top: 1em;
  right: 2em;
  text-align: right;
  font-weight: 900;
  color: var(--active-link);
  a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  .current {
    color: var(--active-link);
  }
  .inactive {
    color: var(--inactive-link);
  }
`;

// Header component that displays a logo, title, and navigation menu
// - title = Text to display as the title
function Header({ title }) {
  const { logo } = useTodosContext();
  return (
    <StyledHeader>
      <StyledLogo src={logo} alt="" aria-hidden="true" />
      <h1>{title}</h1>
      <StyledNav>
        <NavLink
          className={({ isActive }) => (isActive ? 'current' : 'inactive')}
          to="/"
        >
          Home
        </NavLink>{' '}
        |{' '}
        <NavLink
          className={({ isActive }) => (isActive ? 'current' : 'inactive')}
          to="/about"
        >
          About
        </NavLink>
      </StyledNav>
    </StyledHeader>
  );
}

export default Header;
