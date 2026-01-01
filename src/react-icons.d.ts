declare module 'react-icons/fa' {
  import * as React from 'react';

  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = (props: IconBaseProps) => JSX.Element;

  export const FaUser: IconType;
  export const FaTrophy: IconType;
  export const FaFire: IconType;
  export const FaCog: IconType;
  export const FaDownload: IconType;
  export const FaUpload: IconType;
  export const FaRedo: IconType;
  export const FaCheck: IconType;
  export const FaTimes: IconType;
  export const FaArrowLeft: IconType;
  export const FaChartBar: IconType;
  export const FaPlus: IconType;
  export const FaEdit: IconType;
  export const FaTrash: IconType;
  export const FaSearch: IconType;
  export const FaUsers: IconType;
  export const FaPlay: IconType;
  export const FaHistory: IconType;
}
