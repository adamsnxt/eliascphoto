declare module "react-rating-stars-component" {
  import * as React from "react";

  interface ReactStarsProps {
    count?: number;
    value?: number;
    edit?: boolean;
    size?: number;
    isHalf?: boolean;
    color?: string;
    activeColor?: string;
    a11y?: boolean;
    onChange?: (newRating: number) => void;
  }

  const ReactStars: React.FC<ReactStarsProps>;

  export default ReactStars;
}
