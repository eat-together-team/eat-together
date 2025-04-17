import React from 'react'
import {Text, SafeAreaView} from "react-native";
import { Layout, TopNav} from "react-native-rapi-ui";
import MediumText from "../../components/MediumText";
import Ionicons from "react-native-vector-icons";
const Restaurant = ({navigation}) => {
  return (
    <Layout>
      {/* <TopNav
        middleContent={<MediumText>Where To Eat</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
        /> */}
      <Text>This is test</Text>
    </Layout>
  )
}

export default Restaurant
