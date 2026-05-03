//middleware.ts
//ミドルウェアのファイル。ユーザーのログイン状態によってアクセスできるページを制限するための処理を行う

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";


const PROTECTED_PATHS = [
  "/works",
  "/generated",
  "/likes",
  "/settings",
];

//明示的に/works/new や /works/[id]/edit も自分専用ページだから守りたいという意味でisProtectedPath関数を作っている（今後必要なければ消してもいい）
function isProtectedPath(pathname: string) {//保護されたページかを判定する関数
  if (
    pathname === "/works/new" ||//新規記事作成ページは保護ページに追加
    pathname.startsWith("/works/") //記事編集ページも保護ページに追加
  ) {
    return true;
  }

  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));//PROTECTED_PATHSの中のどれかと完全に一致するか、もしくはそのパスで始まるかを判定する。これにより、/worksや/works/123のような記事編集ページなども保護されたページとして扱うことができるようになる
}

export async function middleware(request: NextRequest) {//ミドルウェアのメイン関数。ユーザーのログイン状態によってアクセスできるページを制限するための処理を行う
  let response = NextResponse.next({//リクエストヘッダーを次の処理に渡すための設定。これにより、ミドルウェアでユーザーのログイン状態を確認した後も、次の処理でユーザー情報を取ることができるようになる
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(//サーバー用のsupabaseクライアントを作成する。これにより、ミドルウェアの中でユーザーのログイン状態を確認することができるようになる
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();//サーバーへのリクエストについてきたクッキーを取得しログイン状況を確認する
        },
        setAll(cookiesToSet) {//アクセストークンの有効期限が切れそうな場合、新しいクッキーを作成・保存してという指示（DBに送る）。これにより、ユーザーがログインしたままページを見続けることができるようになる
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

   // 1. まずサーバー用のsupabaseクライアントでユーザーを確認する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;//リクエストされたURLのパスを取得する。これにより、どのページにアクセスしようとしているのかがわかる

  // ２.ログイン済みならトップへ飛ばす処理を追加する
if (user && pathname === "/login") {//もしユーザーがログインしていて、アクセスしようとしているページがログインページ（/login）だったら
  const url = request.nextUrl.clone();//リクエストされたURLを複製する。これにより、元のURLを変更せずにリダイレクト先のURLを作ることができる
  url.pathname = "/";//リダイレクト先のURLのパスをトップページ（/）にする。これにより、ログイン済みのユーザーがログインページにアクセスしようとしたときにトップページへ飛ばされるようになる
  response = NextResponse.redirect(url); // ここで再代入が発生するので let が必要になる
}

  // 3. 未ログインなら保護されたページから追い返す
  if (!user && isProtectedPath(pathname)) {//もしユーザーがログインしていなくて、アクセスしようとしているページが保護されたページだったら
    const url = request.nextUrl.clone();//リクエストされたURLを複製する。これにより、元のURLを変更せずにリダイレクト先のURLを作ることができる
    url.pathname = "/login";//リダイレクト先のURLのパスをログインページ（/login）にする。これにより、未ログインのユーザーが保護されたページにアクセスしようとしたときにログインページへ飛ばされるようになる
    return NextResponse.redirect(url);//ここでリダイレクトする。これにより、未ログインのユーザーが保護されたページにアクセスしようとしたときにログインページへ飛ばされるようになる
  }

  return response;
}

export const config = {//ミドルウェアをどのパスに適用するかを指定する。これにより、指定したパスへのアクセスがあったときにこのミドルウェアが実行されるようになる
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