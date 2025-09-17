/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "firebasestorage.googleapis.com",
            },
            {
                hostname: "s3.amazonaws.com",
            },
            {
                hostname: "dz310nzuyimx0.cloudfront.net",
            },
            {
                hostname: "image-cdn.beforward.jp",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                'node:process': 'process',
            };
        }
        return config;
    },
};

export default nextConfig;
