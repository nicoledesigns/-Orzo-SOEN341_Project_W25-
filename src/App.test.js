import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';  // Add this import at the top

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
