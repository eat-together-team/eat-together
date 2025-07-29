import { TouchableOpacity, Image } from "react-native"
import RedCircle from '../../assets/RedButton.png'
const RedButton = (props) => {
  return (
    <TouchableOpacity disabled = {props.disabled? props.disabled : false}>
        <Image style = {props.style} source ={RedCircle}/>
    </TouchableOpacity>
  )
}

export default RedButton
