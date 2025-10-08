import { render, screen } from '@testing-library/react';
import React from 'react';

test('renders SHREE CARGO SURAT brand text', () => {
  render(<h1>SHREE CARGO SURAT</h1>);
  expect(screen.getByText(/shree cargo surat/i)).toBeInTheDocument();
});
