import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';

// Mock Firebase modules
vi.mock('./Firebase/auth', () => ({
  signInUser: vi.fn(() => Promise.resolve({ uid: 'testUid', email: 'test@gmail.com' })),
}));

vi.mock('./Firebase/playlist', () => ({
  getSongsForPlaylist: vi.fn(() => Promise.resolve([
    { id: '1', songTitle: 'Song A', artist: 'Artist A', user: 'User1', votes: 2 },
    { id: '2', songTitle: 'Song B', artist: 'Artist B', user: 'User2', votes: 1 },
  ])),
  upvoteSong: vi.fn(() => Promise.resolve()),
  downvoteSong: vi.fn(() => Promise.resolve()),
  cancelVoteSong: vi.fn(() => Promise.resolve()),
}));

// Mock SongItem and MusicPlayer to isolate tests
vi.mock('./components/SongItem', () => ({
  default: ({ song }) => <div data-testid="song-item">{song.songTitle}</div>,
}));
vi.mock('./components/MusicPlayer', () => ({
  default: () => <div data-testid="music-player" />,
}));

describe('Full App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Renders loading screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeDefined();
  });

  test('Auto signs in test user and renders dashboard', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/BUMP/i)).toBeDefined());
    expect(screen.getByText(/My Groove - Road Trip/i)).toBeDefined();
  });

  test('Fetches and renders songs sorted by votes', async () => {
    render(<App />);
    await waitFor(() => {
      const items = screen.getAllByTestId('song-item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toBe('Song A');
      expect(items[1].textContent).toBe('Song B');
    });
  });

  test('Renders music player component', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('music-player')).toBeDefined();
    });
  });
});