import { render, screen } from '@testing-library/react';
import App from './App';

test('shows the log in page when visiting the root while logged out', async () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(await screen.findByText(/New here\?/i)).toBeInTheDocument();
});
