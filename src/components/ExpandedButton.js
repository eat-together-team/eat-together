import { TouchableOpacity } from "react-native"
import MediumText from "./MediumText"
import {Ionicons} from '@expo/vector-icons';

const ExpandedButton = ({expanded = false, setExpanded}) => {
    
  return (
            <TouchableOpacity
                onPress={()=> setExpanded(!expanded)}
                activeOpacity={0.7}
                style = {{
                  position:'absolute', 
                  top: 21,
                  right: 20,
                  backgroundColor:'white', 
                  width: 42, 
                  height: 42,
                  borderRadius: 20,
                  display: 'flex',
                  justifyContent:"center",
                  alignItems:'center',

                }}
            >
                <MediumText style={{
                    color: '#5DB075',
                    fontSize: 22,
                    fontWeight: 'bold',
                    padding: 3,
                    
                    }}>
                        <Ionicons name={"chevron-expand"} size={22} color="#5DB075" />
                </MediumText>
            </TouchableOpacity>
  )
}

export default ExpandedButton