import Link from 'next/link';

function Header({ currentUser }) {
  const links = [
    currentUser && { label: 'Sell Ticket', href: '/tickets/create' },
    currentUser && { label: 'My Orders', href: '/orders' },
    currentUser && { label: 'Sign out', href: '/auth/signout' },
    !currentUser && { label: 'Sign in', href: '/auth/signin' },
    !currentUser && { label: 'Sign up', href: '/auth/signup' },
  ].filter(link => link).map(link => (
    <li
      key={link.href}
      className="nav-item"
    >
      <Link href={link.href}>
        <a className="nav-link">{link.label}</a>
      </Link>
    </li>
  ));

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTix</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {links}
        </ul>
      </div>
    </nav>
  );
}

export default Header;
