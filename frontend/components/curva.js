import Svg, {Path} from "react-native-svg"
import { Dimensions } from "react-native"
import colorPalette from "../constant/colorPalette"

const {width} = Dimensions.get("window")

export default function Curva (){
    return(
         <Svg width={width} 
            height={60} 
            viewBox={`0 0 ${width} 60`} 
            style={{position:"absolute", bottom:-1}}>
                <Path
                  d={`
                    M0, 60
                    Q${width/2}, 0 ${width}, 60
                    L${width}, 60
                    L0, 60
                    Z
                    `
                  }
                  fill={colorPalette.blanco}
                />
        
        
              </Svg>
    )
}