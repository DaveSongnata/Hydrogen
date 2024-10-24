import React from 'react';
import { Image } from 'react-native';

const iconMap = {
  // Mapeie seus ícones aqui
  'water-drop': require('../../assets/icons/water-drop.png'),
  'chart': require('../../assets/icons/chart.png'),
  'add': require('../../assets/icons/add.png'),
  'edit': require('../../assets/icons/edit.png'),
  'delete': require('../../assets/icons/delete.png'),
  'check': require('../../assets/icons/check.png'),
  'back': require('../../assets/icons/back.png'),
  'menu': require('../../assets/icons/menu.png'),
  'home': require('../../assets/icons/home.png'),
  'settings': require('../../assets/icons/settings.png'),
  
  'arrow-down': require('../../assets/icons/arrow-down.png'),
  'arrow-up': require('../../assets/icons/arrow-up.png'),
  'chevron-down': require('../../assets/icons/chevron-down.png'),
  'chevron-up': require('../../assets/icons/chevron-up.png'),
  

  'task-add': require('../../assets/icons/task-add.png'),
  'action-add': require('../../assets/icons/action-add.png'),
};

const CustomIcon = ({ name, size = 24, color, style }) => {
  const icon = iconMap[name];
  if (!icon) {
    console.warn(`Ícone "${name}" não encontrado: ${name}`);
    return null;
  }

  return (
    <Image
      source={icon}
      style={[
        {
          width: size,
          height: size,
          tintColor: color,
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  );
};

export default CustomIcon;
