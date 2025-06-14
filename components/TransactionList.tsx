import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'react'
import { FlashList } from '@shopify/flash-list'
import {
  TransactionItemProps,
  TransactionListType,
  TransactionType
} from '@/types'
import { verticalScale } from '@/utils/styling'
import {
  colors,
  radius,
  spacingX,
  spacingY
} from '@/constants/theme'
import Typography from '@/components/Typography'
import Loading from '@/components/Loading'
import {
  expenseCategories,
  incomeCategory
} from '@/constants/data'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Timestamp } from 'firebase/firestore'
import { useRouter } from 'expo-router'

const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage
}: TransactionListType) => {
  const router = useRouter()
  const handleClick = (item: TransactionType) => {
    router.push({
      pathname: '/(modals)/transactionModal',
      params: {
        id: item?.id,
        type: item?.type,
        amount: item?.amount?.toString(),
        date: (item?.date as Timestamp)?.toDate().toISOString(),
        description: item?.description,
        category: item?.category,
        image: item?.image,
        uid: item?.uid,
        walletId: item?.walletId,
      }
    })
  }
  return (
    <View style={styles.container}>
      {title && <Typography size={20} fontWeight={'500'}>{title}</Typography>}

      <View style={styles.list}>
        <FlashList
          data={data}
          renderItem={({ item, index }) =>
            <TransactionItem
              item={item}
              index={index}
              handleClick={handleClick}
            />
          }
          estimatedItemSize={60}
        />
      </View>

      {!loading && data?.length === 0 &&
        <Typography size={15} color={colors.neutral400} style={{textAlign: 'center', marginTop: spacingY._15}}>
          {emptyListMessage}
        </Typography>
      }

      {loading &&
        <View style={{top: verticalScale(100)}}>
          <Loading />
        </View>}
    </View>
  )
}

const TransactionItem = ({
  item,
  index,
  handleClick
}: TransactionItemProps) => {
  const category = item?.type === 'income' ? incomeCategory : expenseCategories[item.category!]
  const IconComponent = category.icon
  const date = (item.date as Timestamp)?.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  return (
    <Animated.View entering={FadeInDown.duration(index * 70).springify().damping(14)}>
      <TouchableOpacity style={styles.row} onPress={() => handleClick(item)}>
        {/*category icon*/}
        <View style={[styles.icon, {backgroundColor: category.bgColor}]}>
          <IconComponent
            size={verticalScale(25)}
            color={colors.white}
            weight="fill"
          />
        </View>

        {/*category description*/}
        <View style={styles.categoryDes}>
          <Typography size={17} fontWeight={'500'}>{category.label}</Typography>
          <Typography
            size={12}
            color={colors.neutral400}
            textProps={{numberOfLines: 1}}
          >
            {item?.description}
          </Typography>
        </View>

        {/*amount and date*/}
        <View style={styles.amountDate}>
          <Typography
            fontWeight={'500'}
            color={item?.type === 'income' ? colors.primary : colors.rose}
          >
            {
              `${item?.type === 'income' ? '+' : '-'} ${item?.amount}`
            }
          </Typography>
          <Typography size={13} color={colors.neutral400}>{date}</Typography>
        </View>

      </TouchableOpacity>
    </Animated.View>
  )
}

export default TransactionList

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
    // flex: 1,
    // backgroundColor: colors.rose
  },
  list: {
    minHeight: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacingX._12,
    marginBottom: spacingY._12,

    // list with a background
    backgroundColor: colors.neutral800,
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius._12,
    borderCurve: 'continuous',
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: 'center',
    gap: 3
  },
})
