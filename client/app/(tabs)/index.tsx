import { Card } from '@/components/common/card';
import { Header } from '@/components/header';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <>
      <Header title="계약 관리" date={true} />
      <View style={styles.container}>
        <Card />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});
