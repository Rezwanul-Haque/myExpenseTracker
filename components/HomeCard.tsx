import {
  ImageBackground,
  StyleSheet,
  View
} from 'react-native'
import React from 'react'
import {
  colors,
  spacingX,
  spacingY
} from '@/constants/theme'
import {
  scale,
  verticalScale
} from '@/utils/styling'
import Typography from '@/components/Typography'
import Icons from '@/assets/icons'
import { useFetchData } from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import {
  orderBy,
  where
} from '@firebase/firestore'
import { useAuth } from '@/contexts/authContext'

const HomeCard = () => {
  const { user } = useAuth()
  const { data: wallets, loading: walletLoading, error: walletError } = useFetchData<WalletType>(
    'wallets',
    [
      where('uid', '==', user?.uid),
      orderBy('created', 'desc'),
    ]
  )

  const getTotals = () => {
    return wallets.reduce((
      totals,
      wallet
    ) => {
      totals.balance += Number(wallet.amount)
      totals.income += Number(wallet.totalIncome)
      totals.expenses += Number(wallet.totalExpenses)
      return totals
    }, { balance: 0, income: 0, expenses: 0 })
  }

  return (
    <ImageBackground
      source={require('../assets/images/card.png')}
      resizeMode='stretch'
      style={styles.bgImage}
    >
      <View style={styles.container}>
        <View>
          {/*total balance*/}
          <View style={styles.totalBalanceRow}>
            <Typography color={colors.neutral800} size={17} fontWeight={'500'}>
              Total Balance
            </Typography>
            <Icons.DotsThreeOutline
              color={colors.black}
              size={verticalScale(23)}
              weight="fill"
            />
          </View>
          <Typography color={colors.black} size={30} fontWeight={'bold'}>
            $ {walletLoading ? '----' : getTotals()?.balance?.toFixed(2)}
          </Typography>
        </View>

        {/*total expenses and incomes*/}
        <View style={styles.stats}>
          {/*incomes*/}
          <View style={{gap: verticalScale(5)}}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowDown
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typography
                size={16}
                color={colors.neutral700}
                fontWeight={'500'}
              >
                Income
              </Typography>
            </View>

            <View style={{alignItems: 'center'}}>
              <Typography
                size={17}
                color={colors.green}
                fontWeight={'600'}
              >
                $ {walletLoading ? '----' : getTotals()?.income?.toFixed(2)}
              </Typography>
            </View>
          </View>

          {/*expenses*/}
          <View style={{gap: verticalScale(5)}}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowUp
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typography
                size={16}
                color={colors.neutral700}
                fontWeight={'500'}
              >
                Expense
              </Typography>
            </View>

            <View style={{alignItems: 'center'}}>
              <Typography
                size={17}
                color={colors.rose}
                fontWeight={'600'}
              >
                $ {walletLoading ? '----' : getTotals()?.expenses?.toFixed(2)}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

export default HomeCard

const styles = StyleSheet.create({
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: '87%',
    width: '100%',
    justifyContent: 'space-between',
  },
  bgImage: {
    height: scale(210),
    width: '100%',
  },
  totalBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingY._5
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsIcon: {
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50
  },
  incomeExpense: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingY._10
  },
})
