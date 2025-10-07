import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the shipment tracking hero heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /track your shipment/i });
  expect(heading).toBeInTheDocument();
});
