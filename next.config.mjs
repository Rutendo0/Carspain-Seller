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
        ],
    },
};

export default nextConfig;
