import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Se o app renderizar sem erro, o teste passa
  expect(true).toBe(true);
});
