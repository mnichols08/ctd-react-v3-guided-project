import styled from 'styled-components';

import styles from './ErrorMessage.module.css';
import errorImg from '../../assets/error.png';

const StyledErrorImage = styled.img`
  width: 4rem;
`;

const ErrorContent = styled.div`
  display: flex;
`;

function ErrorMessage({ errorMessage, setErrorMessage }) {
  return (
    <div className={styles['error-message']}>
      <hr />
      <ErrorContent>
        <StyledErrorImage src={errorImg} alt="" aria-hiden="true" />
        <p>{errorMessage}</p>
      </ErrorContent>
      <input
        type="button"
        onClick={() => setErrorMessage('')}
        value="Dismiss"
      />
    </div>
  );
}

export default ErrorMessage;
