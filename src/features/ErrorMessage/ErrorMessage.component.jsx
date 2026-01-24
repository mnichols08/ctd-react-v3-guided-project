import styled from 'styled-components';

import styles from './ErrorMessage.module.css';
import errorImg from '../../assets/error.png';

const StyledErrorImage = styled.img`
  width: 4rem;
`;

const FlexContainer = styled.div`
  display: flex;
`;

function ErrorMessage({ errorMessage, setErrorMessage }) {
  return (
    <div className={styles['error-message']}>
      <hr />
      <FlexContainer>
        <StyledErrorImage src={errorImg}  />
        <p>{errorMessage}</p>
      </FlexContainer>
      <input
        type="button"
        onClick={() => setErrorMessage('')}
        value="Dismiss"
      />
    </div>
  );
}

export default ErrorMessage;
