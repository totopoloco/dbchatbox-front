import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { BrandColors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/i18n';

// ─── data ──────────────────────────────────────────────────────────────────────

interface TrainingSlot {
  day: string;
  hours: string;
  group: string;
}
interface Venue {
  id: string;
  name: string;
  fullName: string;
  address: string;
  times: TrainingSlot[];
}

const VENUES: Venue[] = [
  {
    id: 'leberberg',
    name: 'Leberberg',
    fullName: 'Leberberg – Bruno-Kreisky-Schule',
    address: '1110 Wien, Svetelskystraße 4–6',
    times: [
      { day: 'Mo', hours: '18:30–20:30', group: 'Nachwuchs, Anfänger' },
      { day: 'Di', hours: '18:00–20:00', group: 'Nachwuchs, 3 fortgeschrittene Gruppen' },
      { day: 'Mi', hours: '18:00–20:00', group: 'Erwachsene, auch Hobbyspieler' },
      { day: 'Fr', hours: '18:00–20:00', group: 'Nachwuchs, Alter ~6–15 Jahre' },
      { day: 'Sa', hours: '14:30–17:45', group: 'Nachwuchs + freies Spiel Erwachsene' },
    ],
  },
  {
    id: 'volksschule',
    name: 'Volksschule',
    fullName: 'Volksschule – Wilhelm-Kreß-Platz',
    address: '1110 Wien, Wilhelm-Kreß-Platz 32',
    times: [
      { day: 'Mo', hours: '18:00–21:00', group: 'Fortgeschrittene Hobbyspieler' },
      { day: 'Di', hours: '18:00–21:00', group: 'Hobbyspieler' },
      { day: 'Mi', hours: '16:00–18:00', group: 'Geleitetes Badminton, besondere Bedürfnisse' },
    ],
  },
  {
    id: 'simmering',
    name: 'Sporthalle Simmering',
    fullName: 'Sporthalle Simmering',
    address: '1100 Wien, Florian Hedorfer Straße 24',
    times: [{ day: 'Mo', hours: '17:30–19:00', group: 'Nachwuchs, Alter ~6–15 Jahre' }],
  },
  {
    id: 'hopsagasse',
    name: 'Hopsagasse 7',
    fullName: 'Sporthalle Hopsagasse 7',
    address: '1200 Wien, Sporthalle Hopsagasse 7',
    times: [
      { day: 'Mo', hours: '18:00–20:00', group: 'Bundesligatraining + Top-Nachwuchskader' },
      { day: 'Do', hours: '16:30–18:00', group: 'Nachwuchs, Alter ~7–13 Jahre' },
      { day: 'Do', hours: '17:30–19:30', group: 'Bundes- und Landesligaspieler' },
    ],
  },
  {
    id: 'sawi',
    name: 'SAWI Sportarena',
    fullName: 'SAWI Sportarena Wien',
    address: '1020 Wien, Stephanie-Endres-Straße 3',
    times: [
      { day: 'Di', hours: '14:30–16:30', group: 'Nachwuchs, Alter ~5–8 Jahre' },
      { day: 'Do', hours: '20:00–22:00', group: 'Erwachsene, auch Hobbyspieler' },
    ],
  },
];

interface ContactItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}

const W = 1100;

// ─── component ─────────────────────────────────────────────────────────────────

export default function PortalHome() {
  const router = useRouter();
  const { session } = useAuth();
  const { t } = useLocale();
  const [activeVenueId, setActiveVenueId] = useState<string>('leberberg');

  const isAuthenticated = !!session;
  const activeVenue = VENUES.find(v => v.id === activeVenueId) ?? VENUES[0];

  const goToPortal = () => router.replace('/(tabs)/chat');
  const goToLogin = () => router.push('/(auth)/login');

  const heroStats = [
    { value: '1962', label: t('hero.statFounded') },
    { value: '250+', label: t('hero.statMembers') },
    { value: '1. BL', label: t('hero.statLeague') },
  ];

  const contactItems: ContactItem[] = [
    { icon: 'phone', label: t('contact.phone'), value: '+43 699 197 201 13' },
    { icon: 'email', label: t('contact.email'), value: 'badminton@watsimmering.at' },
    { icon: 'camera-alt', label: t('contact.instagram'), value: '@watsimmering' },
    { icon: 'public', label: t('contact.socialMedia'), value: '@watsimmering' },
  ];

  const memberSteps = [
    { n: '1', title: t('membership.step1Title'), body: t('membership.step1Body') },
    { n: '2', title: t('membership.step2Title'), body: t('membership.step2Body') },
    { n: '3', title: t('membership.step3Title'), body: t('membership.step3Body') },
  ];

  return (
    <View style={s.root}>
      {/* ─── Navigation bar ─── */}
      <View style={s.nav}>
        <View style={s.navInner}>
          <View style={s.navBrand}>
            <Text style={s.navBrandWat}>WAT</Text>
            <View style={s.navBrandBar} />
            <Text style={s.navBrandSim}>SIMMERING</Text>
          </View>

          <View style={s.navLinks}>
            <Text style={s.navLink}>{t('nav.badminton')}</Text>
            <Text style={s.navLink}>{t('nav.training')}</Text>
            <Text style={s.navLink}>{t('nav.membership')}</Text>
            <Text style={s.navLink}>{t('nav.contact')}</Text>
          </View>

          <View style={s.navRight}>
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Pressable
                style={({ pressed }) => [s.navBtn, pressed && s.navBtnPressed]}
                onPress={goToPortal}>
                <MaterialIcons name="dashboard" size={14} color={BrandColors.light.navBar} />
                <Text style={s.navBtnText}>{t('nav.myPortal')}</Text>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [s.navBtn, pressed && s.navBtnPressed]}
                onPress={goToLogin}>
                <Text style={s.navBtnText}>{t('nav.signIn')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── Hero ─── */}
        <View style={s.hero}>
          <View style={s.heroContent}>
            <Text style={s.heroEyebrow}>{t('hero.eyebrow')}</Text>
            <Text style={s.heroHeading}>{t('hero.heading')}</Text>
            <Text style={s.heroTagline}>{t('hero.tagline')}</Text>

            <View style={s.heroStats}>
              {heroStats.map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <View style={s.statDivider} />}
                  <View style={s.stat}>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={s.statLabel}>{stat.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            <View style={s.heroBtns}>
              <Pressable
                style={({ pressed }) => [s.btnGold, pressed && s.btnGoldPressed]}
                onPress={isAuthenticated ? goToPortal : goToLogin}>
                <Text style={s.btnGoldText}>
                  {isAuthenticated ? t('hero.ctaPortal') : t('hero.ctaMember')}
                </Text>
              </Pressable>
              <TouchableOpacity style={s.btnOutline} activeOpacity={0.75}>
                <Text style={s.btnOutlineText}>{t('hero.ctaTraining')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── Trainingszeiten ─── */}
        <View style={s.section}>
          <View style={s.sectionInner}>
            <Text style={s.pill}>{t('training.pill')}</Text>
            <Text style={s.h2}>{t('training.heading')}</Text>
            <Text style={s.lead}>{t('training.lead')}</Text>

            {/* venue selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.venueTabs}
              contentContainerStyle={s.venueTabsContent}>
              {VENUES.map(v => (
                <Pressable
                  key={v.id}
                  style={[s.venueTab, activeVenueId === v.id && s.venueTabActive]}
                  onPress={() => setActiveVenueId(v.id)}>
                  <Text style={[s.venueTabText, activeVenueId === v.id && s.venueTabTextActive]}>
                    {v.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* venue detail */}
            <View style={s.venueCard}>
              <View style={s.venueCardHead}>
                <MaterialIcons name="location-on" size={18} color={BrandColors.light.primary} />
                <View style={s.venueCardHeadText}>
                  <Text style={s.venueName}>{activeVenue.fullName}</Text>
                  <Text style={s.venueAddress}>{activeVenue.address}</Text>
                </View>
              </View>
              {activeVenue.times.map((t, i) => (
                <View key={i} style={[s.timeRow, i > 0 && s.timeRowBorder]}>
                  <View style={s.dayBadge}>
                    <Text style={s.dayBadgeText}>{t.day}</Text>
                  </View>
                  <Text style={s.timeHours}>{t.hours}</Text>
                  <Text style={s.timeGroup} numberOfLines={2}>
                    {t.group}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ─── Mitglied werden ─── */}
        <View style={s.sectionDark}>
          <View style={s.sectionInner}>
            <Text style={[s.pill, s.pillLight]}>{t('membership.pill')}</Text>
            <Text style={[s.h2, s.h2Light]}>{t('membership.heading')}</Text>
            <Text style={[s.lead, s.leadLight]}>{t('membership.lead')}</Text>

            <View style={s.steps}>
              {memberSteps.map(step => (
                <View key={step.n} style={s.step}>
                  <View style={s.stepCircle}>
                    <Text style={s.stepNum}>{step.n}</Text>
                  </View>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepBody}>{step.body}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [s.btnGold, pressed && s.btnGoldPressed]}
              onPress={isAuthenticated ? goToPortal : goToLogin}>
              <Text style={s.btnGoldText}>
                {isAuthenticated ? t('membership.ctaPortal') : t('membership.ctaSignUp')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ─── Kontakt ─── */}
        <View style={s.section}>
          <View style={s.sectionInner}>
            <Text style={s.pill}>{t('contact.pill')}</Text>
            <Text style={s.h2}>{t('contact.heading')}</Text>
            <View style={s.contactGrid}>
              {contactItems.map(c => (
                <View key={c.label} style={s.contactCard}>
                  <View style={s.contactIconWrap}>
                    <MaterialIcons name={c.icon} size={22} color={BrandColors.light.primary} />
                  </View>
                  <Text style={s.contactCardLabel}>{c.label}</Text>
                  <Text style={s.contactCardValue}>{c.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ─── Footer ─── */}
        <View style={s.footer}>
          <View style={s.footerInner}>
            <View style={s.footerBrand}>
              <Text style={s.footerWat}>WAT</Text>
              <View style={s.footerBar} />
              <Text style={s.footerSim}>SIMMERING</Text>
            </View>
            <Text style={s.footerTagline}>{t('footer.tagline')}</Text>
            <View style={s.footerLinks}>
              {[
                { key: 'imprint', label: t('footer.imprint') },
                { key: 'privacy', label: t('footer.privacy') },
                { key: 'contact', label: t('footer.contact') },
              ].map(l => (
                <Text key={l.key} style={s.footerLink}>
                  {l.label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // layout
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },

  // nav
  nav: {
    backgroundColor: BrandColors.light.navBar,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    zIndex: 10,
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: W,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    height: 64,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBrandWat: {
    color: BrandColors.light.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  navBrandBar: { width: 1, height: 18, backgroundColor: BrandColors.light.primary },
  navBrandSim: { color: '#F4F5F5', fontSize: 13, fontWeight: '600', letterSpacing: 2 },
  navLinks: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  navLink: { color: 'rgba(244,245,245,0.75)', fontSize: 14, fontWeight: '500' },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.light.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 6,
  },
  navBtnPressed: { backgroundColor: BrandColors.light.primaryPressed },
  navBtnText: {
    color: BrandColors.light.navBar,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // hero
  hero: {
    backgroundColor: BrandColors.light.navBar,
    minHeight: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: W,
    width: '100%',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 80,
  },
  heroEyebrow: {
    color: BrandColors.light.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 8,
  },
  heroHeading: {
    color: '#F4F5F5',
    fontSize: Platform.OS === 'web' ? 62 : 38,
    fontWeight: '900',
    letterSpacing: 1,
    lineHeight: Platform.OS === 'web' ? 72 : 46,
    marginBottom: 16,
  },
  heroTagline: {
    color: 'rgba(244,245,245,0.65)',
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 40,
  },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 44 },
  stat: { alignItems: 'center', paddingHorizontal: 24 },
  statValue: { color: BrandColors.light.primary, fontSize: 28, fontWeight: '800' },
  statLabel: {
    color: 'rgba(244,245,245,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.12)' },
  heroBtns: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },

  // buttons
  btnGold: {
    backgroundColor: BrandColors.light.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
  btnGoldPressed: { backgroundColor: BrandColors.light.primaryPressed },
  btnGoldText: {
    color: BrandColors.light.navBar,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: 'rgba(244,245,245,0.35)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
  btnOutlineText: { color: '#F4F5F5', fontSize: 15, fontWeight: '600' },

  // sections
  section: { backgroundColor: '#fff', paddingVertical: 72 },
  sectionDark: { backgroundColor: BrandColors.light.navBar, paddingVertical: 72 },
  sectionInner: {
    maxWidth: W,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pill: {
    color: BrandColors.light.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  pillLight: { color: BrandColors.light.primary },
  h2: { color: BrandColors.light.onSurface, fontSize: 34, fontWeight: '800', marginBottom: 16 },
  h2Light: { color: '#F4F5F5' },
  lead: {
    color: BrandColors.light.onSurfaceVariant,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 32,
    maxWidth: 680,
  },
  leadLight: { color: 'rgba(244,245,245,0.7)' },

  // venue tabs
  venueTabs: { marginBottom: 20 },
  venueTabsContent: { gap: 6 },
  venueTab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BrandColors.light.outline,
  },
  venueTabActive: {
    backgroundColor: BrandColors.light.primary,
    borderColor: BrandColors.light.primary,
  },
  venueTabText: { fontSize: 13, fontWeight: '600', color: BrandColors.light.onSurfaceVariant },
  venueTabTextActive: { color: BrandColors.light.navBar },

  // venue card
  venueCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.light.outline,
    overflow: 'hidden',
  },
  venueCardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Spacing.md,
    backgroundColor: BrandColors.light.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.light.outline,
  },
  venueCardHeadText: { flex: 1 },
  venueName: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.light.onSurface,
    marginBottom: 2,
  },
  venueAddress: { fontSize: 13, color: BrandColors.light.onSurfaceVariant },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: 12,
    backgroundColor: '#fff',
  },
  timeRowBorder: { borderTopWidth: 1, borderTopColor: BrandColors.light.outline },
  dayBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: BrandColors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dayBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  timeHours: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.light.onSurface,
    width: 120,
    flexShrink: 0,
  },
  timeGroup: { flex: 1, fontSize: 13, color: BrandColors.light.onSurfaceVariant, lineHeight: 18 },

  // membership steps
  steps: { flexDirection: 'row', gap: 16, marginBottom: 36, flexWrap: 'wrap' },
  step: {
    flex: 1,
    minWidth: 220,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BrandColors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepNum: { color: BrandColors.light.navBar, fontSize: 16, fontWeight: '800' },
  stepTitle: { color: '#F4F5F5', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  stepBody: { color: 'rgba(244,245,245,0.65)', fontSize: 13, lineHeight: 20 },

  // contact
  contactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  contactCard: {
    flex: 1,
    minWidth: 200,
    borderWidth: 1,
    borderColor: BrandColors.light.outline,
    borderRadius: 12,
    padding: Spacing.md,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.light.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: BrandColors.light.onSurfaceVariant,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contactCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.light.onSurface,
  },

  // footer
  footer: {
    backgroundColor: BrandColors.light.navBar,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 48,
  },
  footerInner: {
    maxWidth: W,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  footerWat: { color: BrandColors.light.primary, fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  footerBar: { width: 1, height: 18, backgroundColor: BrandColors.light.primary },
  footerSim: { color: '#F4F5F5', fontSize: 14, fontWeight: '600', letterSpacing: 2 },
  footerTagline: {
    color: 'rgba(244,245,245,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  footerLinks: { flexDirection: 'row', gap: 24 },
  footerLink: { color: 'rgba(244,245,245,0.5)', fontSize: 13, fontWeight: '500' },
});
