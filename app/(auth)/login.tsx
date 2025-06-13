import BackButton from '@/components/BackButton'
import ScreenWrapper from '@/components/ScreenWrapper'
import {
  colors,
  spacingX,
  spacingY
} from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import React, {
  useRef,
  useState
} from 'react'
import {
  Alert,
  Pressable,
  StyleSheet,
  View
} from 'react-native'
import Typography from '@/components/Typography'
import Input from '@/components/Input'
import Icons from '@/assets/icons'
import Button from '@/components/Button'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/authContext'

const Login = () => {
  const emailRef = useRef("")
  const passwordRef = useRef("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login: loginUser } = useAuth()

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login','Please fill all the fields')
      return
    }

    setIsLoading(true)
    const res = await loginUser(emailRef.current, passwordRef.current)
    console.log("login result", res)
    setIsLoading(false)
    if (!res.success) {
      Alert.alert('Login',res.msg)
    }

  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/*back button*/}
        <BackButton iconSize={28}/>

        <View style={{gap: 5, marginTop: spacingY._20}}>
          <Typography size={30} fontWeight={'800'}>Hey, </Typography>
          <Typography size={30} fontWeight={'800'}>Welcome Back</Typography>
        </View>

        {/*form*/}
        <View style={styles.form}>
          <Typography size={16} color={colors.textLighter}>Login now to track your finances</Typography>
          <Input
            placeholder={'Enter Your Email'}
            onChangeText={(text) => emailRef.current = text}
            icon={
              <Icons.At
                color={colors.neutral300}
                size={verticalScale(26)}
                weight='fill'
              />
            }
          />
          <Input
            placeholder={'Enter Your Password'}
            secureTextEntry
            onChangeText={(text) => passwordRef.current = text}
            icon={
              <Icons.Lock
                color={colors.neutral300}
                size={verticalScale(26)}
                weight='fill'
              />
            }
          />

          <Typography size={14} color={colors.text} style={{alignSelf: 'flex-end'}}>Forgot Password?</Typography>

          <Button loading={isLoading} onPress={handleSubmit}>
            <Typography size={21} fontWeight={'700'} color={colors.black}>Login</Typography>
          </Button>
        </View>

        {/*footer*/}
        <View style={styles.footer}>
          <Typography size={15}>Don&#39;t have an account?</Typography>
          <Pressable onPress={() => router.navigate('/(auth)/register')}>
            <Typography size={15} fontWeight={'700'} color={colors.primary}>Sign Up</Typography>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: 'bold',
    color: colors.text
  },
  form: {
    gap: spacingY._20
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: '500',
    color: colors.text
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5
  },
  footerText: {
    textAlign: 'center',
    fontSize: verticalScale(15),
    color: colors.text
  }
})
