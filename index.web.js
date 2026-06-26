import { AppRegistry } from 'react-native';
import App from './src/App';
import appJson from './app.json';

// Suppress react-native-web SVG responder warnings in browser console
const ignoreWarns = ['onStartShouldSetResponder', 'onResponder', 'Unknown event handler property'];
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && ignoreWarns.some(w => args[0].includes(w))) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && ignoreWarns.some(w => args[0].includes(w))) {
    return;
  }
  originalError(...args);
};

// Inject Ionicons font stylesheet dynamically for Web
import ioniconsFont from 'react-native-vector-icons/Fonts/Ionicons.ttf';

const iconFontStyles = `
@font-face {
  font-family: 'Ionicons';
  src: url(${ioniconsFont}) format('truetype');
}
`;

const style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
  style.styleSheet.cssText = iconFontStyles;
} else {
  style.appendChild(document.createTextNode(iconFontStyles));
}
document.head.appendChild(style);

const appName = appJson.name;

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
