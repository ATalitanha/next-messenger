import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { ModeToggle } from './ModeToggle';

export default function Header() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Secure Messenger</h1>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="space-x-4">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
