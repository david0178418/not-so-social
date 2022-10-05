/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		browsersListForSwc: true,
		legacyBrowsers: false,
		// Enabled in preperation of release of canary feature.
		// serverComponents: true,
	},
};

module.exports = nextConfig;
