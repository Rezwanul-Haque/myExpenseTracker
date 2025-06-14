import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import React, {
  useEffect,
  useState
} from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import {
  orderBy,
  where
} from '@firebase/firestore'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

import {
  colors,
  radius,
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
import {
  TransactionType,
  WalletType
} from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import {
  useLocalSearchParams,
  useRouter
} from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import Icons from '@/assets/icons'
import {
  expenseCategories,
  transactionTypes
} from '@/constants/data'
import { useFetchData } from '@/hooks/useFetchData'
import Input from '@/components/Input'
import {
  createOrUpdateTransaction,
  deleteTransaction
} from '@/services/transactionService'

const TransactionModal = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [transaction, setTransaction] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    date: new Date(),
    walletId: '',
    image: null,
  })
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const { data: wallets, loading: walletLoading, error: walletError } = useFetchData<WalletType>(
    'wallets',
    [
      where('uid', '==', user?.uid),
      orderBy('created', 'desc'),
    ]
  )

  type ParamType = {
    id?: string;
    type: string;
    amount: string;
    category?: string;
    date: string;
    description?: string;
    image?: any;
    uid?: string;
    walletId: string;
  }
  const oldTransaction: ParamType = useLocalSearchParams()

  const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || transaction.date
    setTransaction({ ...transaction, date: currentDate })
    setShowDatePicker(Platform.OS === 'ios')
  }

  useEffect(
    () => {
      if (oldTransaction?.id) {
        setTransaction({
          type: oldTransaction.type,
          amount: Number(oldTransaction.amount),
          category: oldTransaction.category,
          date: new Date(oldTransaction.date),
          description: oldTransaction.description,
          image: oldTransaction.image,
          uid: oldTransaction.uid,
          walletId: oldTransaction.walletId
        })
      }
    },
    []
  )

  const onSubmit = async () => {
    const { type, amount, description, category, date, walletId, image } = transaction
    if (!walletId || !amount || !date || (type === 'expense' && !category)) {
      Alert.alert('Transaction', 'Please fill all the required fields')
      return
    }

    const transactionData: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image: image ? image : null,
      uid: user?.uid
    }

    if (oldTransaction?.id) transactionData.id = oldTransaction.id
    setLoading(true)
    const res = await createOrUpdateTransaction(transactionData)
    setLoading(false)
    if (res.success) {
      router.back()
    } else {
      Alert.alert('Transaction', res.msg)
    }
  }

  const onDelete = async () => {
    if (!oldTransaction?.id) return
    setLoading(true)
    const res = await deleteTransaction(
      oldTransaction?.id,
      oldTransaction?.walletId,
      )
    setLoading(false)
    if (res.success) {
      router.back()
    } else {
      Alert.alert('Transaction', res.msg)
    }
  }

  const showDeleteAlert = () => {
    Alert.alert('Confirm', 'Are you sure you want to delete this transaction?', [
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
          title={oldTransaction?.id ? 'Update Transaction' : 'New Transaction'}
          leftIcon={<BackButton />}
          style={{
            marginBottom: spacingY._10
          }}
        />
        {/*form*/}
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {/*transaction type*/}
          <View style={styles.inputContainer}>
            <Typography color={colors.neutral200} size={16}>Type</Typography>
            <Dropdown
              style={styles.dropDownContainer}
              activeColor={colors.neutral700}
              selectedTextStyle={styles.dropDownSelectedText}
              containerStyle={styles.dropDownListContainer}
              itemContainerStyle={styles.dropDownItemContainer}
              itemTextStyle={styles.dropDownItemText}
              iconStyle={styles.dropDownIcon}
              data={transactionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={transaction.type}
              onChange={item => {
                setTransaction({
                  ...transaction,
                  type: item.value
                })
              }}
            />
          </View>

          {/*wallet inputs*/}
          <View style={styles.inputContainer}>
            <Typography color={colors.neutral200} size={16}>Wallets</Typography>
            <Dropdown
              style={styles.dropDownContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropDownPlaceholder}
              selectedTextStyle={styles.dropDownSelectedText}
              containerStyle={styles.dropDownListContainer}
              itemContainerStyle={styles.dropDownItemContainer}
              itemTextStyle={styles.dropDownItemText}
              iconStyle={styles.dropDownIcon}
              data={wallets.map(wallet => ({
                label: `${wallet?.name} ($${wallet?.amount})`,
                value: wallet?.id
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={"Select Wallet"}
              value={transaction.walletId}
              onChange={item => {
                setTransaction({
                  ...transaction,
                  walletId: item.value || ''
                })
              }}
            />
          </View>

          {/*expense categories*/}
          {
            transaction.type === 'expense' && (
              <View style={styles.inputContainer}>
                <Typography color={colors.neutral200} size={16}>Expense Category</Typography>
                <Dropdown
                  style={styles.dropDownContainer}
                  activeColor={colors.neutral700}
                  placeholderStyle={styles.dropDownPlaceholder}
                  selectedTextStyle={styles.dropDownSelectedText}
                  containerStyle={styles.dropDownListContainer}
                  itemContainerStyle={styles.dropDownItemContainer}
                  itemTextStyle={styles.dropDownItemText}
                  iconStyle={styles.dropDownIcon}
                  data={Object.values(expenseCategories)}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={"Select Expense Category"}
                  value={transaction.category}
                  onChange={item => {
                    setTransaction({
                      ...transaction,
                      category: item.value || ''
                    })
                  }}
                />
              </View>
            )
          }

          {/*Date Picker*/}
          <View style={styles.inputContainer}>
            <Typography color={colors.neutral200} size={16}>Date</Typography>
            {
              !showDatePicker && (
                <Pressable
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Typography
                    size={14}
                    color={colors.neutral400}
                    textProps={{numberOfLines: 1}}
                  >
                    {(transaction.date as Date).toLocaleDateString()}
                  </Typography>
                </Pressable>
              )
            }

            {
              showDatePicker && (
                <View style={Platform.OS === 'ios' && styles.iosDatePicker}>
                  <DateTimePicker
                    themeVariant="dark"
                    value={(transaction.date as Date) || new Date()}
                    textColor={colors.white}
                    mode='date'
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                  />

                  {
                    Platform.OS === 'ios' && (
                      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(false)}>
                        <Typography size={15} fontWeight={'500'}>Ok</Typography>
                      </TouchableOpacity>
                    )
                  }
                </View>
              )
            }
          </View>

          {/*amount*/}
          <View style={styles.inputContainer}>
            <Typography color={colors.neutral200} size={16}>Amount</Typography>
            <Input
              // placeholder='Salary'
              keyboardType={'numeric'}
              value={transaction.amount?.toString()}
              onChangeText={(value) => {
                setTransaction({
                  ...transaction,
                  amount: Number(value.replace(/[^0-9]/g, ''))
                })
              }}
            />
          </View>

          {/*description*/}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typography size={16} color={colors.neutral200}>Description</Typography>
              <Typography size={14} color={colors.neutral500}>(optional)</Typography>
            </View>
            <Input
              // placeholder='Salary'
              value={transaction.description}
              multiline
              containerStyle={{
                flexDirection: 'row',
                height: verticalScale(100),
                alignItems: 'flex-start',
                paddingVertical: 15,
              }}
              onChangeText={(value) => {
                setTransaction({
                  ...transaction,
                  description: value
                })
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typography size={16} color={colors.neutral200}>Receipt</Typography>
              <Typography size={14} color={colors.neutral500}>(optional)</Typography>
            </View>
            <ImageUpload
              file={transaction.image}
              onSelect={(file) => {
                setTransaction({
                  ...transaction,
                  image: file
                })
              }}
              onClear={() => {
                setTransaction({
                  ...transaction,
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
          oldTransaction?.id && !loading && (
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
            {oldTransaction?.id ? 'Update' : "Submit"}
          </Typography>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default TransactionModal

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20
  },
  form: {
    gap: spacingY._20,
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  inputContainer: {
    gap: spacingY._10
  },
  iosDropDown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(54),
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15
  },
  androidDropDown: {
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(54),
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    // paddingHorizontal: spacingX._15
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  },
  dateInput: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15,
  },
  iosDatePicker: {
    // blackgroundColor: colors.rose
  },
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: 'flex-end',
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10
  },
  dropDownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15,
  },
  dropDownItemText: {
    color: colors.white,
  },
  dropDownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropDownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropDownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    borderColor: colors.neutral500,
    paddingVertical: spacingY._7,
    top: 5,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5
  },
  dropDownPlaceholder: {
    color: colors.white
  },
  dropDownIconContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropDownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
})
