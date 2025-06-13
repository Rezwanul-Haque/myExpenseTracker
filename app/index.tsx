import { colors } from '@/constants/theme'
import {
  Image,
  StyleSheet,
  View
} from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'

const Index = () => {
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      router.push('/(auth)/welcome')
    }, 2000)
  }, [])

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        resizeMode={'contain'}
        source={require('../assets/images/splashImage.png')}
      />
    </View>
  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral900,
  },
  image : {
    height: '20%',
    aspectRatio: 1
  }
})
