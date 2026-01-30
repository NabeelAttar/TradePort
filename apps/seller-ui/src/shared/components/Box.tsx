"use client";

import styled from "styled-components";
import React from "react";

interface BoxProps {
  css?: React.CSSProperties;
}

const Box = styled.div<BoxProps>`
  box-sizing: border-box;
`;

export default Box;
