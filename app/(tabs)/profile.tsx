import {
  Alert,
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
import Header from '@/components/Header'
import Typography from '@/components/Typography'
import { useAuth } from '@/contexts/authContext'
import { Image } from 'expo-image'
import { getProfileImage } from '@/services/imageService'
import { accountOptionType } from '@/types'
import Icons from '@/assets/icons'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'

const Profile = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const accountOptions: accountOptionType[] = [
    {
      title: "Edit Profile",
      icon:
        <Icons.User
          size={26}
          color={colors.white}
          weight="fill"
        />
      ,
      routeName: '/(modals)/profileModal',
      bgColor: '#6366f1'
    },
    {
      title: "Settings",
      icon:
        <Icons.GearSix
          size={26}
          color={colors.white}
          weight="fill"
        />
      ,
      // routeName: '/(modals)/profileModal',
      bgColor: '#059669'
    },
    {
      title: "Privacy Policy",
      icon:
        <Icons.Lock
          size={26}
          color={colors.white}
          weight="fill"
        />
      ,
      // routeName: '/(modals)/profileModal',
      bgColor: colors.neutral600
    },
    {
      title: "Logout",
      icon:
        <Icons.Power
          size={26}
          color={colors.white}
          weight="fill"
        />
      ,
      // routeName: '/(modals)/profileModal',
      bgColor: '#e11d48'
    }
  ]

  const showLogoutAlert = () => {
    Alert.alert('Confirm', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => console.log('cancel logout'),
        style: 'cancel'
      },
      {
        text: 'Logout',
        onPress: () => logout(),
        style: 'destructive'
      }
    ])
  }
  const handlePress = (option: accountOptionType) => {
    if (option.title === 'Logout') {
      showLogoutAlert()
    }
    if (option.routeName) router.push(option.routeName)
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Profile" style={{ marginVertical: spacingY._10}} />

        {/*User Info*/}
        <View style={styles.userInfo}>
          {/*avatar*/}
          <View>
            {/*user image*/}
            <Image
              source={getProfileImage(user?.image)}
              style={styles.avatar}
              contentFit="cover"
              transition={100}

            />
          </View>
          {/*name & email*/}
          <View style={styles.namedContainer}>
            <Typography size={24} fontWeight={"600"} color={colors.neutral100}>{user?.name}</Typography>
            <Typography size={15} color={colors.neutral400}>{user?.email}</Typography>
          </View>
        </View>

        {/*Account Options*/}
        <View style={styles.accountOptions}>
          {accountOptions.map((option, index) => (
            <Animated.View
              entering={
                FadeInDown.delay(index * 50)
                          .springify()
                          .damping(14)
              }
              style={styles.listItem}
              key={index.toString()}
            >
              <TouchableOpacity style={styles.flexRow} onPress={() => handlePress(option)}>
                <View style={[styles.listIcon, { backgroundColor: option?.bgColor }]}>
                  {option.icon && option.icon}
                </View>
                <Typography size={16} style={{ flex: 1 }} fontWeight={"500"}>{option.title}</Typography>
                <Icons.CaretRight
                  size={verticalScale(20)}
                  color={colors.white}
                  weight="bold"
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: 'center',
    gap: spacingY._15,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    // overflow: 'hidden',
    // position: 'relative',
  },
  editIcon: {
    position: 'relative',
    bottom: 0,
    right: 0,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    padding: 5
  },
  namedContainer: {
    gap: verticalScale(4),
    alignItems: 'center',
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius._15,
    borderCurve: 'continuous',
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10,
  }
})
