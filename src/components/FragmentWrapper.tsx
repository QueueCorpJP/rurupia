import { ReactNode } from 'react';

interface FragmentWrapperProps {
  children: ReactNode;
  index: number; // To properly handle the key prop
}

/**
 * A wrapper component that can be used in place of React.Fragment
 * when we need to intercept props being passed to fragments from
 * development tools or other utilities.
 */
const FragmentWrapper = ({ children, index }: FragmentWrapperProps) => {
  // Using a span with "contents" display style will make it behave like a fragment
  // but it can accept props like data-lov-id that fragments can't
  return (
    <span style={{ display: 'contents' }} key={index}>
      {children}
    </span>
  );
};

export default FragmentWrapper; 