import { gql, useQuery } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { StatusBadge } from '@/components/ui/status-badge';
import { BrandColors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { type TranslationKey, useLocale } from '@/lib/i18n';

// ─── GraphQL ───────────────────────────────────────────────────────────────────

const MEMBERS_WITH_SUBSCRIPTIONS_QUERY = gql`
  query Members($status: String) {
    members(status: $status) {
      id
      firstName
      lastName
      email
      phoneNumber
      currentStatus
      memberSince
      memberUntil
      createdAt
      subscriptions(active: false) {
        id
        agreedPrice
        paymentStatus
        active
        startDate
        endDate
        createdAt
      }
    }
  }
`;

// Fallback used when the nested `subscriptions` resolver errors out server-side.
const MEMBERS_BASIC_QUERY = gql`
  query MembersBasic($status: String) {
    members(status: $status) {
      id
      firstName
      lastName
      email
      phoneNumber
      currentStatus
      memberSince
      memberUntil
      createdAt
    }
  }
`;

// ─── types ─────────────────────────────────────────────────────────────────────

interface SubscriptionRow {
  id: string;
  agreedPrice: string;
  paymentStatus: string;
  active: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface MemberRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  currentStatus: string;
  memberSince: string;
  memberUntil: string | null;
  createdAt: string;
  subscriptions?: SubscriptionRow[];
}

interface MembersQueryData {
  members: MemberRow[];
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED';
const STATUS_FILTERS: StatusFilter[] = ['ALL', 'ACTIVE', 'INACTIVE', 'DELETED'];
const STATUS_FILTER_LABEL_KEYS: Record<StatusFilter, TranslationKey> = {
  ALL: 'members.statusAll',
  ACTIVE: 'members.statusActive',
  INACTIVE: 'members.statusInactive',
  DELETED: 'members.statusDeleted',
};

// ─── helpers ───────────────────────────────────────────────────────────────────

function formatDate(value: string | null, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatCurrency(value: string, locale: string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(num);
}

function isExpired(memberUntil: string | null): boolean {
  if (!memberUntil) return false;
  return new Date(memberUntil).getTime() < Date.now();
}

function statusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return BrandColors.light.statusActive;
    case 'INACTIVE':
      return BrandColors.light.statusInactive;
    case 'DELETED':
      return BrandColors.light.statusDeleted;
    default:
      return BrandColors.light.onSurfaceVariant;
  }
}

function paymentStatusColor(status: string): string {
  switch (status) {
    case 'REVIEWED':
      return BrandColors.light.paymentPaid;
    case 'IN_REVIEW':
      return BrandColors.light.paymentInReview;
    case 'NOT_PAID':
      return BrandColors.light.paymentOverdue;
    default:
      return BrandColors.light.onSurfaceVariant;
  }
}

// ─── component ─────────────────────────────────────────────────────────────────

export default function MembersScreen() {
  const { t, locale } = useLocale();
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ACTIVE');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Starts optimistic; flips to false the first time the subscriptions sub-query
  // fails, so the list still renders. Flips back to true whenever the filter
  // changes, so a backend fix is picked up automatically on the next fetch.
  const [includeSubscriptions, setIncludeSubscriptions] = useState(true);

  const variables = statusFilter === 'ALL' ? {} : { status: statusFilter };
  const query = includeSubscriptions ? MEMBERS_WITH_SUBSCRIPTIONS_QUERY : MEMBERS_BASIC_QUERY;

  const { data, loading, error, refetch } = useQuery<MembersQueryData>(query, {
    variables,
    skip: !isAdmin,
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (includeSubscriptions && error && !data?.members) {
      setIncludeSubscriptions(false);
    }
  }, [includeSubscriptions, error, data]);

  useEffect(() => {
    setIncludeSubscriptions(true);
    setExpandedId(null);
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const members = data?.members ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => {
      const name = `${m.firstName} ${m.lastName}`.toLowerCase();
      return name.includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [data, search]);

  if (!isAdmin) {
    return (
      <View style={s.center}>
        <MaterialIcons name="lock-outline" size={32} color={BrandColors.light.onSurfaceVariant} />
        <Text style={s.centerText}>{t('members.adminOnly')}</Text>
      </View>
    );
  }

  const isInitialLoading = loading && !data;
  const isBlockingError = !loading && !data?.members;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>{t('tabs.members')}</Text>

        <View style={s.searchRow}>
          <MaterialIcons name="search" size={18} color={BrandColors.light.onSurfaceVariant} />
          <TextInput
            style={s.searchInput}
            placeholder={t('members.searchPlaceholder')}
            placeholderTextColor={BrandColors.light.onSurfaceVariant}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t('members.searchPlaceholder')}
          />
        </View>

        <View style={s.filterRow} accessibilityRole="tablist">
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setStatusFilter(f)}
                style={[s.filterChip, active && s.filterChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                  {t(STATUS_FILTER_LABEL_KEYS[f])}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isInitialLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={BrandColors.light.primary} />
        </View>
      ) : isBlockingError ? (
        <View style={s.center}>
          <MaterialIcons name="error-outline" size={28} color={BrandColors.light.error} />
          <Text style={s.centerText}>{t('members.loadError')}</Text>
          <Pressable style={s.retryBtn} onPress={() => refetch()} accessibilityRole="button">
            <Text style={s.retryBtnText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={filtered}
            keyExtractor={m => m.id}
            contentContainerStyle={s.listContent}
            accessibilityRole="list"
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => refetch()}
                colors={[BrandColors.light.primary]}
                tintColor={BrandColors.light.primary}
              />
            }
            ListEmptyComponent={
              <View style={s.center}>
                <MaterialIcons name="people-outline" size={32} color={BrandColors.light.onSurfaceVariant} />
                <Text style={s.centerText}>{t('members.empty')}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <MemberCard
                member={item}
                locale={locale}
                expanded={expandedId === item.id}
                subscriptionsAvailable={includeSubscriptions}
                onToggle={() => setExpandedId(id => (id === item.id ? null : item.id))}
                t={t}
              />
            )}
          />
          {!includeSubscriptions && (
            <View style={s.degradedNotice}>
              <MaterialIcons name="info-outline" size={14} color={BrandColors.light.onSurfaceVariant} />
              <Text style={s.degradedNoticeText}>{t('members.subscriptionsUnavailable')}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ─── member card ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: MemberRow;
  locale: string;
  expanded: boolean;
  subscriptionsAvailable: boolean;
  onToggle: () => void;
  t: (key: TranslationKey) => string;
}

function MemberCard({ member, locale, expanded, subscriptionsAvailable, onToggle, t }: MemberCardProps) {
  const deleted = member.currentStatus === 'DELETED';
  const displayName = deleted ? t('members.anonymized') : `${member.firstName} ${member.lastName}`;
  const expired = !deleted && isExpired(member.memberUntil);
  const subscriptions = member.subscriptions ?? [];

  return (
    <View style={c.card}>
      <View style={c.headerRow}>
        <View style={c.headerText}>
          <Text style={c.name}>{displayName}</Text>
          {!deleted && <Text style={c.email}>{member.email}</Text>}
        </View>
        <View style={c.badges}>
          <StatusBadge label={member.currentStatus} color={statusColor(member.currentStatus)} />
          {expired && <StatusBadge label={t('members.expiredBadge')} color={BrandColors.light.warning} />}
        </View>
      </View>

      {!deleted && (
        <View style={c.metaRow}>
          <View style={c.metaItem}>
            <MaterialIcons name="event-available" size={14} color={BrandColors.light.onSurfaceVariant} />
            <Text style={c.metaText}>
              {t('members.sinceLabel')} {formatDate(member.memberSince, locale)}
            </Text>
          </View>
          {member.memberUntil && (
            <View style={c.metaItem}>
              <MaterialIcons name="event-busy" size={14} color={BrandColors.light.onSurfaceVariant} />
              <Text style={c.metaText}>
                {t('members.untilLabel')} {formatDate(member.memberUntil, locale)}
              </Text>
            </View>
          )}
          <View style={c.metaItem}>
            <MaterialIcons name="phone" size={14} color={BrandColors.light.onSurfaceVariant} />
            <Text style={c.metaText}>{member.phoneNumber ?? t('members.noPhone')}</Text>
          </View>
        </View>
      )}

      {!deleted && subscriptionsAvailable && (
        <Pressable style={c.toggleRow} onPress={onToggle} accessibilityRole="button">
          <Text style={c.toggleText}>
            {expanded ? t('members.hideSubscriptions') : t('members.viewSubscriptions')}
            {subscriptions.length > 0 ? ` (${subscriptions.length})` : ''}
          </Text>
          <MaterialIcons
            name={expanded ? 'expand-less' : 'expand-more'}
            size={18}
            color={BrandColors.light.primary}
          />
        </Pressable>
      )}

      {!deleted && subscriptionsAvailable && expanded && (
        <View style={c.subscriptions}>
          {subscriptions.length === 0 ? (
            <Text style={c.noSubs}>{t('members.noSubscriptions')}</Text>
          ) : (
            subscriptions.map(sub => (
              <View key={sub.id} style={c.subRow}>
                <View style={c.subRowTop}>
                  <Text style={c.subPrice}>{formatCurrency(sub.agreedPrice, locale)}</Text>
                  <StatusBadge label={sub.paymentStatus} color={paymentStatusColor(sub.paymentStatus)} />
                </View>
                <Text style={c.subDates}>
                  {formatDate(sub.startDate, locale)} – {formatDate(sub.endDate, locale)}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.light.background },
  header: {
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.light.outline,
  },
  title: { fontSize: 20, fontWeight: '800', color: BrandColors.light.onSurface },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: BrandColors.light.outline,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: BrandColors.light.onSurface, padding: 0 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: BrandColors.light.outline,
  },
  filterChipActive: { backgroundColor: BrandColors.light.primary, borderColor: BrandColors.light.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: BrandColors.light.onSurfaceVariant },
  filterChipTextActive: { color: BrandColors.light.navBar },
  listContent: { padding: Spacing.md, gap: Spacing.sm, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: Spacing.xl },
  centerText: { fontSize: 13, color: BrandColors.light.onSurfaceVariant, textAlign: 'center' },
  retryBtn: {
    marginTop: 4,
    backgroundColor: BrandColors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: { color: BrandColors.light.navBar, fontWeight: '700', fontSize: 13 },
  degradedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: BrandColors.light.surfaceVariant,
    borderTopWidth: 1,
    borderTopColor: BrandColors.light.outline,
  },
  degradedNoticeText: { fontSize: 11, color: BrandColors.light.onSurfaceVariant, flex: 1 },
});

const c = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.light.outline,
    padding: Spacing.md,
    gap: 10,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  headerText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: BrandColors.light.onSurface },
  email: { fontSize: 12, color: BrandColors.light.onSurfaceVariant, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: BrandColors.light.onSurfaceVariant },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BrandColors.light.outline,
    paddingTop: 8,
  },
  toggleText: { fontSize: 12, fontWeight: '700', color: BrandColors.light.primary },
  subscriptions: { gap: 8, marginTop: 2 },
  noSubs: { fontSize: 12, color: BrandColors.light.onSurfaceVariant, fontStyle: 'italic' },
  subRow: {
    backgroundColor: BrandColors.light.surfaceVariant,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  subRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subPrice: { fontSize: 13, fontWeight: '700', color: BrandColors.light.onSurface },
  subDates: { fontSize: 12, color: BrandColors.light.onSurfaceVariant },
});
