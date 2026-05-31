import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome heading when visiting home route', () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(screen.getByText(/Welcome to Fivi/i)).toBeInTheDocument();
});
