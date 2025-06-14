import {
  ResponseType,
  WalletType
} from '@/types'
import { uploadFileToCloudinary } from '@/services/imageService'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch
} from '@firebase/firestore'
import { firestore } from '@/config/firebase'

export const createOrUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResponseType> => {
  try {
    const walletToSave = {...walletData}

    if (walletData.image) {
      const imageUploadRes = await uploadFileToCloudinary(walletData.image, "wallets")
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || 'Failed to upload wallet icon',
        }
      }
      walletToSave.image = imageUploadRes.data
    }

    if (!walletData?.id) {
      // new wallet
      walletToSave.amount = 0
      walletToSave.totalIncome = 0
      walletToSave.totalExpenses = 0
      walletToSave.created = new Date()
    }

    const walletRef = walletData?.id ? doc(
      firestore,
      'wallets',
      walletData.id
    ) : doc(collection(firestore, 'wallets'))

    await setDoc(walletRef, walletToSave, { merge: true }) // updates only the data provided

    return {
      success: true,
      data: {...walletToSave, id: walletRef.id },
      msg: 'Wallet created successfully'
    }
  } catch (error: any) {
    console.log('error creating or updating wallet: ', error);
    return {
      success: false,
      msg: error?.message
    }
  }
}

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, 'wallets', walletId)
    await deleteDoc(walletRef)

    deleteTransactionByWalletId(walletId)

    return {
      success: true,
      msg: 'Wallet deleted successfully'
    }
  } catch (error: any) {
    console.log('error deleting wallet: ', error);
    return {
      success: false,
      msg: error?.message
    }
  }
}

export const deleteTransactionByWalletId = async (walletId: string): Promise<ResponseType> => {
  try {
    let hasMoreTransactions = true
    while (hasMoreTransactions) {
      const transactionQuery = query(
        collection(
          firestore,
          'transactions'
        ),
        where(
          'walletId',
          '==',
          walletId
        ),
      )

      const transactionsSnapshots = await getDocs(transactionQuery)
      if (transactionsSnapshots.size === 0) {
        hasMoreTransactions = false
        break
      }

      const batch = writeBatch(firestore)

      transactionsSnapshots.forEach((transactionSnapshot) => {
        batch.delete(transactionSnapshot.ref)
      })
      await batch.commit()

      console.log(`${transactionsSnapshots.size} transactions deleted in this batch`)
    }

    return {
      success: true,
      msg: 'All transactions deleted successfully'
    }
  } catch (error: any) {
    console.log('error deleting all the transactions of this wallet: ', error);
    return {
      success: false,
      msg: error?.message
    }
  }
}

