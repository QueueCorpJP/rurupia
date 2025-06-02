import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: '/' })),
  };
});

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
  })),
}));

// Create a test wrapper with required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders navigation elements', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </TestWrapper>
    );

    // Check for specific existing links
    expect(screen.getByRole('link', { name: 'るぴぴあ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'セラピスト検索' })).toBeInTheDocument();
  });

  it('renders layout structure correctly', () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="main-content">Main Content</div>
        </Layout>
      </TestWrapper>
    );

    // Check for basic layout structure
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });
}); 