import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input Component', () => {
  it('should render with label', () => {
    render(<Input id="test-input" label="Test Label" />);

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<Input id="test-input" placeholder="Enter text..." />);

    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('should render with left icon', () => {
    const MockIcon = () => <span data-testid="left-icon">Icon</span>;
    render(<Input id="test-input" leftIcon={<MockIcon />} />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('should render with right icon', () => {
    const MockIcon = () => <span data-testid="right-icon">Icon</span>;
    render(<Input id="test-input" rightIcon={<MockIcon />} />);

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(<Input id="test-input" error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error styling when error is present', () => {
    const { container } = render(<Input id="test-input" error="Error message" />);

    const input = container.querySelector('input');
    expect(input).toHaveClass('border-danger-500');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input id="test-input" label="Test" disabled />);

    expect(screen.getByLabelText('Test')).toBeDisabled();
  });

  it('should render with type="email"', () => {
    render(<Input id="test-input" label="Email" type="email" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should render with type="password"', () => {
    render(<Input id="test-input" label="Password" type="password" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should render with type="number"', () => {
    render(<Input id="test-input" label="Number" type="number" />);

    const input = screen.getByLabelText('Number');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should render with type="date"', () => {
    render(<Input id="test-input" label="Date" type="date" />);

    const input = screen.getByLabelText('Date');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('should call onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<Input id="test-input" label="Test" onChange={handleChange} />);

    const input = screen.getByLabelText('Test');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should call onFocus when focused', () => {
    const handleFocus = jest.fn();
    render(<Input id="test-input" label="Test" onFocus={handleFocus} />);

    const input = screen.getByLabelText('Test');
    fireEvent.focus(input);

    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('should call onBlur when blurred', () => {
    const handleBlur = jest.fn();
    render(<Input id="test-input" label="Test" onBlur={handleBlur} />);

    const input = screen.getByLabelText('Test');
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should have required attribute when required prop is true', () => {
    render(<Input id="test-input" label="Test" required />);

    const input = screen.getByLabelText('Test');
    expect(input).toHaveAttribute('required');
  });

  it('should render with custom className', () => {
    render(<Input id="test-input" label="Test" className="custom-class" />);

    const input = screen.getByLabelText('Test');
    expect(input).toHaveClass('custom-class');
  });

  it('should render with defaultValue', () => {
    render(<Input id="test-input" label="Test" defaultValue="default value" />);

    const input = screen.getByLabelText('Test') as HTMLInputElement;
    expect(input.value).toBe('default value');
  });

  it('should render with maxLength attribute', () => {
    render(<Input id="test-input" label="Test" maxLength={100} />);

    const input = screen.getByLabelText('Test');
    expect(input).toHaveAttribute('maxLength', '100');
  });

  it('should render with pattern attribute', () => {
    render(<Input id="test-input" label="Test" pattern="[A-Za-z]+" />);

    const input = screen.getByLabelText('Test');
    expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
  });

  it('should render with step attribute for number type', () => {
    render(<Input id="test-input" label="Number" type="number" step="0.01" />);

    const input = screen.getByLabelText('Number');
    expect(input).toHaveAttribute('step', '0.01');
  });

  it('should render with min attribute for number type', () => {
    render(<Input id="test-input" label="Number" type="number" min="0" />);

    const input = screen.getByLabelText('Number');
    expect(input).toHaveAttribute('min', '0');
  });

  it('should render with max attribute for number type', () => {
    render(<Input id="test-input" label="Number" type="number" max="100" />);

    const input = screen.getByLabelText('Number');
    expect(input).toHaveAttribute('max', '100');
  });
});
