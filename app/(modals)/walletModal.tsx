import {
  Alert,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import React, {
  useEffect,
  useState
} from 'react'
import {
  colors,
  spacingX,
  spacingY
} from '@/constants/theme'
import {
  scale,
  verticalScale
} from '@/utils/styling'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import Typography from '@/components/Typography'
import Input from '@/components/Input'
import { WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import {
  useLocalSearchParams,
  useRouter
} from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import {
  createOrUpdateWallet,
  deleteWallet
} from '@/services/walletService'
import Icons from '@/assets/icons'

const WalletModal = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [wallet, setWallet] = useState<WalletType>({
    name: "",
    image: null
  })
  const [loading, setLoading] = useState(false)

  const oldWallet: {id: string, name: string, image: string} = useLocalSearchParams()

  useEffect(
    () => {
      if (oldWallet?.id) {
        setWallet({
          name: oldWallet.name,
          image: oldWallet.image
        })
      }
    },
    []
  )

  const onSubmit = async () => {
    const {name, image} = wallet
    if (!name.trim() || !image) {
      Alert.alert('Wallet', 'Please fill all the fields')
      return
    }

    const data: WalletType = {
      name,
      image,
      uid: user?.uid,
    }
    if (oldWallet?.id) {
      data.id = oldWallet.id
    }

    setLoading(true)
    const res = await createOrUpdateWallet(data)
    setLoading(false)

    if (res.success) {
      router.back()
    } else {
      Alert.alert('Wallet', res.msg)
    }
  }

  const onDelete = async () => {
    if (!oldWallet?.id) return
    setLoading(true)
    const res = await deleteWallet(oldWallet?.id)
    setLoading(false)
    if (res.success) {
      router.back()
    } else {
      Alert.alert('Wallet', res.msg)
    }
  }

  const showDeleteAlert = () => {
    Alert.alert('Confirm', 'Are you sure you want to delete this wallet? \nThis action will remove all the transactions related to this wallet', [
      {
        text: 'Cancel',
        onPress: () => console.log('cancel delete'),
        style: 'cancel'
      },
      {
        text: 'Delete',
        onPress: () => onDelete(),
        style: 'destructive'
      }
    ])
  }

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldWallet?.id ? 'Update Wallet' : 'New Wallet'}
          leftIcon={<BackButton />}
          style={{
            marginBottom: spacingY._10
          }}
        />
        {/*form*/}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Typography color={colors.neutral200}>Wallet Name</Typography>
            <Input
              placeholder='Salary'
              value={wallet.name}
              onChangeText={(value) => {
                setWallet({
                  ...wallet,
                  name: value
                })
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <Typography color={colors.neutral200}>Wallet Icon</Typography>
            <ImageUpload
              file={wallet.image}
              onSelect={(file) => {
                setWallet({
                  ...wallet,
                  image: file
                })
              }}
              onClear={() => {
                setWallet({
                  ...wallet,
                  image: null
                })
              }}
              placeholder='Upload Image'
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {
          oldWallet?.id && !loading && (
            <Button
              onPress={showDeleteAlert}
              style={{
                backgroundColor: colors.rose,
                paddingHorizontal: spacingX._15,
              }}
            >
              <Icons.Trash color={colors.white} size={verticalScale(24)} weight="bold" />
            </Button>
          )
        }
        <Button onPress={onSubmit} loading={loading} style={{flex: 1}}>
          <Typography color={colors.black} fontWeight={'700'}>
            {oldWallet?.id ? 'Update Wallet' : "Add Wallet"}
          </Typography>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default WalletModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingY._20,
    // paddingVertical: spacingY._30
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  inputContainer: {
    gap: spacingY._10
  }
})
