import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/works",
  "/generated",
  "/likes",
  "/settings",
];

function isProtectedPath(pathname: string) {
  if (
    pathname === "/works/new" ||
    pathname.startsWith("/works/") // /works/[id]/edit もここで拾える
  ) {
    return true;
  }

  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

   // 1. まずユーザーを確認する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ２.ログイン済みならトップへ飛ばす処理を追加する
if (user && pathname === "/login") {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  response = NextResponse.redirect(url); // ここで再代入が発生するので let が必要になる
}

  // 3. 未ログインなら保護されたページから追い返す
  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * /login も監視対象に入れないと、ログイン済みの人をリダイレクトできない
     */

    "/login", 
    "/works/:path*",
    "/generated/:path*",
    "/likes/:path*",
    "/settings/:path*",

  ],
};