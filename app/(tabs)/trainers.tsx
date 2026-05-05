import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocale } from '@/lib/i18n';

export default function TrainersScreen() {
  const { t } = useLocale();
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.heading}>
        {t('tabs.trainers')} — {t('common.comingSoon')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
  },
});
