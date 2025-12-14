import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Simple component test example
describe('Basic Component Tests', () => {
    it('should render text correctly', () => {
        const TestComponent = () => <div>Hello World</div>;
        render(<TestComponent />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should handle conditional rendering', () => {
        const ConditionalComponent = ({ show }) => (
            show ? <div>Visible</div> : null
        );

        const { rerender } = render(<ConditionalComponent show={true} />);
        expect(screen.getByText('Visible')).toBeInTheDocument();

        rerender(<ConditionalComponent show={false} />);
        expect(screen.queryByText('Visible')).not.toBeInTheDocument();
    });

    it('should work with router', () => {
        const RouterComponent = () => (
            <BrowserRouter>
                <a href="/test">Link</a>
            </BrowserRouter>
        );

        render(<RouterComponent />);
        expect(screen.getByText('Link')).toHaveAttribute('href', '/test');
    });
});

describe('Mock Functions', () => {
    it('should track function calls', () => {
        const mockFn = vi.fn();
        mockFn('arg1', 'arg2');

        expect(mockFn).toHaveBeenCalled();
        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should return mocked values', () => {
        const mockFn = vi.fn().mockReturnValue(42);

        expect(mockFn()).toBe(42);
    });
});
