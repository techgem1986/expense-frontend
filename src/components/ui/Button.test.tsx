import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('should render with default variant', () => {
    render(<Button>Click Me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
  });

  it('should render with danger variant', () => {
    render(<Button variant="danger">Delete</Button>);

    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-danger-600');
  });

  it('should render with success variant', () => {
    render(<Button variant="success">Save</Button>);

    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-success-600');
  });

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-transparent');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('should show loading state when loading prop is true', () => {
    render(<Button loading>Loading</Button>);

    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();
    expect(button).toBeInTheDocument();
  });

  it('should render with left icon', () => {
    const MockIcon = () => <span data-testid="icon">Icon</span>;
    render(<Button leftIcon={<MockIcon />}>With Icon</Button>);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render with right icon', () => {
    const MockIcon = () => <span data-testid="icon">Icon</span>;
    render(<Button rightIcon={<MockIcon />}>With Icon</Button>);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button', { name: /click/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );

    fireEvent.click(screen.getByRole('button', { name: /disabled/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render as full width when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width</Button>);

    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toHaveClass('w-full');
  });

  it('should render with custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should render with type="submit"', () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should render with type="reset"', () => {
    render(<Button type="reset">Reset</Button>);

    const button = screen.getByRole('button', { name: /reset/i });
    expect(button).toHaveAttribute('type', 'reset');
  });

  it('should render small size', () => {
    render(<Button size="sm">Small</Button>);

    const button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-xs');
  });

  it('should render large size', () => {
    render(<Button size="lg">Large</Button>);

    const button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });
});
