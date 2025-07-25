export interface IconProps {
  size?: number;
  color?: string;
}

export interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export interface MenuItem {
  id: number;
  title: string;
  icon: React.ComponentType<IconProps>;
}

export interface SettingItem {
  id: number;
  title: string;
  icon: React.ComponentType<IconProps>;
  action: string;
}

export interface HomeScreenProps {
  userInfo: UserInfo;
  onLogout: () => void;
}

export interface SettingsScreenProps {
  userInfo: UserInfo;
  onLogout: () => void;
}
