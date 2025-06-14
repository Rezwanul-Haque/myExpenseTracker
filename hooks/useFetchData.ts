import {
  collection,
  onSnapshot,
  query,
  QueryConstraint
} from '@firebase/firestore'
import {
  useEffect,
  useState
} from 'react'
import { firestore } from '@/config/firebase'

export const useFetchData = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(
    () => {
      if (!collectionName) return
      const collectionRef = collection(
        firestore,
        collectionName
      )

      const q = query(collectionRef, ...constraints)

      const unsub = onSnapshot(q, (snapshot) => {
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]

        setData(fetchedData)
        setLoading(false)
        setError(null)
      }, (error) => {
        console.log('Error fetching data', error)
        setError(error.message)
        setLoading(false)
      })

      return () => unsub()
    },
    []
  )

  return {
    data,
    loading,
    error
  }
}