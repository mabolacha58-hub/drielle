import * as React from "react";

type InputProps = React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return <input ref={ref} type={type} className={className} {...props} />;
  }
);

Input.displayName = "Input";

export { Input };

