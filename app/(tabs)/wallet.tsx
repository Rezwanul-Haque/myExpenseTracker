import { StyleSheet } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typography from '@/components/Typography'
import { colors } from '@/constants/theme'

const Wallet = () => {
  return (
    <ScreenWrapper style={{backgroundColor: colors.black}}>
      <Typography>
        Wallet
      </Typography>
    </ScreenWrapper>
  )
}

export default Wallet

const styles = StyleSheet.create({})
