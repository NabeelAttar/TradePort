"use client";

import styled from "styled-components";
import React from "react";

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  css?: React.CSSProperties;
}

const StyledDiv = styled.div`
  box-sizing: border-box;
`;

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ css, style, ...props }, ref) => {
    const mergedStyle = {
      ...css,
      ...style,
    };
    return <StyledDiv ref={ref} style={mergedStyle} {...props} />;
  }
);

Box.displayName = "Box";

export default Box;
