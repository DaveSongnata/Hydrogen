import { DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#E3F2FD',
    surface: '#FFFFFF',
    text: '#212121',
    placeholder: '#9E9E9E',
    error: '#F44336',
  },
  roundness: 8,
};

// Remova todas as propriedades de sombra e elevação
const removeShadeProps = (obj) => {
  for (let prop in obj) {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      removeShadeProps(obj[prop]);
    }
  }
  delete obj.elevation;
  delete obj.shadowColor;
  delete obj.shadowOffset;
  delete obj.shadowOpacity;
  delete obj.shadowRadius;
};

removeShadeProps(theme);

export default theme;
