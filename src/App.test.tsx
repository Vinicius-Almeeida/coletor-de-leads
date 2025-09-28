import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Verifica se o app renderiza sem quebrar
  expect(document.body).toBeInTheDocument();
});
