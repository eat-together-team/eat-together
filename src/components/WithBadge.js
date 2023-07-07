import React, { useState } from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";

import Explanation from "./Explanation";
import NormalText from "./NormalText";

const WithBadge = props => {
    const [clicked, setClicked] = useState(false);

    const ratio = props.mealsAttended / props.mealsSignedUp;

    const styles = StyleSheet.create({
        image: {
            resizeMode: 'contain',
            width: 50,
            height: 50,
            borderRadius: 100
        },
    });

    return (
        <TouchableOpacity style={{ zIndex: 100, elevation: 100 }} onPress={() => setClicked(!clicked)}>
            <>
                {props.mealsSignedUp >= 5 && ratio > 0.7 && <Image style={styles.image}
                    source={ ratio >= 0.9 ? require( "../../assets/gold.jpg") :
                            ( ratio >= 0.8 ? require( "../../assets/orange.jpg")
                                : require ( "../../assets/black.jpg") 
                            )
                        }
                    />}
                {clicked && <Explanation>
                    <NormalText center color="white">
                        {ratio >= 0.9 ? "90% attendance rate!" :
                            ( ratio >= 0.8 ? "80% attendance rate!"
                                : "70% attendance rate!"
                            )
                        }
                    </NormalText>
                </Explanation>}
            </>
        </TouchableOpacity>
    );
  }

export default WithBadge;
