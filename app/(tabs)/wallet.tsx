import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import {
  colors,
  radius,
  spacingX,
  spacingY
} from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Typography from '@/components/Typography'
import Icons from '@/assets/icons'
import { useRouter } from 'expo-router'
import { useFetchData } from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import {
  orderBy,
  where
} from '@firebase/firestore'
import { useAuth } from '@/contexts/authContext'
import Loading from '@/components/Loading'
import WalletListItem from '@/components/WalletListItem'

const Wallet = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { data: wallets, loading, error } = useFetchData<WalletType>(
    'wallets',
    [
      where('uid', '==', user?.uid),
      orderBy('created', 'desc'),
    ]
  )

  const getTotalBalance = () => 
    wallets.reduce((total, wallet) => {
      return total + (wallet.amount || 0)
    }, 0)


  return (
    <ScreenWrapper style={{backgroundColor: colors.black}}>
      <View style={styles.container}>
        {/*balance view*/}
        <View style={styles.balanceView}>
          <View style={{alignItems: 'center'}}>
            <Typography size={45} fontWeight={'500'}>
              ${getTotalBalance()?.toFixed(2)}
            </Typography>
            <Typography size={16} color={colors.neutral300}>Total Balance</Typography>
          </View>
        </View>

        {/*wallets*/}
        <View style={styles.wallets}>
          {/*header*/}
          <View style={styles.flexRow}>
            <Typography size={20} fontWeight={'500'}>My Wallets</Typography>
            <TouchableOpacity onPress={() => router.push('/(modals)/walletModal')}>
              <Icons.PlusCircle
                weight={'fill'}
                size={verticalScale(33)}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {loading && <Loading />}
          <FlatList
            data={wallets}
            renderItem={({item, index}) => {
              return <WalletListItem item={item} index={index} router={router} />
            }}
            contentContainerStyle={styles.listStyle}
          />
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Wallet

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  balanceView: {
    height: verticalScale(160),
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._10
  },
  wallets: {
    flex: 1,
    backgroundColor: colors.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25,
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
})
