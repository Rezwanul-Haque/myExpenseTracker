import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import {
  AuthContextType,
  UserType
} from '@/types'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from '@firebase/auth'
import {
  auth,
  firestore
} from '@/config/firebase'
import {
  doc,
  getDoc,
  setDoc
} from '@firebase/firestore'
import { useRouter } from 'expo-router'

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [user, setUser] = useState<UserType>(null)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: UserType = {
          uid: firebaseUser?.uid,
          email: firebaseUser?.email || null,
          name: firebaseUser?.displayName || null,
          image: firebaseUser.photoURL || null
        }
        setUser(userData)
        updateUserData(firebaseUser.uid)
        router.replace('/(tabs)')
      } else {
        setUser(null)
        router.replace('/(auth)/welcome')
      }
    })

    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return {
        success: true
      }
    } catch (error: any) {
      let msg = error.message
      console.log("error message: ", msg)
      if (msg.includes("(auth/invalid-email)")) {
        msg = "Wrong email"
      }
      if (msg.includes("(auth/invalid-credentials)")) {
        msg = "Wrong email or password"
      }
      return {
        success: false,
        msg
      }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string
  ) =>   {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(firestore, 'users', response?.user?.uid), {
        name,
        email,
        uid: response?.user?.uid
      })
      return {
        success: true
      }
    } catch (error: any) {
      let msg = error.message
      console.log("error message: ", msg)
      if (msg.includes("(auth/email-already-in-use)")) {
        msg = "Email already in use"
      }
      if (msg.includes("(auth/invalid-credential)")) {
        msg = "Wrong email or password"
      }
      return {
        success: false,
        msg
      }
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const updateUserData = async (userId: string) => {
    try {
      const docRef = doc(firestore, 'users', userId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        const userData: UserType = {
          uid: data?.uid,
          email: data.email || null,
          name: data.name || null,
          image: data.image || null
        }
        setUser({...userData})
      }

      await setDoc(docRef, {
        uid: userId
      }, { merge: true })
    } catch (error: any) {
      const msg = error.message
      console.log("error occurred when updating the user data: ", msg)
    }
  }

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
    logout
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider')
  }
  return context
}
