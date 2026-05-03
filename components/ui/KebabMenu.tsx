//components/ui/KebabMenu.tsx
//・・・をクリックした後に出るメニューの共通コンポーネント
"use client";

//useEffect：画面が表示された時や閉じた時に実行したい処理。useRef：画面上の要素を指し示すための目印。useState:メニューが開いてるか閉じてるかの状態を管理する

import { useEffect, useRef, useState } from "react";
type Props = {
  children: React.ReactNode;
};

export default function KebabMenu({ children }: Props) {
  const [open, setOpen] = useState(false);//メニューが開いてるか閉じてるかの状態を管理するためのstate。初期値はfalse（閉じている）
  const rootRef = useRef<HTMLDivElement>(null);//このコンポーネントのルート要素を指し示すための目印

  useEffect(() => {//画面が開いたり閉じたりする時に実行されることをいかに記す
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;//もし目印がまだ画面上に存在していないなら何もしない
      if (!rootRef.current.contains(event.target as Node)) {//もしクリックされた場所がこのコンポーネントの中じゃなかったら
        setOpen(false);//メニューを閉じる
      }
    }

    document.addEventListener("mousedown", handleClickOutside);//・・・をクリックされたときにhandleClickOutside関数を呼び出す
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);//このコンポーネントが画面から消えるときに、クリックされたときのhandleClickOutside関数を削除する（これにより、・・・のプルダウンが閉じているときに他の場所をクリックしてもエラーが出なくなる）
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-md border hover:bg-gray-50 transition-colors"
      >
        <span className="mb-1.5 text-lg font-bold">...</span>
      </button>

{open && (
  <>
    {/* ▼ 透明な壁を追加：画面全体を覆い、クリックをここで食い止める */}
    <div 
      className="fixed inset-0 z-30 bg-transparent" 
      onClick={() => setOpen(false)} 
    />

    {/* ▼ メニュー本体：z-indexを壁より高くする */}
    <div className="absolute right-0 top-12 z-40 min-w-44 rounded-md border bg-white p-2 shadow">
      {children}
    </div>
  </>
)}
    </div>
  );
}