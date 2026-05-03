// next.config.ts
//Next.jsというシステム全体の『設定書』(外部の人はどこまで入っていいか（画像の設定）やファイルサイズの制限などを設定する)
import type { NextConfig } from "next";//外部からの情報に対するセキュリティチェック

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [//リクエスト先の住所がこのコードにのっているかのチェックを行う（のっていないところからのリクエストは悪意があると判断してはじく）
      {
        protocol: 'http',
        hostname: '127.0.0.1', // ここを .env.local と完全に一致させる
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
