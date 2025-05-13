import Link from "next/link";
import Image from "next/image";

const Nav = () => {
  return (
    <nav className="w-full h-16 flex items-center px-5 bg-background shadow-sm">
      <Link
        href="/"
        title="liangerwen's ☻ 微图床"
        className="no-underline font-bold text-[1.3em] opacity-90 hover:text-inherit hover:opacity-100 inline-flex gap-2 items-center"
      >
        <Image
          width={36}
          height={36}
          src="/favicon.ico"
          alt="liangerwen's ☻ 微图床"
        />
        liangerwen&apos;s ☻ 微图床
      </Link>
    </nav>
  );
};

export default Nav;
