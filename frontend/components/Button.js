import { TouchableOpacity, Text } from "react-native";
import colorPalette from "../constant/colorPalette";

export default function Button ({backgroundColor, width,height, borderColor,text, colorText, fontSize, action, disabled,}){
    return(
        <TouchableOpacity style = {{
            backgroundColor:backgroundColor,
            padding:15,
            width:width,
            height:height,
            justifyContent:"center",
            alignItems:"center",
            borderRadius:15,
            shadowColor:colorPalette.negro,
            shadowOffset:{width:5, height:5},
            shadowOpacity:1,
            elevation:8,
            borderWidth:2,
            borderColor:borderColor || 0
            }}
            onPress={action}
            disabled ={disabled}
            >
                
            <Text style = {{
                color:colorText,
                fontFamily:"OutfitBold",
                fontSize:fontSize
            }}>{text}</Text>
        </TouchableOpacity>
    )
}

