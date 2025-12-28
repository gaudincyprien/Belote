// Fix for React 19 compatibility with react-icons
declare module 'react-icons/fa' {
  import { ComponentType, SVGProps } from 'react';

  export const FaPlus: ComponentType<SVGProps<SVGSVGElement>>;
  export const FaHistory: ComponentType<SVGProps<SVGSVGElement>>;
  export const FaChartBar: ComponentType<SVGProps<SVGSVGElement>>;
  export const FaCog: ComponentType<SVGProps<SVGSVGElement>>;
  export const FaTimes: ComponentType<SVGProps<SVGSVGElement>>;
  export const FaArrowLeft: ComponentType<SVGProps<SVGSVGElement>>;
  export const FaPlay: ComponentType<SVGProps<SVGSVGElement>>;
}
