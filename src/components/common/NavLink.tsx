import React from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';

// This allows className to be either a string or a function that returns a string
type ClassNameProp = 
  | string 
  | ((props: { isActive: boolean }) => string);

type NavLinkProps = Omit<React.ComponentPropsWithoutRef<typeof RouterNavLink>, 'className'> & { 
  to: string;
  className?: ClassNameProp;
};

/**
 * A wrapper around React Router's NavLink that handles both hash and browser routing.
 * This component detects if the app is running in hash routing mode (on Vercel or when hash is in URL)
 * and adjusts the links accordingly. It also supports the isActive pattern from React Router's NavLink.
 */
const NavLink = ({ to, className, children, ...props }: NavLinkProps) => {
  // Check if we're on Vercel or using hash routing
  const isHashRouter = window.location.href.includes('/#/') || 
                      window.location.hostname.includes('vercel.app');
  
  // Format the URL properly for the current routing mode
  const formattedTo = isHashRouter && !to.startsWith('/#') && to !== '/'
    ? `/#${to}` 
    : to;
  
  return (
    <RouterNavLink to={formattedTo} className={className} {...props}>
      {children}
    </RouterNavLink>
  );
};

export default NavLink; 