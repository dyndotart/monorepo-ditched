import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Routes from './routes';

// Styles
import './styles/global.css';
import './styles/tailwind.css';

function init() {
  const appContainer = document.getElementById('root');
  console.log({ appContainer });
  if (appContainer == null) {
    throw new Error('Can not find Root!');
  }
  const root = createRoot(appContainer);
  // https://forum.figma.com/t/how-to-work-with-react-router-dom-in-figma-plugin/2450/9
  root.render(
    <MemoryRouter>
      <Routes />
    </MemoryRouter>
  );
}

// The 'DOMContentLoaded' event listener ensures that the 'init' function is called
// only after the entire HTML document has been loaded and parsed, making sure
// the DOM elements are ready to be manipulated.
document.addEventListener('DOMContentLoaded', init);