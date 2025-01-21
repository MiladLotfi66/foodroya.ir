import withPWAInit from "@ducanh2912/next-pwa";
import CompressionPlugin from 'compression-webpack-plugin';

const nextConfig = {
  images: {
    domains: ['c716244.parspack.net'], // افزودن دامنه مورد نظر
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  output: "standalone",
  
  
  webpack: (config, { isServer }) => {
    // Only add compression plugin for the client-side bundle
    if (!isServer) {
      config.plugins.push(
        new CompressionPlugin({
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg|ico|json|png|jpg|jpeg)$/,
          compressionOptions: {
            level: 11,
          },
          threshold: 10240,
          minRatio: 0.8,
        })
      );

      config.plugins.push(
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg|ico|json|png|jpg|jpeg)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }

    return config;
  },
};

export default withPWAInit({
  dest: "public",
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
