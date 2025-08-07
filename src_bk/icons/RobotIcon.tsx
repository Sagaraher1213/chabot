import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from '../../types';

const RobotIcon: React.FC<IconProps> = ({ size = 20, color = '#333' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H7C5.9 3 5 3.9 5 5V9C5 10.1 5.9 11 7 11H9V13H7V20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20V13H15V11H17C18.1 11 19 10.1 19 9V5C19 3.9 18.1 3 17 3H15V1H21V9Z"
      fill={color}
    />
  </Svg>
);

export default RobotIcon;