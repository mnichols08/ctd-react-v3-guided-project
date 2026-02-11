import styled from 'styled-components';

const StyledSection = styled.section`
  .first-letter {
    font-size: 3em;
    position: relative;
    line-height: 0;
  }
  p {
    padding-bottom: 1em;
  }
  p:not(:first-of-type) {
    text-indent: 1em;
  }
`;

function AboutPage() {
  return (
    <StyledSection>
      <p>
        <span className="first-letter">H</span>ello and thank you for stopping
        by my about page! This app grew out of my time in Code the Dream&apos;s
        Lark Cohort. I have been sharpening my React.js skills, starting with
        solid learning habits and spinning up the project with Vite.
      </p>

      <p>
        From there I built basic components, passed props to explore
        React&apos;s nuances, and dove into hooks like <code>useState</code> to
        make things interactive. I practiced conditional rendering, crafted
        controlled form components, and refactored for clarity. I even dipped
        into testing (none live here yet).
      </p>

      <p>
        Next came data fetching with Airtable—GET, POST, PATCH—so users can add
        tasks, mark them complete, or edit them. I learned to sort and filter
        via the Airtable API and added a debouncer to keep the API happy.
      </p>

      <p>
        I also tried out CSS modules and styled components. My favorite part was
        learning <code>useReducer</code> and <code>useContext</code>, wrapping
        the app in context so state could flow without prop drilling. The course
        is nearly done, and I’m excited to add pagination soon.
      </p>
    </StyledSection>
  );
}

export default AboutPage;
