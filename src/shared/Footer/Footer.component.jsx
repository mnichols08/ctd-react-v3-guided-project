import styled from 'styled-components';

const StyledFooter = styled.footer`
  text-align: center;
  color: var(--text);
  padding: 0.75rem 1rem;
  a {
    color: var(--text);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .code {
    color: #22c55e;
    font-weight: 900;
  }
  .heart {
    color: #ef4444;
    font-weight: 900;
  }
  .text-yellow {
    color: #facc15;
    font-weight: 900;
  }

  hr {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin: 0.5rem auto;
    width: 60%;
  }
`;

function Footer() {
  return (
    <StyledFooter>
      <span className="code">&lt;/&gt;</span> with{' '}
      <span className="heart">&lt;3</span>
      <span>
        {' '}
        by{' '}
        <a
          href="https://github.com/mnichols08"
          target="_blank"
          rel="noreferrer"
          className="text-yellow"
        >
          mnichols08
        </a>
      </span>
      <hr />
      <span>© {new Date().getFullYear()} </span>
      <span>
        Inspired by{' '}
        <a href="https://codethedream.org/" target="_blank" rel="noreferrer">
          Code The Dream
        </a>{' '}
        |{' '}
        <a
          href="https://github.com/mnichols08/ctd-react-v3-guided-project/"
          target="_blank"
          rel="noreferrer"
        >
          View Source
        </a>
      </span>
    </StyledFooter>
  );
}

export default Footer;
