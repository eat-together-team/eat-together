import { TouchableOpacity } from "react-native"
import {Ionicons} from '@expo/vector-icons';
import { useTheme } from '../rapi_ui_components';
import { colorTokens } from '../theme/colorTokens';

const BackButton = ({ onPress }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style = {{
        position:'absolute',
        top: 21,
        left: 20,
        backgroundColor: colors.background,
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent:"center",
        alignItems:'center',
      }}>
      <Ionicons name="arrow-back" size={16} color={colors.onBackground} />
    </TouchableOpacity>
  )
}
export default BackButton
