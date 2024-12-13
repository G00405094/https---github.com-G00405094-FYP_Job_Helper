import classes from './MainNavigation.module.css';
import Link from 'next/link'

function MainNavigation() {

  return (
    <header className={classes.header}>
      <div className={classes.logo}>AI Job Helper</div>
      <nav>
        <ul>
          <li>
            <Link href='/'>Generate CV</Link>
          </li>
          <li>
            <Link href='/job-search'>Job Search</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
