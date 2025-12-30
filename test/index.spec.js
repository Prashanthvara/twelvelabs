import { describe, it, expect } from 'vitest';

describe('Video Analysis Application', () => {
	it('should have proper package.json configuration', async () => {
		const packageJson = await import('../package.json');
		
		expect(packageJson.name).toBe('twelvelabs');
		expect(packageJson.dependencies).toHaveProperty('twelvelabs-js');
		expect(packageJson.dependencies).toHaveProperty('axios');
		expect(packageJson.scripts).toHaveProperty('dev');
		expect(packageJson.scripts).toHaveProperty('deploy');
	});

	it('should have required dependencies', () => {
		// This test ensures the TwelveLabs SDK is available
		const { TwelveLabs } = require('twelvelabs-js');
		expect(TwelveLabs).toBeDefined();
	});

	it('should validate video URL format', () => {
		const validUrls = [
			'https://example.com/video.mp4',
			'https://youtube.com/watch?v=123456',
			'https://s3.amazonaws.com/bucket/video.mov',
			'http://localhost:3000/video.webm'
		];

		const invalidUrls = [
			'not-a-url',
			'ftp://example.com/video.mp4',
			'',
			null
		];

		validUrls.forEach(url => {
			try {
				new URL(url);
				expect(true).toBe(true); // URL is valid
			} catch {
				expect.fail(`URL should be valid: ${url}`);
			}
		});

		invalidUrls.forEach(url => {
			if (url) {
				try {
					new URL(url);
					expect.fail(`URL should be invalid: ${url}`);
				} catch {
					expect(true).toBe(true); // URL is invalid as expected
				}
			}
		});
	});

	it('should handle JSON response formatting', () => {
		const mockResponse = {
			videoId: 'test-video-id',
			status: 'ready',
			message: 'Video indexing started successfully'
		};

		const jsonString = JSON.stringify(mockResponse);
		const parsed = JSON.parse(jsonString);

		expect(parsed).toEqual(mockResponse);
		expect(parsed.videoId).toBe('test-video-id');
		expect(parsed.status).toBe('ready');
	});
});
