import { App as InitialTestApp } from './pages/initial-test/App';
import { App as DebugApp } from './pages/debug/App';

const getPathname = () => {
  const pathname = window.location.pathname; // e.g., "/debug/" or "/debug"
  return pathname.split('/').filter(Boolean).pop();
};

const init = async () => {
  const pathName = getPathname();

  switch (pathName) {
    case 'debug':
      new DebugApp();
      break;
    case 'initial-test':
    default:
      new InitialTestApp();
      break;
  }
};

void init();
