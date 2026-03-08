import { Platform } from "react-native";

export const FONTS = {
    regular: Platform.select({
        ios:"System",
        android: "Roboto"
    }), 
    bold: Platform.select({
        ios: "System",
        android: "Roboto"
    }),
}

export const SIZES = {
    small: 12,
    medium: 16,
    large: 20,
    title: 28
}