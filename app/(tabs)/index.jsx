import { View, Text, TouchableOpacity } from 'react-native'
import { useAuthStore } from '../../store/authStore'

export default function Home() {
  const { logout } = useAuthStore();

  return (
    <View>
      <Text>Home Tabs</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}