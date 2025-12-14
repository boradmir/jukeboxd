import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';
import { ModalProvider } from '../contexts/ModalContext';

// Helper to render components with required providers
export function renderWithProviders(component) {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <UserProvider>
                    <ModalProvider>
                        {component}
                    </ModalProvider>
                </UserProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

// Mock fetch for API tests
export function mockFetch(data, ok = true) {
    return vi.fn(() =>
        Promise.resolve({
            ok,
            json: () => Promise.resolve(data)
        })
    );
}

describe('Test Helper Functions', () => {
    it('should export renderWithProviders function', () => {
        expect(typeof renderWithProviders).toBe('function');
    });

    it('should export mockFetch function', () => {
        expect(typeof mockFetch).toBe('function');
    });

    it('mockFetch should return a mock function', () => {
        const mock = mockFetch({ success: true });
        expect(typeof mock).toBe('function');
    });
});
