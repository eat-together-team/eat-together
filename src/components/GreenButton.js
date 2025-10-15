import { TouchableOpacity, Image } from "react-native"
import GreenCircle from '../../assets/GreenButton.png'

const GreenButton = (props) => {
  return (
    <TouchableOpacity onPress={props.onPress} disabled = {props.disabled? props.disabled: false} >
        <Image source ={GreenCircle} style = {props.style}/>
    </TouchableOpacity>
  )
}

export default GreenButton
