import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex h-16 bg-gray-100 justify-center gap-10 w-full">
      <ul className="flex items-center border-3 w-full justify-center">
        <Link href="/">
          <li className="text-xl text-left">Home</li>
        </Link>
        <div className="flex gap-4 ml-auto pr-10">
          <Link href="/signup">
            <li className="text-xl pr-4">Sign Up</li>
          </Link>
          <Link href="/login">
            <li className="text-xl">Login</li>
          </Link>
        </div>
      </ul>
    </nav>
  );
}