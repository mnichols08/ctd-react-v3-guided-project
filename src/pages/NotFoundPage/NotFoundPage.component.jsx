import { Link } from 'react-router';
import styled from 'styled-components';

import { useTodosContext } from '../../context/TodosContext';

const StyledSection = styled.section`
  text-align: center;
  img {
    width: 3em;
    margin-right: 1em;
    position: relative;
    top: 1em;
  }
  h2 {
    display: inline-block;
  }
  hr,
  p {
    margin: 2em 0;
  }
  .btn {
    background-color: var(--accent);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.65rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s;
    &:hover {
      transform: scale(1.1);
      opacity: 0.9;
    }
    &:focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }
  }
`;

function NotFoundPage() {
  const { errorImg } = useTodosContext();
  return (
    <StyledSection>
      <img src={errorImg} alt="" aria-hidden="true" />
      <h2>Oops! This route cannot be found.</h2>
      <p>
        You seem to have have found a page that we cannot find. Please go back,
        or try again later.
      </p>
      <Link to="/">
        <button className="btn">Go back to app</button>
      </Link>
      <hr />
    </StyledSection>
  );
}

export default NotFoundPage;
