import { useTodosContext } from '../../context/TodosContext';
import styled from 'styled-components';

import styles from './ErrorMessage.module.css';

const StyledErrorImage = styled.img`
  width: 4rem;
`;

const ErrorContent = styled.div`
  display: flex;
`;

function ErrorMessage() {
  const { errorMessage, clearError, errorImg } = useTodosContext();
  return (
    <div className={styles['error-message']}>
      <hr />
      <ErrorContent>
        <StyledErrorImage src={errorImg} aria-hidden="true" alt='Error icon' />
        <p>{errorMessage}</p>
      </ErrorContent>
      <input type="button" onClick={clearError} value="Dismiss" />
    </div>
  );
}

export default ErrorMessage;
