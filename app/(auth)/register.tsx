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

const Register = () => {
  const emailRef = useRef("")
  const nameRef = useRef("")
  const passwordRef = useRef("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register: registerUser } = useAuth()

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert('Sign up','Please fill all the fields')
      return
    }
    setIsLoading(true)
    const res = await registerUser(
      emailRef.current,
      passwordRef.current,
      nameRef.current
    )
    console.log("register result", res)
    setIsLoading(false)
    if (!res.success) {
      Alert.alert('Sign up',res.msg)
    }
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/*back button*/}
        <BackButton iconSize={28}/>

        <View style={{gap: 5, marginTop: spacingY._20}}>
          <Typography size={30} fontWeight={'800'}>Let&#39;s, </Typography>
          <Typography size={30} fontWeight={'800'}>Get Started</Typography>
        </View>

        {/*form*/}
        <View style={styles.form}>
          <Typography size={16} color={colors.textLighter}>Create an account to track your finances</Typography>
          <Input
            placeholder={'Enter Your Name'}
            onChangeText={(text) => nameRef.current = text}
            icon={
              <Icons.User
                color={colors.neutral300}
                size={verticalScale(26)}
                weight='fill'
              />
            }
          />
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

          <Button loading={isLoading} onPress={handleSubmit}>
            <Typography size={21} fontWeight={'700'} color={colors.black}>Sign up</Typography>
          </Button>
        </View>

        {/*footer*/}
        <View style={styles.footer}>
          <Typography size={15}>Already have an account?</Typography>
          <Pressable onPress={() => router.navigate('/(auth)/login')}>
            <Typography size={15} fontWeight={'700'} color={colors.primary}>Login</Typography>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Register

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
