import {
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import React, { useState } from 'react'
import {
  colors,
  spacingY
} from '@/constants/theme'
import ModalWrapper from '@/components/ModalWrapper'
import Header from '@/components/Header'
import BackButton from '@/components/BackButton'
import Input from '@/components/Input'
import { useAuth } from '@/contexts/authContext'
import {
  orderBy,
  where
} from '@firebase/firestore'
import { useFetchData } from '@/hooks/useFetchData'
import { TransactionType } from '@/types'
import TransactionList from '@/components/TransactionList'

const SearchModal = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const constraints = [
    where('uid', '==', user?.uid),
    orderBy('date', 'desc'),
  ]

  const { data: allTransactions, loading: transactionsLoading } = useFetchData<TransactionType>(
    'transactions',
    constraints
  )

  const filteredTransactions = allTransactions.filter((transaction) => {
    if (search.length > 1) {
      return !!(
        transaction?.category?.toLowerCase()
                   .includes(search?.toLowerCase())
        ||
        transaction?.type?.toLowerCase()
                   .includes(search?.toLowerCase())
        ||
        transaction?.description?.toLowerCase()
                   .includes(search?.toLowerCase())
      );
    }
    return true
  })

  return (
    <ModalWrapper style={{backgroundColor: colors.neutral900}}>
      <View style={styles.container}>
        <Header
          title={'Search'}
          leftIcon={<BackButton />}
          style={{
            marginBottom: spacingY._10
          }}
        />
        {/*form*/}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Input
              placeholder='Search...'
              value={search}
              placeholderTextColor={colors.neutral400}
              containerStyle={{
                backgroundColor: colors.neutral800
              }}
              onChangeText={(value) => {
                setSearch(value)
              }}
            />
          </View>

          <View>
            <TransactionList
              data={filteredTransactions}
              loading={transactionsLoading}
              emptyListMessage={'No transactions match your search query'}
            />
          </View>

        </ScrollView>
      </View>
    </ModalWrapper>
  )
}

export default SearchModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingY._20,
    // paddingVertical: spacingY._30
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  inputContainer: {
    gap: spacingY._10
  }
})
