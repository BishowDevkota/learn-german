import * as React from "react";

/**
 * Minimal `asChild` Slot: merges the component's props/ref onto its single
 * child element. Avoids pulling in an extra Radix dependency.
 */
export const Slot = React.forwardRef<HTMLElement, { children?: React.ReactNode } & Record<string, unknown>>(
  function Slot({ children, ...props }, ref) {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;

    return React.cloneElement(child, {
      ...props,
      ...childProps,
      className: [
        (props as { className?: string }).className,
        (childProps as { className?: string }).className,
      ]
        .filter(Boolean)
        .join(" "),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref,
    } as Record<string, unknown>);
  }
);
