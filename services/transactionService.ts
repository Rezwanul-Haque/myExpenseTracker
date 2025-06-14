import {
  ResponseType,
  TransactionType,
  WalletType,
} from '@/types'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from '@firebase/firestore'
import { firestore } from '@/config/firebase'
import { uploadFileToCloudinary } from '@/services/imageService'
import { createOrUpdateWallet } from '@/services/walletService'
import { Timestamp } from 'firebase/firestore'
import {
  getLast12Months,
  getLast7Days,
  getYearsRange
} from '@/utils/common'
import { scale } from '@/utils/styling'
import { colors } from '@/constants/theme'

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const {id, type, amount, walletId, image} = transactionData
    if (!type ||
      !amount ||
      amount <=
      0 ||
      !walletId) {
      return {
        success: false,
        msg: 'Invalid transaction data'
      }
    }
    if (id) {
      const oldTransactionSnapshot = await getDoc(
        doc(
          firestore,
          'transactions',
          id,
        )
      )
      if (!oldTransactionSnapshot.exists()) {
        return {
          success: false,
          msg: 'Transaction not found'
        }
      }
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType
      const shouldRevertOriginal = oldTransaction.type !==
        type
        ||
        oldTransaction.amount !==
        Number(amount)
        ||
        oldTransaction.walletId !==
        walletId
      if (shouldRevertOriginal) {
        const res = await revertAndUpdateWallet(
          oldTransaction,
          Number(amount),
          type,
          walletId,
        )
        if (!res.success) {
          return res
        }
      }
    } else {
      const res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type
      )
      if (!res.success) {
        return res
      }
    }

    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(
        image,
        'transactions'
      )
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg ||
            'Failed to upload receipt',
        }
      }
      transactionData.image = imageUploadRes.data
    }

    const transactionRef = id
      ? doc(
        firestore,
        'transactions',
        id
      )
      : doc(collection(
        firestore,
        'transactions'
      ))

    await setDoc(
      transactionRef,
      transactionData,
      {merge: true}
    )

    return {
      success: true,
      data: {...transactionData, id: transactionRef.id}
    }
  } catch (error: any) {
    console.log(
      'error creating or updating transaction: ',
      error
    )
    return {
      success: false,
      msg: error?.message
    }
  }
}

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string,
) => {
  try {
    const walletRef = doc(
      firestore,
      'wallets',
      walletId
    )
    const walletSnapshot = await getDoc(walletRef)
    if (!walletSnapshot.exists) {
      console.log('error updating wallet for new transaction.')
      return {
        success: false,
        msg: 'Wallet not found'
      }
    }

    const walletData = walletSnapshot.data() as WalletType
    if (type ===
      'expense' &&
      walletData.amount! -
      amount <
      0) {
      return {
        success: false,
        msg: 'Insufficient balance'
      }
    }

    const updatedType = type ===
    'income' ? 'totalIncome' : 'totalExpenses'
    const updatedWalletAmount = type ===
    'income' ?
      Number(walletData.amount) +
      amount :
      Number(walletData.amount) -
      amount

    const updatedTotals = type ===
    'income' ?
      Number(walletData.totalIncome) +
      amount :
      Number(walletData.totalExpenses) +
      amount

    await updateDoc(
      walletRef,
      {
        amount: updatedWalletAmount,
        [updatedType]: updatedTotals
      }
    )

    return {
      success: true,
    }
  } catch (error: any) {
    console.log(
      'error updating wallet for new transaction: ',
      error
    )
    return {
      success: false,
      msg: error?.message
    }
  }
}

const revertAndUpdateWallet = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string,
) => {
  try {
    const originalWalletSnapshot = await getDoc(doc(
      firestore,
      'wallets',
      oldTransaction.walletId
    ))
    const originalWallet = originalWalletSnapshot.data() as WalletType
    let newWalletSnapshot = await getDoc(doc(
      firestore,
      'wallets',
      newWalletId
    ))
    let newWallet = newWalletSnapshot.data() as WalletType

    const revertType = oldTransaction.type ===
    'income' ? 'totalIncome' : 'totalExpenses'

    const revertIncomeExpense = oldTransaction.type ===
    'income' ?
      -Number(oldTransaction.amount)
      : Number(oldTransaction.amount)

    // wallet amount, after the transaction is removed
    const revertedWalletAmount = Number(originalWallet.amount) +
      revertIncomeExpense

    const revertedIncomeExpenseAmount = Number(originalWallet[revertType]) -
      Number(oldTransaction.amount)

    // if a user tries to convert income to expense on the same wallet
    // or if a user tries to increase the expense amount on a wallet with insufficient balance
    if (newTransactionType ===
      'expense') {
      if (
        oldTransaction.walletId ===
        newWalletId
        &&
        revertedWalletAmount <
        Number(newTransactionAmount)
      ) {
        return {
          success: false,
          msg: 'The selected wallet does not have enough balance'
        }
      }

      // if a user tries to add expense from a new wallet but the wallet don't have enough balance
      if (newWallet.amount! <
        Number(newTransactionAmount)) {
        return {
          success: false,
          msg: 'The selected wallet does not have enough balance'
        }
      }
    }

    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount
    })

    /////////////////////////////////////////////////////////////////
    // refetch the new wallet because we may have just updated it
    newWalletSnapshot = await getDoc(doc(
      firestore,
      'wallets',
      newWalletId
    ))

    newWallet = newWalletSnapshot.data() as WalletType

    const updatedType = newTransactionType ===
    'income' ? 'totalIncome' : 'totalExpenses'

    const updatedTransactionAmount = newTransactionType ===
    'income'
      ? Number(newTransactionAmount)
      : -Number(newTransactionAmount)

    const newWalletAmount = Number(newWallet.amount) +
      updatedTransactionAmount

    const newIncomeExpenseAmount = Number(newWallet[updatedType]! +
      Number(newTransactionAmount))

    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updatedType]: newIncomeExpenseAmount
    })

    return {
      success: true,
    }
  } catch (error: any) {
    console.log(
      'error updating wallet for new transaction: ',
      error
    )
    return {
      success: false,
      msg: error?.message
    }
  }
}

export const deleteTransaction = async (
  transactionId: string,
  walletId: string,
): Promise<ResponseType> => {
  try {
    const transactionRef = doc(
      firestore,
      'transactions',
      transactionId,
    )
    const transactionSnapshot = await getDoc(
      transactionRef
    )
    if (!transactionSnapshot.exists()) {
      return {
        success: false,
        msg: 'Transaction not found'
      }
    }
    const transactionData = transactionSnapshot.data() as TransactionType

    const transactionType = transactionData.type
    const transactionAmount = transactionData.amount

    // fetch wallet to update amount, totalincome or totalExpenses
    const walletSnapshot = await getDoc(
      doc(
        firestore,
        'wallets',
        walletId,
      )
    )
    if (!walletSnapshot.exists()) {
      return {
        success: false,
        msg: 'Wallet not found'
      }
    }
    const walletData = walletSnapshot.data() as WalletType

    // check fields to be updated based on a transaction type
    const updateType = transactionType ===
    'income' ? 'totalIncome' : 'totalExpenses'

    const newWalletAmount = walletData?.amount! -
      (
        transactionType ===
        'income' ? transactionAmount : -transactionAmount
      )

    const newIncomeExpenseAmount = walletData[updateType]! -
      transactionAmount

    // if it's expense and the wallet amount can go below zero
    if (transactionType ===
      'expense' &&
      newWalletAmount <
      0) {
      return {
        success: false,
        msg: 'You can not delete this transaction'
      }
    }

    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount
    })

    await deleteDoc(transactionRef)

    return {
      success: true,
      msg: 'Wallet deleted successfully'
    }
  } catch (error: any) {
    console.log(
      'error deleting wallet: ',
      error
    )
    return {
      success: false,
      msg: error?.message
    }
  }
}

export const fetchWeeklyStats = async (
  uid: string,
): Promise<ResponseType> => {
  try {
    const db = firestore
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() -
      7)

    const transactionQuery = query(
      collection(
        db,
        'transactions'
      ),
      where(
        'date',
        '>=',
        Timestamp.fromDate(sevenDaysAgo)
      ),
      where(
        'date',
        '<=',
        Timestamp.fromDate(today)
      ),
      orderBy(
        'date',
        'desc'
      ),
      where(
        'uid',
        '==',
        uid
      )
    )

    const querySnapshot = await getDocs(transactionQuery)
    const weeklyData = getLast7Days()

    const transactions: TransactionType[] = []

    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType
      transaction.id = doc.id
      transactions.push(transaction)

      const transactionDate = (
        transaction.date as Timestamp
      )
        .toDate()
        .toISOString()
        .split('T')[0]

      const dayData = weeklyData.find(
        (day) => day.date ===
          transactionDate
      )

      if (dayData) {
        if (transaction.type ===
          'income') {
          dayData.income += transaction.amount
        } else {
          if (transaction.type ===
            'expense') {
            dayData.expense += transaction.amount
          }
        }
      }
    })

    const stats = weeklyData.flatMap((day) => [
      {
        value: day.income,
        label: day.day,
        spacing: scale(4),
        labelWidth: scale(30),
        frontColor: colors.primary,
      },
      {
        value: day.expense,
        frontColor: colors.rose
      }
    ])

    return {
      success: true,
      data: {
        stats,
        transactions,
      }
    }
  } catch (error: any) {
    console.log(
      'error fetching weekly stats: ',
      error
    )
    return {
      success: false,
      msg: error?.message
    }
  }
}

export const fetchMonthlyStats = async (
  uid: string,
): Promise<ResponseType> => {
  try {
    const db = firestore
    const today = new Date()
    const twelveMonthsAgo = new Date(today)
    twelveMonthsAgo.setDate(today.getMonth() - 12)

    const transactionQuery = query(
      collection(
        db,
        'transactions'
      ),
      where(
        'date',
        '>=',
        Timestamp.fromDate(twelveMonthsAgo)
      ),
      where(
        'date',
        '<=',
        Timestamp.fromDate(today)
      ),
      orderBy(
        'date',
        'desc'
      ),
      where(
        'uid',
        '==',
        uid
      )
    )

    const querySnapshot = await getDocs(transactionQuery)
    const monthlyData = getLast12Months()

    const transactions: TransactionType[] = []

    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType
      transaction.id = doc.id
      transactions.push(transaction)

      const transactionDate = (
        transaction.date as Timestamp
      )
        .toDate()
      const monthName = transactionDate.toLocaleString('default', {
        month: 'short',
      })
      const shortYear = transactionDate.getFullYear().toString().slice(-2)

      const monthData = monthlyData.find(
        (month) => month.month ===
          `${monthName} ${shortYear}`
      )

      if (monthData) {
        if (transaction.type ===
          'income') {
          monthData.income += transaction.amount
        } else {
          if (transaction.type ===
            'expense') {
            monthData.expense += transaction.amount
          }
        }
      }
    })

    const stats = monthlyData.flatMap((month) => [
      {
        value: month.income,
        label: month.month,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary,
      },
      {
        value: month.expense,
        frontColor: colors.rose
      }
    ])

    return {
      success: true,
      data: {
        stats,
        transactions,
      }
    }
  } catch (error: any) {
    console.log(
      'error fetching monthly stats: ',
      error
    )
    return {
      success: false,
      msg: error?.message
    }
  }
}

export const fetchYearlyStats = async (
  uid: string,
): Promise<ResponseType> => {
  try {
    const db = firestore

    const transactionQuery = query(
      collection(
        db,
        'transactions'
      ),
      orderBy(
        'date',
        'desc'
      ),
      where(
        'uid',
        '==',
        uid
      )
    )

    const querySnapshot = await getDocs(transactionQuery)
    const transactions: TransactionType[] = []

    const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
      const transactionDate = doc.data().date.toDate()
      return transactionDate < earliest ? transactionDate : earliest
    }, new Date())

    const firstYear = firstTransaction.getFullYear()
    const currentYear = new Date().getFullYear()

    const yearlyData = getYearsRange(firstYear, currentYear)

    querySnapshot.forEach((doc) => {
      const transaction = doc.data() as TransactionType
      transaction.id = doc.id
      transactions.push(transaction)

      const transactionYear = (
        transaction.date as Timestamp
      )
        .toDate()
        .getFullYear()

      const yearData = yearlyData.find(
        (year: any) => year.year ===
          transactionYear.toString()
      )

      if (yearData) {
        if (transaction.type ===
          'income') {
          yearData.income += transaction.amount
        } else {
          if (transaction.type ===
            'expense') {
            yearData.expense += transaction.amount
          }
        }
      }
    })

    const stats = yearlyData.flatMap((year: any) => [
      {
        value: year.income,
        label: year.year,
        spacing: scale(4),
        labelWidth: scale(35),
        frontColor: colors.primary,
      },
      {
        value: year.expense,
        frontColor: colors.rose
      }
    ])

    return {
      success: true,
      data: {
        stats,
        transactions,
      }
    }
  } catch (error: any) {
    console.log(
      'error fetching yearly stats: ',
      error
    )
    return {
      success: false,
      msg: error?.message
    }
  }
}

